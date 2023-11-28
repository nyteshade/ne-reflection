import { Logs, Errors } from '@nyteshade/ne-pubsub';
import { inspectToolKit, objectCopy } from './utils.js';
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
    constructor(descriptor = {}, base = Descriptor.BASE, thisObj, property) {
        if (descriptor instanceof Descriptor) {
            return new Descriptor(objectCopy({}, descriptor.descriptor), Descriptor.BASE, descriptor.thisObj, descriptor.property);
        }
        if (property) {
            this.#property = property;
        }
        if (thisObj) {
            this.#thisObj = thisObj;
        }
        const { known, BaseDescriptor, isDescriptor, definedOnly } = Descriptor;
        if (!isDescriptor(descriptor)) {
            const typeError = new TypeError('Invalid descriptor properties');
            Errors.capture(typeError);
            throw typeError;
        }
        const _base = known.get(base) ?? BaseDescriptor;
        this.descriptor = { ..._base, ...definedOnly(descriptor) };
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
        const prefix = '[ObjectDescriptor][computeValue]';
        const thisObj = object ?? this.#thisObj;
        const prop = property ?? this.#property;
        if (this.isAccessorType) {
            const [getter] = this.accessors;
            if (this.hasGet && thisObj)
                return getter.bind(thisObj)();
            Logs.warn(`${prefix} Cannot retrieve value without 'object'`, thisObj);
            return undefined;
        }
        else if (this.isDataType) {
            if (this.hasValue && thisObj && prop) {
                return thisObj[prop];
            }
            Logs.warn(`${prefix} Cannot retrieve value without 'object' and 'property'`, thisObj, prop);
        }
        return undefined;
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
        const thisObj = object ?? (this.#thisObj ?? null);
        const prop = property ?? (this.#property ?? null);
        const descObj = descriptor instanceof Descriptor
            ? descriptor
            : new Descriptor(descriptor);
        if (descObj.isAccessor) {
            if (descObj.hasSet && descObj.canChange) {
                const [_, setter] = descObj.accessors;
                if (thisObj) {
                    setter.bind(thisObj)(newValue);
                    return true;
                }
            }
        }
        else if (descObj.isDataDescriptor) {
            if (descObj.canChange) {
                if (prop && thisObj) {
                    thisObj[prop] = newValue;
                    this.descriptor.value = newValue;
                    return true;
                }
            }
        }
        return false;
    }
    /** Retrieve the optional property this descriptor is associated with */
    get property() {
        return this.#property ?? null;
    }
    /** Retrieve the optional object this descriptor is associated with */
    get thisObj() {
        return this.#thisObj ?? null;
    }
    /**
     * Gets the descriptor type as a string.
     *
     * @returns {string} The descriptor type ('accessor', 'data', or 'base').
     */
    get type() {
        const { ACCESSOR, DATA, BASE } = Descriptor;
        return this.isAccessorType
            ? ACCESSOR
            : (this.isDataType ? DATA : BASE);
    }
    /**
     * Checks if the descriptor is an accessor descriptor.
     *
     * @returns {boolean} `true` if the descriptor is an accessor descriptor,
     * otherwise `false`.
     */
    get isAccessorType() {
        return Descriptor.isAccessorDescriptor(this.descriptor);
    }
    /**
     * Checks if the descriptor is a data descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    get isDataType() {
        return Descriptor.isDataDescriptor(this.descriptor);
    }
    /**
     * Checks if the descriptor is a base descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a base descriptor,
     * otherwise `false`.
     */
    get isBase() {
        return Descriptor.isBaseDescriptor(this.descriptor);
    }
    /**
     * Returns the `configurable` property of the wrapped descriptor if it
     * is present. If the property is not present, `false` is returned.
     *
     * @returns {boolean} `true` if the `configurable` property is in the
     * descriptor object and true, false if it is not present or false
     */
    get isConfigurable() {
        return !!this.descriptor?.configurable;
    }
    /**
     * Returns true if the `configurable` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `configurable` property has been
     * set with any value on the wrapped descriptor
     */
    get hasConfigurable() {
        return Reflect.has(this.descriptor, 'configurable');
    }
    /**
     * Returns the `writable` property of the wrapped descriptor if it
     * is present. If the property is not present, `false` is returned.
     *
     * @returns {boolean} `true` if the `writable` property is in the
     * descriptor object and true, false if it is not present or false
     */
    get isWritable() {
        return !!this.descriptor?.writable;
    }
    /**
     * Returns true if the `writable` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `writable` property has been
     * set with any value on the wrapped descriptor
     */
    get hasWritable() {
        return Reflect.has(this.descriptor, 'writable');
    }
    /**
     * Returns the `enumerable` property of the wrapped descriptor if it
     * is present. If the property is not present, `false` is returned.
     *
     * @returns {boolean} `true` if the `enumerable` property is in the
     * descriptor object and true, false if it is not present or false
     */
    get isEnumerable() {
        return !!this.descriptor?.enumerable;
    }
    /**
     * Returns true if the `enumerable` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `enumerable` property has been
     * set with any value on the wrapped descriptor
     */
    get hasEnumerable() {
        return Reflect.has(this.descriptor, 'enumerable');
    }
    /**
     * Returns the `value` property of the wrapped descriptor if it
     * is present.
     *
     * @returns {any} the result will be `undefined` if the descriptor
     * value is undefined or not present
     */
    get value() {
        return this.descriptor?.value;
    }
    /**
     * Returns true if the `value` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `value` property has been
     * set with any value on the wrapped descriptor
     */
    get hasValue() {
        return Reflect.has(this.descriptor, 'value');
    }
    /**
    * Returns true if the `set` property has been set on the
    * wrapped descriptor object
    *
    * @returns {boolean} `true` if the `set` property has been
    * set with any value on the wrapped descriptor
    */
    get hasSet() {
        return Reflect.has(this.descriptor, 'set');
    }
    /**
     * Returns true if the `get` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `get` property has been
     * set with any value on the wrapped descriptor
     */
    get hasGet() {
        return Reflect.has(this.descriptor, 'get');
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
        return [this.descriptor?.get, this.descriptor?.set];
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
        return Descriptor.canChange(this.descriptor);
    }
    /**
     * Based on the properties of the wrapped descriptor, `canDelete()` will
     * return true if the descriptor has a `configurable` property set to true
     *
     * @returns {boolean} `true` if the conditions are met at the property
     * can be deleted, `false` otherwise
     */
    get canDelete() {
        return Descriptor.canDelete(this.descriptor);
    }
    /**
     * Overrides the default toStringTag.
     *
     * @returns {string} The name of the constructor.
     */
    get [Symbol.toStringTag]() { return this.constructor.name; }
    // MARK: - NodeJS REPL Inspect Code
    [Symbol.for('nodejs.util.inspect.custom')](depth, opts, inspect) {
        const { red, green, yellow, cyan, underlined } = inspectToolKit(depth, opts, inspect);
        const contextStr = (this.#property && this.#thisObj
            ? `context:${green('true')}`
            : ((!this.#property && this.#thisObj)
                ? `context:${yellow('object')}`
                : ((this.#property && !this.#thisObj)
                    ? `context:${yellow('property')}`
                    : '')));
        const accessorStr = (this.isAccessorType
            ? `accessors:${((this.hasGet && !this.hasSet)
                ? cyan('[Get]')
                : ((!this.hasGet && this.hasSet)
                    ? cyan('[Set]')
                    : ((this.hasGet && this.hasSet)
                        ? cyan('[Get/Set]')
                        : '')))}`
            : '');
        const dataStr = (this.isDataType
            ? `valuePresent:${this.hasValue ? green(true) : red(false)}`
            : ``);
        const typeStr = (this.isAccessorType
            ? '[ACCESSOR]'
            : (this.isDataType ? '[DATA]' : ''));
        const modifyStr = (this.canDelete
            ? `modifiable:${green('all')}`
            : (this.chanChange
                ? `modifiable:${yellow('value-only')}`
                : ''));
        return [
            `${this.constructor.name}${typeStr} {`,
            `${underlined(this.property && String(this.property) || '')}`,
            `${contextStr.trim()}`,
            `${modifyStr.trim()}`,
            `${accessorStr.trim()}`,
            `${dataStr.trim()}`,
            '}'
        ].filter(s => s.length).join(' ');
    }
    // MARK: - Private properties and functions
    /**
     * An optional object that provides context to the functions
     * that might be used on this descriptor.
     */
    #thisObj = null;
    /**
     * The name of the property this descriptor represents
     */
    #property = null;
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
        const instance = new Descriptor(descriptor);
        if (instance.isAccessorType && instance.isConfigurable)
            return true;
        if (instance.isDataType) {
            if (instance.hasWritable)
                return instance.isWritable;
            if (instance.hasConfigurable)
                return instance.isConfigurable;
        }
        return false;
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
        const instance = new Descriptor(descriptor);
        // It is important to check for the existance of the property
        // on the descriptor in addition to its value.
        if (instance.hasConfigurable && instance.isConfigurable)
            return true;
        return false;
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
        const result = {};
        if (!descriptor || !Descriptor.isDescriptor(descriptor))
            return result;
        for (let [key, value] of Object.entries(descriptor)) {
            if (value !== undefined && Descriptor.descriptorKeys.includes(key))
                result[key] = value;
        }
        return result;
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
            return object;
        const { isDescriptor } = Descriptor;
        let descriptor = isDescriptor(object) ? object : null;
        if (descriptor && !(descriptor instanceof Descriptor)) {
            descriptor = new Descriptor(descriptor);
        }
        return descriptor;
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
        const descriptors = Object.getOwnPropertyDescriptors(object);
        const keys = Descriptor.keysFor(object);
        const defTransform = (_, value) => value;
        const results = asEntries ? [] : {};
        const modify = (transform
            ? ((transform !== 'instance' && (typeof transform === 'function'))
                ? transform
                : (key, value) => new Descriptor(value, 'base', object, key))
            : defTransform);
        // Symbols do not show up with .keys or .entries
        for (const key of keys) {
            const value = modify(key, descriptors[key]);
            if (asEntries) {
                if (asEntries === 'keys')
                    results.push(key);
                else if (asEntries === 'values')
                    results.push(value);
                else
                    results.push([key, value]);
            }
            else
                results[key] = value;
        }
        return results;
    }
    /**
     * Rather than fetching all the descriptors on a given object, this method
     * attempts to return the single named descriptor.
     *
     * @param {object} object the object from which the descriptor should be taken
     * @param {string|symbol} descriptorName the name or symbol denoting the
     * descriptor that should be taken from the object.
     * @param {boolean} asRaw if true, which is the default, the descriptor
     * object returned will be a standard JavaScript descriptor. If false, an
     * instance of `Descriptor` will be returned, wrapping the basic object.
     * @returns one of null, a descriptor object or an instance of Descriptor
     */
    static descriptorFor(object, descriptorName, asRaw = true) {
        const keys = Descriptor.keysFor(object);
        if (keys.includes(descriptorName)) {
            const raw = Object.getOwnPropertyDescriptor(object, descriptorName);
            if (asRaw || !raw) {
                return raw;
            }
            const instance = new Descriptor(raw, this.BASE, object, descriptorName);
            return instance;
        }
    }
    /**
     * Iterates over the descriptors of an object and invokes the provided
     * iterator function for each descriptor. The signature of the iteratorFn is
     *
     * ```js
     * (entry, index, array) => { ... }
     * ```
     *
     * Where entry is a [key, value] pair for each entry in the array. The key
     * can be either a string or a symbol.
     *
     *
     * @param {object} object - The object whose descriptors will be iterated over.
     * @param {Function} iteratorFn - The function to be invoked for each
     * descriptor. It receives three arguments: the descriptor entry, the index,
     * and the array of descriptors.
     */
    static descriptorsForEach(object, iteratorFn) {
        const descriptors = Descriptor.descriptorsFor(object, false, true);
        descriptors.forEach((entry, index, array) => {
            iteratorFn?.(entry, index, array);
        });
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
        const keys = [];
        const stringKeys = Object.getOwnPropertyNames(object);
        const descriptors = Object.getOwnPropertyDescriptors(object);
        let symbolKeys = Object.getOwnPropertySymbols(object);
        if (stringifySymbols) {
            symbolKeys = symbolKeys.map(symbol => String(symbol));
        }
        return stringKeys.concat(symbolKeys).filter(key => {
            if (!nonEnumerable) {
                return descriptors[key]?.enumerable ? true : false;
            }
            return true;
        });
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
        const values = [];
        const keys = Descriptor.keysFor(object);
        // Symbols do not show up with .keys or .entries
        for (const key of keys)
            values.push(asEntries ? [key, object[key]] : object[key]);
        return values;
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
        return Descriptor.valuesFor(object, true);
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
            return false;
        const onlyDefined = Descriptor.definedOnly(descriptor);
        const has = Reflect.has.bind(Reflect, onlyDefined);
        if (has('value') || has('writable'))
            return false;
        return (has('get') || has('set'));
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
            return false;
        const onlyDefined = Descriptor.definedOnly(descriptor);
        const has = Reflect.has.bind(Reflect, onlyDefined);
        if (!(has('get') || has('set') || has('writable') || has('value')))
            return true;
        return false;
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
            return false;
        const onlyDefined = Descriptor.definedOnly(descriptor);
        const has = Reflect.has.bind(Reflect, onlyDefined);
        if (has('get') || has('set'))
            return false;
        return (has('value') || has('writable'));
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
            return false;
        const { descriptorKeys } = Descriptor;
        const has = Reflect.has.bind(Reflect, object);
        const present = [];
        for (let key of Object.keys(object)) {
            if (descriptorKeys.includes(key) && object[key] !== undefined)
                present.push(key);
        }
        const checks = present.map(key => {
            if (['enumerable', 'configurable', 'writable'].includes(key))
                return typeof object[key] === 'boolean';
            else if (['get', 'set'].includes(key))
                return typeof object[key] === 'function';
            return key === 'value';
        });
        if ((has('get') || has('set')) && (has('value') || has('writable'))) {
            return false;
        }
        return checks.every(element => !!element);
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
            return false;
        }
        return (object instanceof Descriptor);
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
    static newDataDescriptor({ value, writable }, base = Descriptor.VISIBLE, { object, property } = { object: undefined, property: undefined }) {
        const { definedOnly, normalizeBase } = Descriptor;
        const _base = normalizeBase(base);
        const output = definedOnly({ ..._base, value, writable });
        return (object && property)
            ? new Descriptor(output, base, object, property)
            : output;
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
    static newAccessorDescriptor({ get, set }, base = Descriptor.VISIBLE, { object, property } = { object: undefined, property: undefined }) {
        const { definedOnly, normalizeBase } = Descriptor;
        const _base = normalizeBase(base);
        const output = definedOnly({ ..._base, get, set });
        return (object && property)
            ? new Descriptor(output, base, object, property)
            : output;
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
        let rawDescriptor = Descriptor.BaseDescriptor;
        if (baseDeclaration) {
            if ((typeof baseDeclaration === 'string') ||
                baseDeclaration instanceof String) {
                rawDescriptor = Descriptor.known.get(baseDeclaration);
                if (!rawDescriptor) {
                    rawDescriptor = Descriptor.VisibleDescriptor;
                }
            }
            else if (Descriptor.isDescriptor(baseDeclaration)) {
                rawDescriptor = Descriptor.definedOnly(baseDeclaration);
            }
        }
        return { ...rawDescriptor };
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
    static rawDescriptor(type, typeProps, base = Descriptor.VISIBLE, makeInstance = { object: undefined, property: undefined }) {
        const { newAccessorDescriptor, newDataDescriptor, ACCESSOR, DATA } = this;
        switch (type) {
            case [ACCESSOR]:
                return newAccessorDescriptor(typeProps, base, makeInstance);
            case [DATA]:
            default:
                return newDataDescriptor(typeProps, base, makeInstance);
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
    ];
    /**
     * A map of known base descriptor types.
     */
    static known = new Map([
        ['base', Descriptor.BaseDescriptor],
        ['visible', Descriptor.VisibleDescriptor],
        ['open', Descriptor.OpenDescriptor],
    ]);
    // MARK: - Static constants
    /**
     * The 'base' descriptor type constant.
     *
     * @returns {string} Descriptor type 'base'.
     */
    static get BASE() {
        return 'base';
    }
    /**
     * The 'visible' descriptor type constant.
     *
     * @returns {string} Descriptor type 'visible'.
     */
    static get VISIBLE() {
        return 'visible';
    }
    /**
     * The 'open' descriptor type constant.
     *
     * @returns {string} Descriptor type 'open'.
     */
    static get OPEN() {
        return 'open';
    }
    /**
     * The 'data' descriptor type constant.
     *
     * @returns {string} Descriptor type 'data'.
     */
    static get DATA() {
        return 'data';
    }
    /**
     * The 'accessor' descriptor type constant.
     *
     * @returns {string} Descriptor type 'accessor'.
     */
    static get ACCESSOR() {
        return 'accessor';
    }
    /**
     * Provides an array of base descriptor types. Useful for validation or enumeration.
     *
     * @returns {string[]} Array of base descriptor types.
     */
    static get BASE_TYPES() { return [this.BASE, this.VISIBLE, this.OPEN]; }
    /**
     * Provides an array of descriptor types. Useful for validation or enumeration.
     *
     * @returns {string[]} Array of descriptor types.
     */
    static get TYPES() { return [this.DATA, this.ACCESSOR]; }
    /**
     * Gets a new copy of the base descriptor with default settings: not enumerable,
     * not configurable.
     *
     * @returns {object} Base descriptor object.
     */
    static get BaseDescriptor() {
        return { enumerable: false, configurable: false };
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable.
     *
     * @returns {object} Base descriptor object.
     */
    static get VisibleDescriptor() {
        return { enumerable: true, configurable: false };
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable.
     *
     * @returns {object} Base descriptor object.
     */
    static get OpenDescriptor() {
        return { enumerable: true, configurable: true };
    }
    /**
     * Gets a new copy of the base descriptor with default settings: not enumerable,
     * not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {Descriptor} Base descriptor object.
     */
    static get BaseDescriptorInstance() {
        return new Descriptor({ enumerable: false, configurable: false });
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {Descriptor} Base descriptor object.
     */
    static get VisibleDescriptorInstance() {
        return new Descriptor({ enumerable: true, configurable: false });
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {Descriptor} Base descriptor object.
     */
    static get OpenDescriptorInstance() {
        return new Descriptor({ enumerable: true, configurable: true });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZXNjcmlwdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDbkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFFdkQ7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFVBQVU7SUFDckI7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0gsWUFDRSxVQUFVLEdBQUcsRUFBRSxFQUNmLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUN0QixPQUFPLEVBQ1AsUUFBUTtRQUVSLElBQUksVUFBVSxZQUFZLFVBQVUsRUFBRTtZQUNwQyxPQUFPLElBQUksVUFBVSxDQUNuQixVQUFVLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFDckMsVUFBVSxDQUFDLElBQUksRUFDZixVQUFVLENBQUMsT0FBTyxFQUNsQixVQUFVLENBQUMsUUFBUSxDQUNwQixDQUFBO1NBQ0Y7UUFFRCxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFBO1NBQzFCO1FBRUQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtTQUN4QjtRQUVELE1BQU0sRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsR0FBRyxVQUFVLENBQUE7UUFFdkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO1lBQ2hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDekIsTUFBTSxTQUFTLENBQUE7U0FDaEI7UUFFRCxNQUFNLEtBQUssR0FBRyxL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