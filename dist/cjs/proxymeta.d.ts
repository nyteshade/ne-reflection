/**
 * Represents a ProxyMeta object that provides metadata and
 * manipulation methods for a target object.
 *
 * @class
 */
export class ProxyMeta {
    /**
     * Returns a sealed empty instance that can be triple equal compared
     * when the instance reference is passed around.
     *
     * @returns {ProxyMeta} a shared empty instance of ProxyMeta that can
     * be used in lieu of null as a default instance.
     */
    static get Empty(): ProxyMeta;
    /**
     * Represents an empty instance of ProxyMeta.
     *
     * @type {ProxyMeta}
     * @private
     * @static
     */
    private static "__#2@#emptyInstance";
    /**
     * Constructs a new ProxyMeta object.
     *
     * @param {Object} object - The object to be proxied.
     */
    constructor(object: Object);
    object: Object;
    /**
     * Gets the properties of the object.
     *
     * @returns {Array} The properties of the object.
     */
    get props(): any[];
    get keys(): any;
    /**
     * Get the values of the ProxyMeta object.
     *
     * @returns {Array} The values of the ProxyMeta object.
     */
    get values(): any[];
    /**
     * Freezes the object by assigning the current `props`, `keys`,
     * and `values` to the onIce object and sets the `isFrozen` flag
     * to true.
     */
    freeze(): void;
    /**
     * Thaws the object by setting #isFrozen to false and
     * resetting the private `#onIce` property.
     */
    thaw(): void;
    #private;
}
