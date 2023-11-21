import { Logs, Errors } from '@nyteshade/ne-pubsub'
import { inspectToolKit, objectCopy } from './utils.js'

/**
 * Represents a descriptor for object properties, distinguishing between
 * data descriptors and accessor descriptors.
 */
export class Descriptor {
  /**
   * Creates an instance of ObjectDescriptor.
   *
   * @param {object} descriptor - The property descriptor object.
   * @param {boolean} [descriptor.configurable] - Indicates if the property
   * can be deleted from the object and if its attributes (other than value
   * and writable) can be changed.
   * @param {boolean} [descriptor.enumerable] - Indicates if the property
   * shows up in enumerations of the properties on the corresponding object.
   * @param {*} [descriptor.value] - The value associated with the property.
   * @param {boolean} [descriptor.writable] - Indicates if the value of the
   * property can be changed.
   * @param {function} [descriptor.get] - The getter function for the property.
   * @param {function} [descriptor.set] - The setter function for the property.
   * @throws {TypeError} Throws if the descriptor argument is not an object.
   */
  constructor(
    descriptor = {},
    base = Descriptor.BASE,
    thisObj,
    property,
  ) {
    if (descriptor instanceof Descriptor) {
      return new Descriptor(
        objectCopy({}, descriptor.descriptor),
        Descriptor.BASE,
        descriptor.thisObj,
        descriptor.property
      )
    }

    if (property) {
      this.#property = property
    }

    if (thisObj) {
      this.#thisObj = thisObj
    }

    const { known, BaseDescriptor, isDescriptor, definedOnly } = Descriptor

    if (!isDescriptor(descriptor)) {
      const typeError = new TypeError('Invalid descriptor properties')
      Errors.capture(typeError)
      throw typeError
    }

    const _base = known.get(base) ?? BaseDescriptor
    this.descriptor = { ..._base, ...definedOnly(descriptor) }
  }

  // MARK: - Instance functions

  /**
   * If the object for which this descriptor is based on is required in
   * order to accurately retrieve the value for computed getters and
   * in the case of data descriptors, the value returned can only be
   * accurately retrieved if the property name this descriptor describes
   * is also provided.
   *
   * @param {object} object the object that this descriptor is take from
   * @param {string|symbol} property the name of the property this
   * descriptor describes
   * @returns whatever the value of the descriptor or its function states
   * it will be.
   */
  computeValue(object, property) {
    const prefix = '[ObjectDescriptor][computeValue]'
    const thisObj = object ?? this.#thisObj
    const prop = property ?? this.#property

    if (this.isAccessorType) {
      const [getter] = this.accessors

      if (this.hasGet && thisObj)
        return getter.bind(thisObj)()

      Logs.warn(`${prefix} Cannot retrieve value without 'object'`, thisObj)
      return undefined
    }
    else if (this.isDataType) {
      if (this.hasValue && thisObj && prop) {
        return thisObj[prop]
      }
      Logs.warn(
        `${prefix} Cannot retrieve value without 'object' and 'property'`,
        thisObj,
        prop
      )
    }

    return undefined
  }

  /**
   * Altering the value on the descriptor, in a meaningful way, requires
   * that a reference to the object this descriptor pertains to as the
   * property it describes are both known. Without this information, it
   * is impossible to modify the data in a meaningful way.
   *
   * @param {*} newValue the value to set on the object
   * @param {object} object the `this` object the descriptor describes.
   * @param {string|symbol} property the name of the property this descriptor
   * describes
   * @returns true if the set was successful, false otherwise
   */
  alterValue(newValue, object, property) {
    const thisObj = object ?? (this.#thisObj ?? null)
    const prop = property ?? (this.#property ?? null)
    const descObj = descriptor instanceof Descriptor
      ? descriptor
      : new Descriptor(descriptor)

    if (descObj.isAccessor) {
      if (descObj.hasSet && descObj.canChange) {
        const [_, setter] = descObj.accessors
        if (thisObj) {
          setter.bind(thisObj)(newValue)
          return true
        }
      }
    }
    else if (descObj.isDataDescriptor) {
      if (descObj.canChange) {
        if (prop && thisObj) {
          thisObj[prop] = newValue
          this.descriptor.value = newValue
          return true
        }
      }
    }

    return false
  }

  /** Retrieve the optional property this descriptor is associated with */
  get property() {
    return this.#property ?? null
  }

  /** Retrieve the optional object this descriptor is associated with */
  get thisObj() {
    return this.#thisObj ?? null
  }

  /**
   * Gets the descriptor type as a string.
   *
   * @returns {string} The descriptor type ('accessor', 'data', or 'base').
   */
  get type() {
    const { ACCESSOR, DATA, BASE } = Descriptor
    return this.isAccessorType
      ? ACCESSOR
      : (this.isDataType ? DATA : BASE)
  }

  /**
   * Checks if the descriptor is an accessor descriptor.
   *
   * @returns {boolean} `true` if the descriptor is an accessor descriptor,
   * otherwise `false`.
   */
  get isAccessorType() {
    return Descriptor.isAccessorDescriptor(this.descriptor)
  }

  /**
   * Checks if the descriptor is a data descriptor.
   *
   * @returns {boolean} `true` if the descriptor is a data descriptor,
   * otherwise `false`.
   */
  get isDataType() {
    return Descriptor.isDataDescriptor(this.descriptor)
  }

  /**
   * Checks if the descriptor is a base descriptor.
   *
   * @returns {boolean} `true` if the descriptor is a base descriptor,
   * otherwise `false`.
   */
  get isBase() {
    return Descriptor.isBaseDescriptor(this.descriptor)
  }

  /**
   * Returns the `configurable` property of the wrapped descriptor if it
   * is present. If the property is not present, `false` is returned.
   *
   * @returns {boolean} `true` if the `configurable` property is in the
   * descriptor object and true, false if it is not present or false
   */
  get isConfigurable() {
    return !!this.descriptor?.configurable
  }

  /**
   * Returns true if the `configurable` property has been set on the
   * wrapped descriptor object
   *
   * @returns {boolean} `true` if the `configurable` property has been
   * set with any value on the wrapped descriptor
   */
  get hasConfigurable() {
    return Reflect.has(this.descriptor, 'configurable')
  }

  /**
   * Returns the `writable` property of the wrapped descriptor if it
   * is present. If the property is not present, `false` is returned.
   *
   * @returns {boolean} `true` if the `writable` property is in the
   * descriptor object and true, false if it is not present or false
   */
  get isWritable() {
    return !!this.descriptor?.writable
  }

  /**
   * Returns true if the `writable` property has been set on the
   * wrapped descriptor object
   *
   * @returns {boolean} `true` if the `writable` property has been
   * set with any value on the wrapped descriptor
   */
  get hasWritable() {
    return Reflect.has(this.descriptor, 'writable')
  }

  /**
   * Returns the `enumerable` property of the wrapped descriptor if it
   * is present. If the property is not present, `false` is returned.
   *
   * @returns {boolean} `true` if the `enumerable` property is in the
   * descriptor object and true, false if it is not present or false
   */
  get isEnumerable() {
    return !!this.descriptor?.enumerable
  }

  /**
   * Returns true if the `enumerable` property has been set on the
   * wrapped descriptor object
   *
   * @returns {boolean} `true` if the `enumerable` property has been
   * set with any value on the wrapped descriptor
   */
  get hasEnumerable() {
    return Reflect.has(this.descriptor, 'enumerable')
  }

  /**
   * Returns the `value` property of the wrapped descriptor if it
   * is present.
   *
   * @returns {any} the result will be `undefined` if the descriptor
   * value is undefined or not present
   */
  get value() {
    return this.descriptor?.value
  }

  /**
   * Returns true if the `value` property has been set on the
   * wrapped descriptor object
   *
   * @returns {boolean} `true` if the `value` property has been
   * set with any value on the wrapped descriptor
   */
  get hasValue() {
    return Reflect.has(this.descriptor, 'value')
  }

   /**
   * Returns true if the `set` property has been set on the
   * wrapped descriptor object
   *
   * @returns {boolean} `true` if the `set` property has been
   * set with any value on the wrapped descriptor
   */
   get hasSet() {
    return Reflect.has(this.descriptor, 'set')
  }

  /**
   * Returns true if the `get` property has been set on the
   * wrapped descriptor object
   *
   * @returns {boolean} `true` if the `get` property has been
   * set with any value on the wrapped descriptor
   */
  get hasGet() {
    return Reflect.has(this.descriptor, 'get')
  }


  /**
   * The accessors when the descriptor is set as a computed geter or
   * setter can be retrieved here in a pair. If neither is defined the
   * result will be an array of `[undefined, undefined]`. If either
   * function is returned, the getter will be in position 0 and the
   * setter, if present, will be in position 1.
   *
   * @returns {function[]} `true` if the `configurable` property is in the
   * descriptor object and true, false if it is not present or false
   */
  get accessors() {
    return [this.descriptor?.get, this.descriptor?.set]
  }

  /**
   * Based on the properties of the wrapped descriptor, `canChange()` will
   * return true if the descriptor is an accessor and `configurable` is set
   * to true.
   *
   * If the descriptor is a data descriptor and writable is true, then true
   * will be returned. If writable is not present, and configurable is true, then
   * true will be returned.
   *
   * @returns {boolean} `true` if the conditions are met at the property
   * can be changed, `false` otherwise
   */
  get canChange() {
    return Descriptor.canChange(this.descriptor)
  }

  /**
   * Based on the properties of the wrapped descriptor, `canDelete()` will
   * return true if the descriptor has a `configurable` property set to true
   *
   * @returns {boolean} `true` if the conditions are met at the property
   * can be deleted, `false` otherwise
   */
  get canDelete() {
    return Descriptor.canDelete(this.descriptor)
  }

  /**
   * Overrides the default toStringTag.
   *
   * @returns {string} The name of the constructor.
   */
  get [Symbol.toStringTag]() { return this.constructor.name }

  // MARK: - NodeJS REPL Inspect Code

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts, inspect) {
    const { red, green, yellow, cyan } = inspectToolKit(depth, opts, inspect)

    const contextStr = (this.#property && this.#thisObj
      ? `context:${green('true')}`
      : ((!this.#property && this.#thisObj)
        ? `context:${yellow('object')}`
        : ((this.#property && !this.#thisObj)
          ? `context:${yellow('property')}`
          : '')))

    const accessorStr = (this.isAccessorType
      ? `accessors:${(
        (this.hasGet && !this.hasSet)
          ? cyan('[Get]')
          : ((!this.hasGet && this.hasSet)
            ? cyan('[Set]')
            : ((this.hasGet && this.hasSet)
              ? cyan('[Get/Set]')
              : '')))}`
      : '')

    const dataStr = (this.isDataType
      ? `valuePresent:${this.hasValue ? green(true) : red(false)}`
      : ``)

    const typeStr = (this.isAccessorType
      ? '[ACCESSOR]'
      : (this.isDataType ? '[DATA]' : ''))

    const modifyStr = (this.canDelete
      ? `modifiable:${green('all')}`
      : (this.chanChange
        ? `modifiable:${yellow('value-only')}`
        : ''))

    return [
      `${this.constructor.name}${typeStr} {`,
      `${this.property && String(this.property) || ''}`,
      `${contextStr.trim()}`,
      `${modifyStr.trim()}`,
      `${accessorStr.trim()}`,
      `${dataStr.trim()}`,
      '}'
    ].filter(s => s.length).join(' ')
  }


  // MARK: - Private properties and functions

  /**
   * An optional object that provides context to the functions
   * that might be used on this descriptor.
   */
  #thisObj = null

  /**
   * The name of the property this descriptor represents
   */
  #property = null

  // MARK: - Static functions and properties

  /**
   * Performs some logic based on the configuration of the supplied
   * descriptor to indicate whether or not it can be changed modified
   * or even have the descriptor itself modified.
   *
   * @param {object} descriptor an object that returns true if run through
   * the function `ObjectDescriptor.isDescriptor()`.
   * @returns {boolean} returns true if the configuration of the provided
   * descriptor indicates that the property it represents can be changed
   */
  static canChange(descriptor) {
    const instance = new Descriptor(descriptor)

    if (instance.isAccessorType && instance.isConfigurable)
      return true

    if (instance.isDataType) {
      if (instance.hasWritable)
        return instance.isWritable

      if (instance.hasConfigurable)
        return instance.isConfigurable
    }

    return false
  }

  /**
   * Checks to see if the property represented by the wrapped
   * descriptor can be deleted. This is only true when the
   * descriptor's `configurable` property is set to true.
   *
   * @param {object} descriptor an object that returns `true` if run
   * through the function `ObjectDescriptor.isDescriptor()`
   * @returns {boolean} returns true if the descriptor has had its
   * configurable value set and that value is true.
   */
  static canDelete(descriptor) {
    const instance = new Descriptor(descriptor)

    // It is important to check for the existance of the property
    // on the descriptor in addition to its value.
    if (instance.hasConfigurable && instance.isConfigurable)
      return true

    return false
  }

  /**
   * Given an object containing keys that are compatible with the syntax
   * for an object descriptor (e.g. configurable, enumerable, writable,
   * value, get, and set), its keys and values will be copied to a new
   * object and returned. In the worst case, an empty non-null object
   * will be returned.
   *
   * @param {object} descriptor an object that contains some keys that are
   * expected in an object descriptor.
   * @returns {object} an non-null object; if no properties matched or the
   * supplied object is `null` or `undefined`, it will be empty. Otherwise it
   * will contain all valid descriptor keys and values from the provided
   * object
   */
  static definedOnly(descriptor) {
    const result = {}

    if (!descriptor || !Descriptor.isDescriptor(descriptor))
      return result

    for (let [key, value] of Object.entries(descriptor)) {
      if (value !== undefined && Descriptor.descriptorKeys.includes(key))
        result[key] = value
    }

    return result
  }

  /**
   * Attempts to create a new instance of `ObjectDescriptor` from the
   * supplied object. If the object is not an instance yet but follows
   * valid descriptor keys and values, it will be converted to an
   * instance if possible.
   *
   * @param {object} object
   * @returns a new instance of ObjectDescriptor or null if one could
   * not be made.
   */
  static from(object) {
    if (object && (object instanceof Descriptor))
      return object

    const { isDescriptor } = Descriptor

    let descriptor = isDescriptor(object) ? object : null

    if (descriptor && !(descriptor instanceof Descriptor)) {
      descriptor = new Descriptor(descriptor)
    }

    return descriptor
  }

  /**
   * Retrieves a transformed representation of all properties (including Symbol properties)
   * from the given object.
   *
   * @param {object} object the object from which to retrieve and transform properties.
   * @param {function} transform a function that takes a key and its corresponding
   * descriptor, and returns a transformed value. Defaults to a function that returns
   * the value as is. If the string 'instance' is passed, then the descriptor will
   * be set as a new instance of Descriptor with as much context as is available
   * @param {boolean} asEntries if true, then the resulting output will be an array
   * instead of a object with key value pairs. Instead each element of the array will
   * also be an array with two elements: key at 0 and value at 1.
   * @returns {object} an object with the same keys as the input object but with
   * transformed values according to the transform function.
   * @static
   *
   * @example
   * const obj = { a: 1, b: 2, [Symbol('c')]: 3 };
   * const transformed = Descriptor.getAllFrom(obj, (key, desc) => desc.value * 2)
   * // transformed will be { a: 2, b: 4, [Symbol('c')]: 6 }
   *
   * const entries1 = Descriptor.getAllFrom(obj, null, true)
   * // entries will be [['a', 1],['b', 2],[Symbol('c'), 3]]
   * const entries2 = Descriptor.getAllFrom(obj, (key, desc) => desc.value * 2, true)
   * // entries will be [['a', 2],['b', 4],[Symbol('c'), 6]]
   */
  static descriptorsFor(object, transform, asEntries = false) {
    const descriptors = Object.getOwnPropertyDescriptors(object)
    const keys = Descriptor.keysFor(object)
    const defTransform = (_, value) => value
    const results = asEntries ? [] : {}
    const modify = (transform
      ? ((transform !== 'instance' && (typeof transform === 'function'))
        ? transform
        : (key, value) => new Descriptor(value, 'base', object, key))
      : defTransform)

    // Symbols do not show up with .keys or .entries
    for (const key of keys) {
      const value = modify(key, descriptors[key])

      if (asEntries) {
        if (asEntries === 'keys')
          results.push(key)
        else if (asEntries === 'values')
          results.push(value)
        else
          results.push([ key, value ])
      }

      else
        results[key] = value
    }

    return results
  }

  /**
   * Retrieves all keys (including Symbol keys) from the given object.
   *
   * @param {object} object the object from which to retrieve the keys.
   * @param {boolean} stringifySymbols if true, Symbol keys will be converted
   * to their string representations. Defaults to false, returning Symbols as is.
   * @returns {Array<string|symbol>} an array of keys (string and/or Symbol)
   * from the object.
   * @static
   *
   * @example
   * const obj = { a: 1, [Symbol('b')]: 2 };
   * const keys = Descriptor.getKeysFrom(obj);
   * // keys will be ['a', Symbol('b')]
   *
   * const stringKeys = Descriptor.getKeysFrom(obj, true);
   * // stringKeys will be ['a', 'Symbol(b)']
   */
  static keysFor(object, stringifySymbols = false, nonEnumerable = false) {
    const keys = []

    const stringKeys = Object.keys(object)
    const descriptors = Object.getOwnPropertyDescriptors(object)
    let symbolKeys = Object.getOwnPropertySymbols(object)

    if (stringifySymbols) {
      symbolKeys = symbolKeys.map(symbol => String(symbol))
    }

    return stringKeys.concat(symbolKeys).filter(key => {
      if (nonEnumerable) {
        return descriptors[key]?.enumerable ? true : false
      }
      return true
    })
  }

  /**
   * Retrieves values from the given object. Optionally returns entries (key-value pairs).
   *
   * @param {object} object the object from which to retrieve the values.
   * @param {boolean} asEntries if true, returns an array of [key, value]
   * pairs instead of just values. Defaults to false.
   * @returns {any[]} an array of values or entries from the object.
   * @static
   *
   * @example
   * const obj = { a: 1, b: 2 };
   * const values = Descriptor.getValuesFrom(obj);
   * // values will be [1, 2]
   *
   * const entries = Descriptor.getValuesFrom(obj, true);
   * // entries will be [['a', 1], ['b', 2]]
   */
  static valuesFor(object, asEntries = false) {
    const values = []
    const keys = Descriptor.keysFor(object)

    // Symbols do not show up with .keys or .entries
    for (const key of keys)
      values.push(asEntries ? [key, object[key]] : object[key])

    return values
  }

  /**
   * Retrieves key-value pairs (entries) from the given object.
   *
   * @param {object} object the object from which to retrieve the entries.
   * @returns {Array} an array of [key, value] pairs from the object.
   * @static
   *
   * @example
   * const obj = { a: 1, b: 2 };
   * const entries = Descriptor.getEntriesFrom(obj);
   * // entries will be [['a', 1], ['b', 2]]
   */
  static entriesFrom(object) {
    return Descriptor.valuesFor(object, true)
  }


  /**
   * Checks if the provided descriptor is an accessor descriptor.
   *
   * @param {object} descriptor - The descriptor to check.
   * @returns {boolean} `true` if the descriptor is an accessor descriptor,
   * otherwise `false`.
   */
  static isAccessorDescriptor(descriptor) {
    if (!descriptor || !Descriptor.isDescriptor(descriptor))
      return false

    const onlyDefined = Descriptor.definedOnly(descriptor)
    const has = Reflect.has.bind(Reflect, onlyDefined)

    if (has('value') || has('writable'))
      return false

    return (has('get') || has('set'))
  }

  /**
   * Checks if the provided descriptor is an base descriptor.
   *
   * @param {object} descriptor - The descriptor to check.
   * @returns {boolean} `true` if the descriptor is an base descriptor,
   * otherwise `false`.
   */
  static isBaseDescriptor(descriptor) {
    if (!descriptor || !Descriptor.isDescriptor(descriptor))
      return false

    const onlyDefined = Descriptor.definedOnly(descriptor)
    const has = Reflect.has.bind(Reflect, onlyDefined)

    if (!(
      has('get') || has('set') || has('writable') || has('value')
    ))
      return true

    return false
  }

  /**
   * Checks if the provided descriptor is a data descriptor.
   *
   * @param {object} descriptor - The descriptor to check.
   * @returns {boolean} `true` if the descriptor is a data descriptor,
   * otherwise `false`.
   */
  static isDataDescriptor(descriptor) {
    if (!descriptor || !Descriptor.isDescriptor(descriptor))
      return false

    const onlyDefined = Descriptor.definedOnly(descriptor)
    const has = Reflect.has.bind(Reflect, onlyDefined)

    if (has('get') || has('set'))
      return false

    return (has('value') || has('writable'))
  }

  /**
   * Checks to see if the supplied object has any of the known
   * six descriptor properties in a configuration that makes
   * it a valid descriptor object
   *
   * @param {object} object any object value that should be tested
   * for candidancy as a descriptor object compatible with
   * `Object.defineProperty` / `Object.defineProperties`
   * @returns
   */
  static isDescriptor(object) {
    if (!object || !(object instanceof Object))
      return false

    const { descriptorKeys } = Descriptor
    const has = Reflect.has.bind(Reflect, object)
    const present = []

    for (let key of Object.keys(object)) {
      if (descriptorKeys.includes(key) && object[key] !== undefined)
        present.push(key)
    }

    const checks = present.map(key => {
      if (['enumerable', 'configurable', 'writable'].includes(key))
        return typeof object[key] === 'boolean'

      else if (['get', 'set'].includes(key))
        return typeof object[key] === 'function'

      return key === 'value'
    });

    if ((has('get') || has('set')) && (has('value') || has('writable'))) {
      return false
    }

    return checks.every(element => !!element)
  }

  /**
   * Checks to see if the supplied object is an instance of
   * ObjectDescriptor. If true is returned, you can also be
   * assured the value supplied is truthy and an object.
   *
   * @param {any} object any value that is to be checked for
   * being an instance of `ObjectDescriptor`
   * @returns true if its an instance, false otherwise
   */
  static isDescriptorInstance(object) {
    if (!object || (typeof object !== 'object')) {
      return false
    }

    return (object instanceof Descriptor)
  }

  /**
   * Creates a new data descriptor.
   *
   * @param {object} dataProps an object with `{value, writable}` keys
   * that determine what makes this a data descriptor rather than an
   * accessor descriptor
   * @param {*} dataProps.value The value for the property.
   * @param {boolean} dataProps.writable Indicates if the property's
   * value can be changed.
   * @param {string|object} base provides a way to describe the base
   * descriptor whose properties will be extended by this function. It
   * can be a valid `ObjectDescriptor` constant `BASE`, `VISIBLE`, or `OPEN`
   * or it can be an actual raw descriptor object. It defaults to the
   * constant `VISIBLE`
   * @param {object} makeInstance if present, and both `object` and `property`
   * are valid keys of the object, the result will be an `ObjectDescriptor`
   * instance
   * @param {object} makeInstance.object the object the descriptor was derived
   * from or built for.
   * @param {string|symbol} makeInstance.property the name the property this
   * descriptor describes in the object it is built for or derived from
   * @returns {object} A new data descriptor object.
   */
  static newDataDescriptor(
    { value, writable },
    base = Descriptor.VISIBLE,
    { object, property } = { object: undefined, property: undefined }
  ) {
    const { definedOnly, normalizeBase } = Descriptor
    const _base = normalizeBase(base)
    const output = definedOnly({ ..._base, value, writable })

    return (object && property)
      ? new Descriptor(output, base, object, property)
      : output
  }

  /**
   * Creates a new accessor descriptor.
   *
   * @param {object} descriptor - The accessor descriptor to create.
   * @param {function} descriptor.get - The getter function for the property.
   * @param {function} descriptor.set - The setter function for the property.
   * @param {string|object} base provides a way to describe the base
   * descriptor whose properties will be extended by this function. It
   * can be a valid `ObjectDescriptor` constant `BASE`, `VISIBLE`, or `OPEN`
   * or it can be an actual raw descriptor object. It defaults to the
   * constant `VISIBLE`
   * @param {object} makeInstance if present, and both `object` and `property`
   * are valid keys of the object, the result will be an `ObjectDescriptor`
   * instance
   * @param {object} makeInstance.object the object the descriptor was derived
   * from or built for.
   * @param {string|symbol} makeInstance.property the name the property this
   * descriptor describes in the object it is built for or derived from
   * @returns {object} A new accessor descriptor object.
   */
  static newAccessorDescriptor(
    { get, set },
    base = Descriptor.VISIBLE,
    { object, property } = { object: undefined, property: undefined }
  ) {
    const { definedOnly, normalizeBase } = Descriptor
    const _base = normalizeBase(base)
    const output = definedOnly({ ..._base, get, set })

    return (object && property)
      ? new Descriptor(output, base, object, property)
      : output
  }

  /**
   * Given that base descriptors can often be expressed as a string
   * constant or an actual object, this function takes what is
   * supplied and normalizes the output as an actual raw descriptor
   * object.
   *
   * @param {string|object} baseDeclaration provides a way to describe
   * the base descriptor whose properties will be extended by this
   * function. It can be a valid `ObjectDescriptor` constant `BASE`,
   * `VISIBLE`, or `OPEN` or it can be an actual raw descriptor object.
   * @returns a non-null raw descriptor object
   */
  static normalizeBase(baseDeclaration) {
    let rawDescriptor = Descriptor.BaseDescriptor

    if (baseDeclaration) {
      if (
        (typeof baseDeclaration === 'string') ||
        baseDeclaration instanceof String
      ) {
        rawDescriptor = Descriptor.known.get(baseDeclaration)
        if (!rawDescriptor) {
          rawDescriptor = Descriptor.VisibleDescriptor
        }
      }
      else if (Descriptor.isDescriptor(baseDeclaration)) {
        rawDescriptor = Descriptor.definedOnly(baseDeclaration)
      }
    }

    return { ...rawDescriptor }
  }

  /**
   * The rawDescriptor function is easier than typing out or destructuring
   * both newAccessorDescriptor or newDataDescriptor functions. It takes
   * a type of either DATA ('data') or ACESSOR ('accessor') as the first
   * param and then allows you to specify the specific bits.
   *
   * @param {string} type one of ObjectDescriptor.ACESSOR ('accessor') or
   * ObjectDescriptor.DATA ('data') to indicate which function is invoked
   * @param {object} typeProps either `{get, set}` or `{value, writable}` as per
   * the type of raw descriptor object to create
   * @param {string|object} base provides a way to describe the base
   * descriptor whose properties will be extended by this function. It
   * can be a valid `ObjectDescriptor` constant `BASE`, `VISIBLE`, or `OPEN`
   * or it can be an actual raw descriptor object. It defaults to the
   * constant `VISIBLE`
   * @param {object} makeInstance if present, and both `object` and `property`
   * are valid keys of the object, the result will be an `ObjectDescriptor`
   * instance
   * @param {object} makeInstance.object the object the descriptor was derived
   * from or built for.
   * @param {string|symbol} makeInstance.property the name the property this
   * descriptor describes in the object it is built for or derived from
   * @returns
   */
  static rawDescriptor(
    type,
    typeProps,
    base = Descriptor.VISIBLE,
    makeInstance = { object: undefined, property: undefined }
  ) {
    const { newAccessorDescriptor, newDataDescriptor, ACCESSOR, DATA } = this

    switch(type) {
      case [ACCESSOR]:
        return newAccessorDescriptor(
          typeProps,
          base,
          makeInstance
        )
      case [DATA]:
      default:
        return newDataDescriptor(
          typeProps,
          base,
          makeInstance
        )
    }
  }

  /**
   * Array of keys found in object descriptors for easier detection
   * of key value pairs.
   */
  static descriptorKeys = [
    'enumerable',
    'configurable',
    'value',
    'writable',
    'get',
    'set',
  ]

  /**
   * A map of known base descriptor types.
   */
  static known = new Map([
    ['base', Descriptor.BaseDescriptor],
    ['visible', Descriptor.VisibleDescriptor],
    ['open', Descriptor.OpenDescriptor],
  ])

  // MARK: - Static constants

  /**
   * The 'base' descriptor type constant.
   *
   * @returns {string} Descriptor type 'base'.
   */
  static get BASE() {
    return 'base'
  }

  /**
   * The 'visible' descriptor type constant.
   *
   * @returns {string} Descriptor type 'visible'.
   */
  static get VISIBLE() {
    return 'visible'
  }

  /**
   * The 'open' descriptor type constant.
   *
   * @returns {string} Descriptor type 'open'.
   */
  static get OPEN() {
    return 'open'
  }

  /**
   * The 'data' descriptor type constant.
   *
   * @returns {string} Descriptor type 'data'.
   */
  static get DATA() {
    return 'data'
  }

  /**
   * The 'accessor' descriptor type constant.
   *
   * @returns {string} Descriptor type 'accessor'.
   */
  static get ACCESSOR() {
    return 'accessor'
  }

  /**
   * Provides an array of base descriptor types. Useful for validation or enumeration.
   *
   * @returns {string[]} Array of base descriptor types.
   */
  static get BASE_TYPES() { return [this.BASE, this.VISIBLE, this.OPEN] }

  /**
   * Provides an array of descriptor types. Useful for validation or enumeration.
   *
   * @returns {string[]} Array of descriptor types.
   */
  static get TYPES() { return [this.DATA, this.ACCESSOR] }

  /**
   * Gets a new copy of the base descriptor with default settings: not enumerable,
   * not configurable.
   *
   * @returns {object} Base descriptor object.
   */
  static get BaseDescriptor() {
    return { enumerable: false, configurable: false }
  }

  /**
   * Gets a new copy of the base descriptor with default settings: enumerable,
   * but not configurable.
   *
   * @returns {object} Base descriptor object.
   */
  static get VisibleDescriptor() {
    return { enumerable: true, configurable: false }
  }

  /**
   * Gets a new copy of the base descriptor with default settings: enumerable
   * AND configurable.
   *
   * @returns {object} Base descriptor object.
   */
  static get OpenDescriptor() {
    return  { enumerable: true, configurable: true }
  }

  /**
   * Gets a new copy of the base descriptor with default settings: not enumerable,
   * not configurable. This returns an instance of ObjectDescriptor.
   *
   * @returns {Descriptor} Base descriptor object.
   */
  static get BaseDescriptorInstance() {
    return new Descriptor({ enumerable: false, configurable: false })
  }

  /**
   * Gets a new copy of the base descriptor with default settings: enumerable,
   * but not configurable. This returns an instance of ObjectDescriptor.
   *
   * @returns {Descriptor} Base descriptor object.
   */
  static get VisibleDescriptorInstance() {
    return new Descriptor({ enumerable: true, configurable: false })
  }

  /**
   * Gets a new copy of the base descriptor with default settings: enumerable
   * AND configurable. This returns an instance of ObjectDescriptor.
   *
   * @returns {Descriptor} Base descriptor object.
   */
  static get OpenDescriptorInstance() {
    return new Descriptor({ enumerable: true, configurable: true })
  }

}