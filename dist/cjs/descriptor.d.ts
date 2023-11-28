/**
 * Represents a descriptor for object properties, distinguishing between
 * data descriptors and accessor descriptors.
 */
export class Descriptor {
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
    static descriptorsFor(object: object, transform: Function, asEntries?: boolean): object;
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
    static descriptorFor(object: object, descriptorName: string | symbol, asRaw?: boolean): Descriptor | PropertyDescriptor | undefined;
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
    static descriptorsForEach(object: object, iteratorFn: Function): void;
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
    static keysFor(object: object, stringifySymbols?: boolean, nonEnumerable?: boolean): Array<string | symbol>;
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
    static valuesFor(object: object, asEntries?: boolean): any[];
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
    static entriesFrom(object: object): any[];
    /**
     * Checks if the provided descriptor is an accessor descriptor.
     *
     * @param {object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is an accessor descriptor,
     * otherwise `false`.
     */
    static isAccessorDescriptor(descriptor: object): boolean;
    /**
     * Checks if the provided descriptor is an base descriptor.
     *
     * @param {object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is an base descriptor,
     * otherwise `false`.
     */
    static isBaseDescriptor(descriptor: object): boolean;
    /**
     * Checks if the provided descriptor is a data descriptor.
     *
     * @param {object} descriptor - The descriptor to check.
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    static isDataDescriptor(descriptor: object): boolean;
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
    static newDataDescriptor({ value, writable }: {
        value: any;
        writable: boolean;
    }, base?: string | object, { object, property }?: {
        object: object;
        property: string | symbol;
    }): object;
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
    static newAccessorDescriptor({ get, set }: {
        get: Function;
        set: Function;
    }, base?: string | object, { object, property }?: {
        object: object;
        property: string | symbol;
    }): object;
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
    static normalizeBase(baseDeclaration: string | object): {};
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
    static rawDescriptor(type: string, typeProps: object, base?: string | object, makeInstance?: {
        object: object;
        property: string | symbol;
    }): object;
    /**
     * Array of keys found in object descriptors for easier detection
     * of key value pairs.
     */
    static descriptorKeys: string[];
    /**
     * A map of known base descriptor types.
     */
    static known: Map<string, object>;
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
     * @returns {object} Base descriptor object.
     */
    static get BaseDescriptor(): object;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable.
     *
     * @returns {object} Base descriptor object.
     */
    static get VisibleDescriptor(): object;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable.
     *
     * @returns {object} Base descriptor object.
     */
    static get OpenDescriptor(): object;
    /**
     * Gets a new copy of the base descriptor with default settings: not enumerable,
     * not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {Descriptor} Base descriptor object.
     */
    static get BaseDescriptorInstance(): Descriptor;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable,
     * but not configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {Descriptor} Base descriptor object.
     */
    static get VisibleDescriptorInstance(): Descriptor;
    /**
     * Gets a new copy of the base descriptor with default settings: enumerable
     * AND configurable. This returns an instance of ObjectDescriptor.
     *
     * @returns {Descriptor} Base descriptor object.
     */
    static get OpenDescriptorInstance(): Descriptor;
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
    constructor(descriptor: {
        configurable?: boolean | undefined;
        enumerable?: boolean | undefined;
        value?: any;
        writable?: boolean | undefined;
        get?: Function | undefined;
        set?: Function | undefined;
    } | undefined, base: string | undefined, thisObj: any, property: any);
    descriptor: {} | undefined;
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
    computeValue(object: object, property: string | symbol): any;
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
    alterValue(newValue: any, object: object, property: string | symbol): boolean;
    /** Retrieve the optional property this descriptor is associated with */
    get property(): null;
    /** Retrieve the optional object this descriptor is associated with */
    get thisObj(): null;
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
    get isAccessorType(): boolean;
    /**
     * Checks if the descriptor is a data descriptor.
     *
     * @returns {boolean} `true` if the descriptor is a data descriptor,
     * otherwise `false`.
     */
    get isDataType(): boolean;
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
    #private;
}
