"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _ProxyMeta_onIce, _ProxyMeta_isFrozen, _ProxyMeta_emptyInstance;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyMeta = void 0;
const descriptor_js_1 = require("./descriptor.js");
/**
 * Represents a ProxyMeta object that provides metadata and
 * manipulation methods for a target object.
 *
 * @class
 */
class ProxyMeta {
    /**
     * Constructs a new ProxyMeta object.
     *
     * @param {Object} object - The object to be proxied.
     */
    constructor(object) {
        /**
         * Represents the onIce property.
         * @type {null}
         */
        _ProxyMeta_onIce.set(this, null
        /**
         * Indicates whether the object is frozen.
         * @type {boolean}
         */
        );
        /**
         * Indicates whether the object is frozen.
         * @type {boolean}
         */
        _ProxyMeta_isFrozen.set(this, false
        /**
         * Represents an empty instance of ProxyMeta.
         *
         * @type {ProxyMeta}
         * @private
         * @static
         */
        );
        this.object = object;
        this.thaw();
    }
    /**
     * Gets the properties of the object.
     *
     * @returns {Array} The properties of the object.
     */
    get props() {
        return (__classPrivateFieldGet(this, _ProxyMeta_isFrozen, "f")
            ? __classPrivateFieldGet(this, _ProxyMeta_onIce, "f")?.props || []
            : descriptor_js_1.Descriptor.descriptorsFor(this.object, 'instance', 'values'));
    }
    get keys() {
        return (__classPrivateFieldGet(this, _ProxyMeta_isFrozen, "f")
            ? __classPrivateFieldGet(this, _ProxyMeta_onIce, "f")?.keys || []
            : descriptor_js_1.Descriptor.keysFor(this.object));
    }
    /**
     * Get the values of the ProxyMeta object.
     *
     * @returns {Array} The values of the ProxyMeta object.
     */
    get values() {
        return (__classPrivateFieldGet(this, _ProxyMeta_isFrozen, "f")
            ? __classPrivateFieldGet(this, _ProxyMeta_onIce, "f")?.values || []
            : descriptor_js_1.Descriptor.valuesFor(this.object));
    }
    /**
     * Freezes the object by assigning the current `props`, `keys`,
     * and `values` to the onIce object and sets the `isFrozen` flag
     * to true.
     */
    freeze() {
        __classPrivateFieldGet(this, _ProxyMeta_onIce, "f").props = this.props;
        __classPrivateFieldGet(this, _ProxyMeta_onIce, "f").keys = this.keys;
        __classPrivateFieldGet(this, _ProxyMeta_onIce, "f").values = this.values;
        __classPrivateFieldSet(this, _ProxyMeta_isFrozen, true, "f");
    }
    /**
     * Thaws the object by setting #isFrozen to false and
     * resetting the private `#onIce` property.
     */
    thaw() {
        __classPrivateFieldSet(this, _ProxyMeta_isFrozen, false, "f");
        __classPrivateFieldSet(this, _ProxyMeta_onIce, { props: [], keys: [], values: [] }, "f");
    }
    /**
     * Returns a sealed empty instance that can be triple equal compared
     * when the instance reference is passed around.
     *
     * @returns {ProxyMeta} a shared empty instance of ProxyMeta that can
     * be used in lieu of null as a default instance.
     */
    static get Empty() {
        return __classPrivateFieldGet(this, _a, "f", _ProxyMeta_emptyInstance);
    }
}
exports.ProxyMeta = ProxyMeta;
_a = ProxyMeta, _ProxyMeta_onIce = new WeakMap(), _ProxyMeta_isFrozen = new WeakMap();
/**
 * Represents an empty instance of ProxyMeta.
 *
 * @type {ProxyMeta}
 * @private
 * @static
 */
_ProxyMeta_emptyInstance = { value: Object.freeze(new _a({})) };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHltZXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb3h5bWV0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBNEM7QUFFNUM7Ozs7O0dBS0c7QUFDSCxNQUFhLFNBQVM7SUFDcEI7Ozs7T0FJRztJQUNILFlBQVksTUFBTTtRQWlFbEI7OztXQUdHO1FBQ0gsMkJBQVMsSUFBSTtRQUViOzs7V0FHRztVQUxVO1FBRWI7OztXQUdHO1FBQ0gsOEJBQVksS0FBSztRQUdqQjs7Ozs7O1dBTUc7VUFUYztRQTFFZixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksS0FBSztRQUNQLE9BQU8sQ0FBQyx1QkFBQSxJQUFJLDJCQUFVO1lBQ3RCLENBQUMsQ0FBQyx1QkFBQSxJQUFJLHdCQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDMUIsQ0FBQyxDQUFDLDBCQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sQ0FBQyx1QkFBQSxJQUFJLDJCQUFVO1lBQ3RCLENBQUMsQ0FBQyx1QkFBQSxJQUFJLHdCQUFPLEVBQUUsSUFBSSxJQUFJLEVBQUU7WUFDekIsQ0FBQyxDQUFDLDBCQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxNQUFNO1FBQ1IsT0FBTyxDQUFDLHVCQUFBLElBQUksMkJBQVU7WUFDcEIsQ0FBQyxDQUFDLHVCQUFBLElBQUksd0JBQU8sRUFBRSxNQUFNLElBQUksRUFBRTtZQUMzQixDQUFDLENBQUMsMEJBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNO1FBQ0osdUJBQUEsSUFBSSx3QkFBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBQzlCLHVCQUFBLElBQUksd0JBQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUM1Qix1QkFBQSxJQUFJLHdCQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDaEMsdUJBQUEsSUFBSSx1QkFBYSxJQUFJLE1BQUEsQ0FBQTtJQUN2QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSTtRQUNGLHVCQUFBLElBQUksdUJBQWEsS0FBSyxNQUFBLENBQUE7UUFDdEIsdUJBQUEsSUFBSSxvQkFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQUEsQ0FBQTtJQUNuRCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsTUFBTSxLQUFLLEtBQUs7UUFDZCxPQUFPLHVCQUFBLElBQUksb0NBQWUsQ0FBQTtJQUM1QixDQUFDOztBQXJFSCw4QkE0RkM7O0FBUkM7Ozs7OztHQU1HO0FBQ0ksb0NBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBbkMsQ0FBbUMifQ==