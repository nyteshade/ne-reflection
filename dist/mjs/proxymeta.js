import { Descriptor } from './descriptor.js';
/**
 * Represents a ProxyMeta object that provides metadata and
 * manipulation methods for a target object.
 *
 * @class
 */
export class ProxyMeta {
    /**
     * Constructs a new ProxyMeta object.
     *
     * @param {Object} object - The object to be proxied.
     */
    constructor(object) {
        this.object = object;
        this.thaw();
    }
    /**
     * Gets the properties of the object.
     *
     * @returns {Array} The properties of the object.
     */
    get props() {
        return (this.#isFrozen
            ? this.#onIce?.props || []
            : Descriptor.descriptorsFor(this.object, 'instance', 'values'));
    }
    get keys() {
        return (this.#isFrozen
            ? this.#onIce?.keys || []
            : Descriptor.keysFor(this.object));
    }
    /**
     * Get the values of the ProxyMeta object.
     *
     * @returns {Array} The values of the ProxyMeta object.
     */
    get values() {
        return (this.#isFrozen
            ? this.#onIce?.values || []
            : Descriptor.valuesFor(this.object));
    }
    /**
     * Freezes the object by assigning the current `props`, `keys`,
     * and `values` to the onIce object and sets the `isFrozen` flag
     * to true.
     */
    freeze() {
        this.#onIce.props = this.props;
        this.#onIce.keys = this.keys;
        this.#onIce.values = this.values;
        this.#isFrozen = true;
    }
    /**
     * Thaws the object by setting #isFrozen to false and
     * resetting the private `#onIce` property.
     */
    thaw() {
        this.#isFrozen = false;
        this.#onIce = { props: [], keys: [], values: [] };
    }
    /**
     * Returns a sealed empty instance that can be triple equal compared
     * when the instance reference is passed around.
     *
     * @returns {ProxyMeta} a shared empty instance of ProxyMeta that can
     * be used in lieu of null as a default instance.
     */
    static get Empty() {
        return this.#emptyInstance;
    }
    /**
     * Represents the onIce property.
     * @type {null}
     */
    #onIce = null;
    /**
     * Indicates whether the object is frozen.
     * @type {boolean}
     */
    #isFrozen = false;
    /**
     * Represents an empty instance of ProxyMeta.
     *
     * @type {ProxyMeta}
     * @private
     * @static
     */
    static #emptyInstance = Object.freeze(new ProxyMeta({}));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHltZXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb3h5bWV0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFFNUM7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sU0FBUztJQUNwQjs7OztPQUlHO0lBQ0gsWUFBWSxNQUFNO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxLQUFLO1FBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTO1lBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFCLENBQUMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUztZQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLElBQUksRUFBRTtZQUN6QixDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksTUFBTTtRQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUztZQUNwQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksRUFBRTtZQUMzQixDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU07UUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFBO0lBQ25ELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxNQUFNLEtBQUssS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUViOzs7T0FHRztJQUNILFNBQVMsR0FBRyxLQUFLLENBQUE7SUFHakI7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUEifQ==