import { ObjectDescriptor } from "./objectdescriptor.js"

export class NEGetProxy {
  // Private variables
  #traps = null

  // Creates a new Proxy instance around a given object in a quick and
  // easy manner. Normally, providing a good proxy around an object that
  // just needs a few more contextual properties is not a two or three
  // line solution.
  //
  // NEGetProxy aims to restore that simplicity. The types of values
  // that `newProperties` can accept are either an array of arrays or
  // an array of objects. In the array of arrays solution, the expected
  //
  // [[propertyName, value, descriptor, isGetter], ...] 
  //
  // or as an array of objects
  //
  // [{ property, value, descriptor, isGetter }, ...]
  //
  // where:
  //   property   - the name of the property to add to the proxy
  //   value      - this can be any type of value, however if isGetter
  //                is truthy and value is a function, its value will
  //                calculated upon each access
  //   descriptor - a basic descriptor will be provided with true for
  //                `enumerable` and `configurable` unless one is provided
  //                to the constructor. Values for `get`, `set`, and 
  //                `value` will be ignored if supplied.
  //   isGetter   - if truthy, and value is a function, the act of
  //                getting the property will invoke the function and
  //                return its results. Will default to false is not
  //                provided
  constructor(toProxy, newProperties = []) {
    if (!toProxy) {
      throw new TypeError('NEGetProxy must have a valid object to proxy')
    }

    const processedProperties = this.process(newProperties)
    this.target = toProxy
    this.properties = processedProperties

    const result = new Proxy(toProxy, this.proxyTraps)
    this.proxy = result
  } 

  process(inputParameters) {
    const output = []

    const convertObject = object => {
      if (typeof object !== 'object')
        return

      const { property, value, descriptor, isGetter } = object
      const { from, OpenDescriptorInstance } = ObjectDescriptor
      const descriptorObj = from(descriptor) ?? OpenDescriptorInstance

      if ((typeof property !== 'undefined') && (typeof value !== 'undefined')) {
        output.push({
          property, 
          value,
          descriptor: descriptorObj,
          isGetter: !!isGetter,
        })
      }
    }

    const convertArray = array => {
      if (!Array.isArray(array)) 
        return 

      const [property, value, descriptor, isGetter] = array 
      const { from, OpenDescriptorInstance } = ObjectDescriptor
      const descriptorObj = from(descriptor) ?? OpenDescriptorInstance

      if ((typeof property !== 'undefined') && (typeof value !== 'undefined')) {
        output.push({
          property, 
          value,
          descriptor: descriptorObj,
          isGetter: !!isGetter,
        })
      }
    }

    if (!Array.isArray(inputParameters)) {
      convertObject(inputParameters)
    }
    else {
      for (const entry of inputParameters) {
        if (Array.isArray(entry)) 
          convertArray(entry)
        else 
          convertObject(entry)
      }
    }

    return output
  }

  get proxyTraps() {
    if (!this.#traps) {
      this.#traps = { 
        get: this.#proxyGet.bind(this), 
        has: this.#proxyHas.bind(this), 
        set: this.#proxySet.bind(this), 
        deleteProperty: this.#proxyDeleteProperty.bind(this), 
        getOwnPropertyDescriptor: this.#proxyGetOwnPropertyDescriptor.bind(this), 
        defineProperty: this.#proxyGetDefineProperty.bind(this),
      }
    }

    return this.#traps
  }

  getIfHas(property, returnDestructable = false) {
    const index = this.properties.findIndex(entry => entry?.property == property)
    if (!~index) { 
      if (returnDestructable) {
        return { 
          property: undefined, 
          value: undefined, 
          descriptor: undefined,
          isGetter: undefined,
        }
      }

      return null
    }

    return { ...this.properties[index], index }
  }

  #proxyGet(target, prop, receiver) {
    const neProp = this.getIfHas(prop)

    if (neProp) {
      if (neProp.isGetter && typeof neProp.value === 'function') 
        return neProp.value()
      
      return neProp.value
    }
    
    return Reflect.get(target, prop, receiver)
  }

  #proxyHas(target, prop) {
    const { isDescriptorInstance } = ObjectDescriptor
    const { descriptor, property } = this.getIfHas(prop, true)

    if (prop === property && descriptor && isDescriptorInstance(descriptor)) {
      if (descriptor.hasEnumerable && descriptor.isEnumerable)
        return true
    }

    return Reflect.has(target, prop)
  }

  #proxySet(target, prop, newValue, receiver) {
    const { descriptor, index } = this.getIfHas(prop, true)
        
    if (descriptor?.canChange) {
      this.properties[index].value = newValue;
      return true;
    }

    return Reflect.set(target, prop, newValue, receiver)
  }

  #proxyDeleteProperty(target, prop) {
    const { descriptor, index } = this.getIfHas(prop, true)
    
    if (descriptor?.canDelete) {      
      const currentCount = this.properties.length
      this.properties.splice(index, 1)
      return (currentCount > this.properties.length)
    }

    return Reflect.deleteProperty(target, prop)
  }

  #proxyGetOwnPropertyDescriptor(target, prop) {
    const { descriptor, value, isGetter } = this.getIfHas(prop, true)

    if (descriptor) {
      if (isGetter && descriptor.hasGet && descriptor.isAccessor) {
        return { ...descriptor.descriptor, get: value }
      }
      else {
        return { ...descriptor.descriptor, value }
      }
    }

    return Reflect.getOwnPropertyDescriptor(target, prop)
  }

  #proxyGetDefineProperty(target, prop, descriptor) {
    const { descriptor: _descriptor, index } = this.getIfHas(prop, true)

    if (_descriptor?.canChange) {
      const instance = ObjectDescriptor.from(descriptor)
      if (instance?.isAccessor) {
        const { get, set, configurable, enumerable } = descriptor 
        this.properties[index].descriptor = new ObjectDescriptor({
          enumerable, configurable, get, set 
        })        
      }
      else if (instance?.isData) {
        const { value, writable, enumerable, configurable } = descriptor
        this.properties[index].descriptor = new ObjectDescriptor({
          enumerable, configurable, value, writable
        })
      }
      return !!this.properties[index].descriptor
    }

    return Reflect.defineProperty(target, prop, descriptor)
  }

  static for(object, newProps = []) {
    const instance = new NEGetProxy(object, newProps)
    return [instance?.proxy, instance]
  }
}