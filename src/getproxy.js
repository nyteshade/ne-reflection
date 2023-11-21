import { Descriptor } from "./descriptor.js"
import { objectCopy, stripNullish, inspectToolKit } from "./utils.js"

const CustomInspect = Symbol.for('nodejs.util.inspect.custom')

export class GetProxy {
  // Private variables
  #traps = null
  #forceMeta = false
  #hasMeta = false

  /**
   * Creates a new Proxy instwance around a given object in a quick and
   * easy manner. Normally, providing a good proxy around an object that
   * just needs a few more contextual properties is not a two or three
   * line solution.
   *
   * Simply provide an object of key value pairs that will also be
   * referenced when accessing the proxied object. So if you want to do
   * something
   */
  constructor(toProxy, newProperties, { forceMeta } = {}) {
    if (!toProxy) {
      throw new TypeError(`GetProxy must have a valid object to proxy`)
    }

    this.genProperties(newProperties)
    this.target = toProxy
    this.proxy = this.genProxy()

    if (forceMeta) {
      this.#forceMeta = true
      return this
    }

    return this.proxy
  }

  genProperties(fromObject) {
    const [properties, propertiesObj] =
      this.process(fromObject ?? this.propertiesObject)

    this.propertiesObject = propertiesObj
    this.properties = properties
  }

  genProxy(apply = false) {
    const { newDataDescriptor, keysFor, BASE, VISIBLE } = Descriptor
    const proxy = new Proxy(this.target, this.proxyTraps)
    const self = this
    const proxyPrinter = function (depth, opts, inspect) {
      return inspect(new GetProxy.ProxyReplPrinter(proxy, self), { ...opts, depth })
    }

    Object.defineProperties(proxy, {
      [CustomInspect]: newDataDescriptor({ value: proxyPrinter }, BASE),
      [Symbol.toStringTag]: newDataDescriptor({ value: 'GetProxyInstance' }, BASE),
      [GetProxy.META]: newDataDescriptor({ value: this }, VISIBLE),
    })

    if (process.env.NODE_ENV !== 'production' || this.#forceMeta) {
      this.#hasMeta = true
    }
    else {
      delete proxy[GetProxy.META]
    }


    if (apply)
      this.proxy = proxy

    return proxy
  }

  process(object) {
    const { BASE, newDataDescriptor, descriptorsFor } = Descriptor
    const useObject = object

    const converted = descriptorsFor(useObject, 'instance', 'values')
    return [converted, useObject]
  }

  get proxyTraps() {
    if (!this.#traps) {
      this.#traps = {
        get: this.#proxyGet.bind(this),
        has: this.#proxyHas.bind(this),
        set: this.#proxySet.bind(this),
        ownKeys: this.#proxyOwnKeys.bind(this),
        deleteProperty: this.#proxyDeleteProperty.bind(this),
        getOwnPropertyDescriptor: this.#proxyGetOwnPropertyDescriptor.bind(this),
        defineProperty: this.#proxyDefineProperty.bind(this),
      }
    }

    return this.#traps
  }

  getIfHas(property) {
    const index = this.properties.findIndex(entry => entry?.property == property)
    const entry = this.properties[index]

    if (~index && entry) {
      return stripNullish(objectCopy({}, entry.descriptor, {
        index,
        property: entry?.property,
        object: entry?.thisObj,
        descriptor: entry
      }))
    }

    return null
  }

  get [Symbol.toStringTag]() { return this.constructor.name }

  #proxyGet(target, prop, receiver) {
    const neProp = this.getIfHas(prop)

    if (neProp) {
      return neProp.descriptor.computeValue()
    }

    return Reflect.get(target, prop, receiver)
  }

  #proxyHas(target, prop) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor } = entry

    if (descriptor) {
      if (descriptor.hasEnumerable && descriptor.isEnumerable)
        return true
    }

    return Reflect.has(target, prop)
  }

  #proxySet(target, prop, newValue, receiver) {
    const { getOwnPropertyDescriptor: getDescriptor } = Object
    const entry = this.getIfHas(prop) ?? {}
    const propObj = this.propertiesObject
    let { descriptor, index } = entry

    if (descriptor && propObj) {
      const success = descriptor.alterValue(newValue)
      if (success) {
        this.genProperties(propObj);

        ({ descriptor, index } = (this.getIfHas(prop) ?? {}))
      }
      return descriptor.computeValue()
    }
    else if (prop.startsWith('__') && propObj) {
      propObj[prop.substring(2)] = newValue
      this.genProperties(propObj);
      return newValue
    }

    return Reflect.set(target, prop, newValue, receiver)
  }

  #proxyDeleteProperty(target, prop) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor, index } = entry

    if (descriptor?.canDelete && this.propertiesObject) {
      const currentCount = this.properties.length

      delete this.propertiesObject[prop]
      const [newProps, newObj] = this.process(this.propertiesObject)
      this.propertiesObject = newObj
      this.properties = newProps

      return (currentCount > this.properties.length)
    }

    return Reflect.deleteProperty(target, prop)
  }

  #proxyGetOwnPropertyDescriptor(target, prop) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor } = entry

    if (descriptor) {
      return descriptor.descriptor
    }

    return Reflect.getOwnPropertyDescriptor(target, prop)
  }

  #proxyOwnKeys(target) {
    const ownKeys = Reflect.ownKeys(target)
    const proxyKeys = Reflect.ownKeys(this.propertiesObject)

    return ownKeys.concat(proxyKeys)
  }

  #proxyDefineProperty(target, prop, newDescriptor) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor, index } = entry

    if (descriptor?.canChange) {
      this.properties[index] = new Descriptor(newDescriptor)
      return !!this.properties[index]
    }

    return Reflect.defineProperty(target, prop, newDescriptor)
  }

  [Symbol.for(`GetProxy.replVerbosity`)] = false;
  [Symbol.for('nodejs.util.inspect.custom')](depth, opts, inspect) {
    const { keysFor } = Descriptor

    const quickType   = o => /(\w+)]/.exec(Object.prototype.toString.call(o))[1]
    const killCruft   = s => s.replace(/^\[ /g, '').replace(/ ]$/, '').replace(/'/g, '')
    const kinspect = o => killCruft(inspect(o, iOpts))

    const iOpts       = { ...opts, depth }
    const typeOfObj   = quickType(this.target)

    const targetKeys  = kinspect(keysFor(this.target, false, true))
    const proxiedKeys = kinspect(keysFor(this.propertiesObject, false, true))

    const metaState   = this.#hasMeta ? "present" : "missing"
    const forcedState = this.#forceMeta ? ' (forced)' : ''
    const metaString  = `${metaState}${forcedState}`
    const verbose     = GetProxy[GetProxy.REPL_VERBOSITY]

    if (verbose)
      return [
        `${this[Symbol.toStringTag]} (proxying ${typeOfObj} instance) {`,
        `  targetKeys: ${targetKeys}`,
        `  proxiedKeys: ${proxiedKeys}`,
        `  meta: ${metaString}`,
        `}`
      ].join('\n')
    else
      return (
        `${this[Symbol.toStringTag]} { target: ${targetKeys} proxy: ${proxiedKeys} }`
      )
  }

  static ProxyReplPrinter = class ProxyReplPrinter {
    constructor(proxy, meta) {
      this.proxy = proxy
      this.meta = meta
    }

    [Symbol.for('nodejs.util.inspect.custom')] = function (depth, opts, inspect) {
      const { bold, yellow, white } = inspectToolKit(depth, opts, inspect)
      const { keysFor } = Descriptor

      return [
        `${bold(this.proxy[Symbol.toStringTag])} {`,
        `keys: ${keysFor(this.proxy, true, true)
          .concat(keysFor(this.meta.propertiesObject, true, true))
          .map(k => yellow(k))
          .join(white(', '))
        } }`,
      ].join(' ')
    }
  }

  static get META() { return Symbol.for(this.name) }
  static get REPL_VERBOSITY() {
    return Symbol.for(`GetProxy.replVerbosity`)
  }

  static for(object, newProps = []) {
    const meta = new GetProxy(object, newProps, { forceMeta: true })
    const proxy = meta.proxy
    return [proxy, meta]
  }
}
