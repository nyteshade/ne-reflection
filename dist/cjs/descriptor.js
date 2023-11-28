"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Descriptor_thisObj, _Descriptor_property;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descriptor = void 0;
const ne_pubsub_1 = require("@nyteshade/ne-pubsub");
const utils_js_1 = require("./utils.js");
/**
 * Represents a descriptor for object properties, distinguishing between
 * data descriptors and accessor descriptors.
 */
class Descriptor {
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
        // MARK: - Private properties and functions
        /**
         * An optional object that provides context to the functions
         * that might be used on this descriptor.
         */
        _Descriptor_thisObj.set(this, null
        /**
         * The name of the property this descriptor represents
         */
        );
        /**
         * The name of the property this descriptor represents
         */
        _Descriptor_property.set(this, null
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
        );
        if (descriptor instanceof Descriptor) {
            return new Descriptor((0, utils_js_1.objectCopy)({}, descriptor.descriptor), Descriptor.BASE, descriptor.thisObj, descriptor.property);
        }
        if (property) {
            __classPrivateFieldSet(this, _Descriptor_property, property, "f");
        }
        if (thisObj) {
            __classPrivateFieldSet(this, _Descriptor_thisObj, thisObj, "f");
        }
        const { known, BaseDescriptor, isDescriptor, definedOnly } = Descriptor;
        if (!isDescriptor(descriptor)) {
            const typeError = new TypeError('Invalid descriptor properties');
            ne_pubsub_1.Errors.capture(typeError);
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
        const thisObj = object ?? __classPrivateFieldGet(this, _Descriptor_thisObj, "f");
        const prop = property ?? __classPrivateFieldGet(this, _Descriptor_property, "f");
        if (this.isAccessorType) {
            const [getter] = this.accessors;
            if (this.hasGet && thisObj)
                return getter.bind(thisObj)();
            ne_pubsub_1.Logs.warn(`${prefix} Cannot retrieve value without 'object'`, thisObj);
            return undefined;
        }
        else if (this.isDataType) {
            if (this.hasValue && thisObj && prop) {
                return thisObj[prop];
            }
            ne_pubsub_1.Logs.warn(`${prefix} Cannot retrieve value without 'object' and 'property'`, thisObj, prop);
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
        const thisObj = object ?? (__classPrivateFieldGet(this, _Descriptor_thisObj, "f") ?? null);
        const prop = property ?? (__classPrivateFieldGet(this, _Descriptor_property, "f") ?? null);
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
        return __classPrivateFieldGet(this, _Descriptor_property, "f") ?? null;
    }
    /** Retrieve the optional object this descriptor is associated with */
    get thisObj() {
        return __classPrivateFieldGet(this, _Descriptor_thisObj, "f") ?? null;
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
    get [(_Descriptor_thisObj = new WeakMap(), _Descriptor_property = new WeakMap(), Symbol.toStringTag)]() { return this.constructor.name; }
    // MARK: - NodeJS REPL Inspect Code
    [Symbol.for('nodejs.util.inspect.custom')](depth, opts, inspect) {
        const { red, green, yellow, cyan, underlined } = (0, utils_js_1.inspectToolKit)(depth, opts, inspect);
        const contextStr = (__classPrivateFieldGet(this, _Descriptor_property, "f") && __classPrivateFieldGet(this, _Descriptor_thisObj, "f")
            ? `context:${green('true')}`
            : ((!__classPrivateFieldGet(this, _Descriptor_property, "f") && __classPrivateFieldGet(this, _Descriptor_thisObj, "f"))
                ? `context:${yellow('object')}`
                : ((__classPrivateFieldGet(this, _Descriptor_property, "f") && !__classPrivateFieldGet(this, _Descriptor_thisObj, "f"))
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
exports.Descriptor = Descriptor;
/**
 * Array of keys found in object descriptors for easier detection
 * of key value pairs.
 */
Descriptor.descriptorKeys = [
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
Descriptor.known = new Map([
    ['base', Descriptor.BaseDescriptor],
    ['visible', Descriptor.VisibleDescriptor],
    ['open', Descriptor.OpenDescriptor],
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZXNjcmlwdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUFtRDtBQUNuRCx5Q0FBdUQ7QUFFdkQ7OztHQUdHO0FBQ0gsTUFBYSxVQUFVO0lBQ3JCOzs7Ozs7Ozs7Ozs7Ozs7T0FlRztJQUNILFlBQ0UsVUFBVSxHQUFHLEVBQUUsRUFDZixJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksRUFDdEIsT0FBTyxFQUNQLFFBQVE7UUF3WFYsMkNBQTJDO1FBRTNDOzs7V0FHRztRQUNILDhCQUFXLElBQUk7UUFFZjs7V0FFRztVQUpZO1FBRWY7O1dBRUc7UUFDSCwrQkFBWSxJQUFJO1FBRWhCLDBDQUEwQztRQUUxQzs7Ozs7Ozs7O1dBU0c7VUFiYTtRQWpZZCxJQUFJLFVBQVUsWUFBWSxVQUFVLEVBQUU7WUFDcEMsT0FBTyxJQUFJLFVBQVUsQ0FDbkIsSUFBQSxxQkFBVSxFQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQ3JDLFVBQVUsQ0FBQyxJQUFJLEVBQ2YsVUFBVSxDQUFDLE9BQU8sRUFDbEIsVUFBVSxDQUFDLFFBQVEsQ0FDcEIsQ0FBQTtTQUNGO1FBRUQsSUFBSSxRQUFRLEVBQUU7WUFDWix1QkFBQSxJQUFJLHdCQUFhLFFBQVEsTUFBQSxDQUFBO1NBQzFCO1FBRUQsSUFBSSxPQUFPLEVBQUU7WUFDWCx1QkFBQSxJQUFJLHVCQUFZLE9BQU8sTUFBQSxDQUFBO1NBQ3hCO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxHQUFHLFVBQVUsQ0FBQTtRQUV2RSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLE1BQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLCtCQUErQixDQUFDLENBQUE7WUFDaEUsa0JBQU0sQ0FBQyxPQUFPLENB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