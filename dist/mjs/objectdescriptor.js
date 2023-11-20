/**
 * Represents a descriptor for object properties, distinguishing between
 * data descriptors and accessor descriptors.
 */
export class ObjectDescriptor {
    /**
     * Creates an instance of ObjectDescriptor.
     *
     * @param {Object} descriptor - The property descriptor object.
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
    constructor(descriptor = {}, base = ObjectDescriptor.BASE, thisObj, property) {
        if (descriptor instanceof ObjectDescriptor) {
            descriptor = { ...descriptor.descriptor };
        }
        if (property) {
            this.#property = property;
        }
        if (thisObj) {
            this.#thisObj = thisObj;
        }
        const { known, BaseDescriptor, isDescriptor, definedOnly } = ObjectDescriptor;
        if (!isDescriptor(descriptor)) {
            throw new TypeError('Invalid descriptor properties');
        }
        const _base = known.get(base) ?? BaseDescriptor;
        this.descriptor = { ..._base, ...definedOnly(descriptor) };
    }
    get property() {
        return this.#property ?? null;
    }
    get thisObj() {
        return this.#thisObj ?? null;
    }
    /**
     * Gets the descriptor type as a string.
     *
     * @returns {string} The descriptor type ('accessor', 'data', or 'base').
     */
    get type() {
        const { ACCESSOR, DATA, BASE } = ObjectDescriptor;
        return this.isAccessor
            ? ACCESSOR
            : (this.isDataDescriptor ? DATA : BASE);
    }
    /**
     * Checks if the descriptor is an accessor descriptor.
     *
     * @returns {boolean} `true` if the descriptor is an accessor descriptor,
     * otherwise `false`.
     */
    get isAccessor() {
        return ObjectDescriptor.isAccessorDescriptor(this.descriptor);
    }
    /**
     * Checks if the descriptor is a data descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    get isDataDescriptor() {
        return ObjectDescriptor.isDataDescriptor(this.descriptor);
    }
    /**
     * Checks if the descriptor is a base descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a base descriptor,
     * otherwise `false`.
     */
    get isBase() {
        return ObjectDescriptor.isBaseDescriptor(this.descriptor);
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
        return ObjectDescriptor.canChange(this.descriptor);
    }
    /**
     * Based on the properties of the wrapped descriptor, `canDelete()` will
     * return true if the descriptor has a `configurable` property set to true
     *
     * @returns {boolean} `true` if the conditions are met at the property
     * can be deleted, `false` otherwise
     */
    get canDelete() {
        return ObjectDescriptor.canDelete(this.descriptor);
    }
    /**
     * If the object for which this descriptor is based on is required in
     * order to accurately retrieve the value for computed getters and
     * in the case of data descriptors, the value returned can only be
     * accurately retrieved if the property name this descriptor describes
     * is also provided.
     *
     * @param {Object} object the object that this descriptor is take from
     * @param {string|symbol} property the name of the property this
     * descriptor describes
     * @returns whatever the value of the descriptor or its function states
     * it will be.
     */
    computeValue(object, property) {
        const prefix = '[ObjectDescriptor][computeValue]';
        const thisObj = object ?? (this.#thisObj ?? null);
        const prop = property ?? (this.#property ?? null);
        if (this.isAccessor) {
            const [getter] = this.accessors;
            if (this.hasGet && thisObj)
                return getter.bind(thisObj)();
            console.warn(`${prefix} Cannot retrieve value without 'object'`);
            return undefined;
        }
        else if (this.isDataDescriptor) {
            if (this.hasValue && thisObj && prop) {
                return thisObj[prop];
            }
            console.warn(`${prefix} Cannot retrieve value without 'object' and 'property'`);
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
     * @param {Object} object the `this` object the descriptor describes.
     * @param {string|symbol} property the name of the property this descriptor
     * describes
     * @returns true if the set was successful, false otherwise
     */
    alterValue(newValue, object, property) {
        const thisObj = object ?? (this.#thisObj ?? null);
        const prop = property ?? (this.#property ?? null);
        const descObj = descriptor instanceof ObjectDescriptor
            ? descriptor
            : new ObjectDescriptor(descriptor);
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
                if (this.#property && thisObj) {
                    thisObj[prop] = newValue;
                    this.descriptor.value = newValue;
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Overrides the default toStringTag.
     *
     * @returns {string} The name of the constructor.
     */
    get [Symbol.toStringTag]() { return this.constructor.name; }
    /**
     * An optional object that provides context to the functions
     * that might be used on this descriptor.
     */
    #thisObj = null;
    /**
     * The name of the property this descriptor represents
     */
    #property = null;
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
        const { descriptorKeys } = ObjectDescriptor;
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
        const instance = new ObjectDescriptor(descriptor);
        if (instance.isAccessor && instance.isConfigurable)
            return true;
        if (instance.isDataDescriptor) {
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
        const instance = new ObjectDescriptor(descriptor);
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
        if (!descriptor || !ObjectDescriptor.isDescriptor(descriptor))
            return result;
        for (let [key, value] of Object.entries(descriptor)) {
            if (value !== undefined && ObjectDescriptor.descriptorKeys.includes(key))
                result[key] = value;
        }
        return result;
    }
    /**
     * Checks if the provided descriptor is an base descriptor.
     *
     * @param {Object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is an base descriptor,
     * otherwise `false`.
     */
    static isBaseDescriptor(descriptor) {
        if (!descriptor || !ObjectDescriptor.isDescriptor(descriptor))
            return false;
        const onlyDefined = ObjectDescriptor.definedOnly(descriptor);
        const has = Reflect.has.bind(Reflect, onlyDefined);
        if (!(has('get') || has('set') || has('writable') || has('value')))
            return true;
        return false;
    }
    /**
     * Checks if the provided descriptor is a data descriptor.
     *
     * @param {Object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    static isDataDescriptor(descriptor) {
        if (!descriptor || !ObjectDescriptor.isDescriptor(descriptor))
            return false;
        const onlyDefined = ObjectDescriptor.definedOnly(descriptor);
        const has = Reflect.has.bind(Reflect, onlyDefined);
        if (has('get') || has('set'))
            return false;
        return (has('value') || has('writable'));
    }
    /**
     * Checks if the provided descriptor is an accessor descriptor.
     *
     * @param {Object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is an accessor descriptor,
     * otherwise `false`.
     */
    static isAccessorDescriptor(descriptor) {
        if (!descriptor || !ObjectDescriptor.isDescriptor(descriptor))
            return false;
        const onlyDefined = ObjectDescriptor.definedOnly(descriptor);
        const has = Reflect.has.bind(Reflect, onlyDefined);
        if (has('value') || has('writable'))
            return false;
        return (has('get') || has('set'));
    }
    /**
     * Creates a new data descriptor.
     *
     * @param {Object} descriptor - The data descriptor to create.
     * @param {*} descriptor.value - The value for the property.
     * @param {boolean} descriptor.writable - Indicates if the property's
     * value can be changed.
     * @param {string} [base=ObjectDescriptor.VISIBLE] - The base descriptor
     * type as a string, which will determine the default properties.
     * @returns {Object} A new data descriptor object.
     */
    static newDataDescriptor({ value, writable }, base = ObjectDescriptor.VISIBLE, object = undefined, property = undefined, makeInstance = false) {
        const { known, VisibleDescriptor } = ObjectDescriptor;
        const _base = known.get(base.toLowerCase()) ?? VisibleDescriptor;
        const output = { ..._base, value, writable };
        return makeInstance
            ? new ObjectDescriptor(output, base, object, property)
            : output;
    }
    /**
     * Creates a new accessor descriptor.
     *
     * @param {Object} descriptor - The accessor descriptor to create.
     * @param {function} descriptor.get - The getter function for the property.
     * @param {function} descriptor.set - The setter function for the property.
     * @param {string} [base=ObjectDescriptor.VISIBLE] - The base descriptor
     * type as a string, which will determine the default properties.
     * @returns {Object} A new accessor descriptor object.
     */
    static newAccessorDescriptor({ get, set }, base = ObjectDescriptor.VISIBLE, object = undefined, property = undefined, makeInstance = false) {
        const { known, VisibleDescriptor } = ObjectDescriptor;
        const _base = known.get(base.toLowerCase()) ?? VisibleDescriptor;
        const output = { ..._base, get, set };
        return makeInstance
            ? new ObjectDescriptor(output, base, object, property)
            : output;
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
        if (object && (object instanceof ObjectDescriptor))
            return object;
        const { isDescriptor } = ObjectDescriptor;
        let descriptor = isDescriptor(object) ? object : null;
        if (descriptor && !(descriptor instanceof ObjectDescriptor)) {
            descriptor = new ObjectDescriptor(descriptor);
        }
        return descriptor;
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
        return (object instanceof ObjectDescriptor);
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
        ['base', ObjectDescriptor.BaseDescriptor],
        ['visible', ObjectDescriptor.VisibleDescriptor],
        ['open', ObjectDescriptor.OpenDescriptor],
    ]);
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
     * @returns {Object} Base descriptor object.
     */
    static get BaseDescriptor() {
        return { enumerable: false, configurable: false };
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable.
     *
     * @returns {Object} Base descriptor object.
     */
    static get VisibleDescriptor() {
        return { enumerable: true, configurable: false };
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable.
     *
     * @returns {Object} Base descriptor object.
     */
    static get OpenDescriptor() {
        return { enumerable: true, configurable: true };
    }
    /**
     * Gets a new copy of the base descriptor with default settings: not enumerable,
     * not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {ObjectDescriptor} Base descriptor object.
     */
    static get BaseDescriptorInstance() {
        return new ObjectDescriptor({ enumerable: false, configurable: false });
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {ObjectDescriptor} Base descriptor object.
     */
    static get VisibleDescriptorInstance() {
        return new ObjectDescriptor({ enumerable: true, configurable: false });
    }
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {ObjectDescriptor} Base descriptor object.
     */
    static get OpenDescriptorInstance() {
        return new ObjectDescriptor({ enumerable: true, configurable: true });
    }
}
