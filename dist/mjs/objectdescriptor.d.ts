/**
 * Represents a descriptor for object properties, distinguishing between
 * data descriptors and accessor descriptors.
 */
export class ObjectDescriptor {
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
    static isDescriptor(object: object): boolean;
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
    static canChange(descriptor: object): boolean;
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
    static canDelete(descriptor: object): boolean;
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
    static definedOnly(descriptor: object): object;
    /**
     * Checks if the provided descriptor is an base descriptor.
     *
     * @param {Object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is an base descriptor,
     * otherwise `false`.
     */
    static isBaseDescriptor(descriptor: Object): boolean;
    /**
     * Checks if the provided descriptor is a data descriptor.
     *
     * @param {Object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    static isDataDescriptor(descriptor: Object): boolean;
    /**
     * Checks if the provided descriptor is an accessor descriptor.
     *
     * @param {Object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is an accessor descriptor,
     * otherwise `false`.
     */
    static isAccessorDescriptor(descriptor: Object): boolean;
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
    static newData({ value, writable }: {
        value: any;
        writable: boolean;
    }, base?: string | undefined): Object;
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
    static newAccessorDescriptor({ get, set }: {
        get: Function;
        set: Function;
    }, base?: string | undefined): Object;
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
    static from(object: object): object | null;
    /**
     * Checks to see if the supplied object is an instance of
     * ObjectDescriptor. If true is returned, you can also be
     * assured the value supplied is truthy and an object.
     *
     * @param {any} object any value that is to be checked for
     * being an instance of `ObjectDescriptor`
     * @returns true if its an instance, false otherwise
     */
    static isDescriptorInstance(object: any): boolean;
    /**
     * Array of keys found in object descriptors for easier detection
     * of key value pairs.
     */
    static descriptorKeys: string[];
    /**
     * A map of known base descriptor types.
     */
    static known: Map<string, Object>;
    /**
     * The 'base' descriptor type constant.
     *
     * @returns {string} Descriptor type 'base'.
     */
    static get BASE(): string;
    /**
     * The 'visible' descriptor type constant.
     *
     * @returns {string} Descriptor type 'visible'.
     */
    static get VISIBLE(): string;
    /**
     * The 'open' descriptor type constant.
     *
     * @returns {string} Descriptor type 'open'.
     */
    static get OPEN(): string;
    /**
     * The 'data' descriptor type constant.
     *
     * @returns {string} Descriptor type 'data'.
     */
    static get DATA(): string;
    /**
     * The 'accessor' descriptor type constant.
     *
     * @returns {string} Descriptor type 'accessor'.
     */
    static get ACCESSOR(): string;
    /**
     * Provides an array of base descriptor types. Useful for validation or enumeration.
     *
     * @returns {string[]} Array of base descriptor types.
     */
    static get BASE_TYPES(): string[];
    /**
     * Provides an array of descriptor types. Useful for validation or enumeration.
     *
     * @returns {string[]} Array of descriptor types.
     */
    static get TYPES(): string[];
    /**
     * Gets a new copy of the base descriptor with default settings: not enumerable,
     * not configurable.
     *
     * @returns {Object} Base descriptor object.
     */
    static get BaseDescriptor(): Object;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable.
     *
     * @returns {Object} Base descriptor object.
     */
    static get VisibleDescriptor(): Object;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable.
     *
     * @returns {Object} Base descriptor object.
     */
    static get OpenDescriptor(): Object;
    /**
     * Gets a new copy of the base descriptor with default settings: not enumerable,
     * not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {ObjectDescriptor} Base descriptor object.
     */
    static get BaseDescriptorInstance(): ObjectDescriptor;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {ObjectDescriptor} Base descriptor object.
     */
    static get VisibleDescriptorInstance(): ObjectDescriptor;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {ObjectDescriptor} Base descriptor object.
     */
    static get OpenDescriptorInstance(): ObjectDescriptor;
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
    constructor(descriptor?: {
        configurable?: boolean | undefined;
        enumerable?: boolean | undefined;
        value?: any;
        writable?: boolean | undefined;
        get?: Function | undefined;
        set?: Function | undefined;
    }, base?: string);
    descriptor: {
        constructor: Function;
        toString(): string;
        toLocaleString(): string;
        valueOf(): Object;
        hasOwnProperty(v: PropertyKey): boolean;
        isPrototypeOf(v: Object): boolean;
        propertyIsEnumerable(v: PropertyKey): boolean;
    };
    /**
     * Gets the descriptor type as a string.
     *
     * @returns {string} The descriptor type ('accessor', 'data', or 'base').
     */
    get type(): string;
    /**
     * Checks if the descriptor is an accessor descriptor.
     *
     * @returns {boolean} `true` if the descriptor is an accessor descriptor,
     * otherwise `false`.
     */
    get isAccessor(): boolean;
    /**
     * Checks if the descriptor is a data descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    get isData(): boolean;
    /**
     * Checks if the descriptor is a base descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a base descriptor,
     * otherwise `false`.
     */
    get isBase(): boolean;
    /**
     * Returns the `configurable` property of the wrapped descriptor if it
     * is present. If the property is not present, `false` is returned.
     *
     * @returns {boolean} `true` if the `configurable` property is in the
     * descriptor object and true, false if it is not present or false
     */
    get isConfigurable(): boolean;
    /**
     * Returns true if the `configurable` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `configurable` property has been
     * set with any value on the wrapped descriptor
     */
    get hasConfigurable(): boolean;
    /**
     * Returns the `writable` property of the wrapped descriptor if it
     * is present. If the property is not present, `false` is returned.
     *
     * @returns {boolean} `true` if the `writable` property is in the
     * descriptor object and true, false if it is not present or false
     */
    get isWritable(): boolean;
    /**
     * Returns true if the `writable` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `writable` property has been
     * set with any value on the wrapped descriptor
     */
    get hasWritable(): boolean;
    /**
     * Returns the `enumerable` property of the wrapped descriptor if it
     * is present. If the property is not present, `false` is returned.
     *
     * @returns {boolean} `true` if the `enumerable` property is in the
     * descriptor object and true, false if it is not present or false
     */
    get isEnumerable(): boolean;
    /**
     * Returns true if the `enumerable` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `enumerable` property has been
     * set with any value on the wrapped descriptor
     */
    get hasEnumerable(): boolean;
    /**
     * Returns the `value` property of the wrapped descriptor if it
     * is present.
     *
     * @returns {any} the result will be `undefined` if the descriptor
     * value is undefined or not present
     */
    get value(): any;
    /**
     * Returns true if the `value` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `value` property has been
     * set with any value on the wrapped descriptor
     */
    get hasValue(): boolean;
    /**
    * Returns true if the `set` property has been set on the
    * wrapped descriptor object
    *
    * @returns {boolean} `true` if the `set` property has been
    * set with any value on the wrapped descriptor
    */
    get hasSet(): boolean;
    /**
     * Returns true if the `get` property has been set on the
     * wrapped descriptor object
     *
     * @returns {boolean} `true` if the `get` property has been
     * set with any value on the wrapped descriptor
     */
    get hasGet(): boolean;
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
    get accessors(): Function[];
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
    get canChange(): boolean;
    /**
     * Based on the properties of the wrapped descriptor, `canDelete()` will
     * return true if the descriptor has a `configurable` property set to true
     *
     * @returns {boolean} `true` if the conditions are met at the property
     * can be deleted, `false` otherwise
     */
    get canDelete(): boolean;
    /**
     * Overrides the default toStringTag.
     *
     * @returns {string} The name of the constructor.
     */
    get [Symbol.toStringTag](): string;
}
