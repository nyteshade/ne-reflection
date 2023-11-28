import { Descriptor } from './descriptor.js'

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
    this.object = object 
    this.thaw()
  }

  /**
   * Gets the properties of the object.
   * 
   * @returns {Array} The properties of the object.
   */
  get props() { 
    return (this.#isFrozen
    ? this.#onIce?.props || []
    : Descriptor.descriptorsFor(this.object, 'instance', 'values'))
  }

  get keys() {
    return (this.#isFrozen
    ? this.#onIce?.keys || []
    : Descriptor.keysFor(this.object))
  }

  /**
   * Get the values of the ProxyMeta object.
   * 
   * @returns {Array} The values of the ProxyMeta object.
   */
  get values() {
    return (this.#isFrozen
      ? this.#onIce?.values || []
      : Descriptor.valuesFor(this.object))
  }

  /**
   * Freezes the object by assigning the current `props`, `keys`, 
   * and `values` to the onIce object and sets the `isFrozen` flag 
   * to true.
   */
  freeze() {
    this.#onIce.props = this.props 
    this.#onIce.keys = this.keys 
    this.#onIce.values = this.values
    this.#isFrozen = true
  }

  /**
   * Thaws the object by setting #isFrozen to false and 
   * resetting the private `#onIce` property.
   */
  thaw() {
    this.#isFrozen = false 
    this.#onIce = { props: [], keys: [], values: [] }
  }

  /**
   * Returns a sealed empty instance that can be triple equal compared
   * when the instance reference is passed around.
   * 
   * @returns {ProxyMeta} a shared empty instance of ProxyMeta that can
   * be used in lieu of null as a default instance.
   */
  static get Empty() { 
    return this.#emptyInstance 
  }

  /**
   * Represents the onIce property.
   * @type {null}
   */
  #onIce = null

  /**
   * Indicates whether the object is frozen.
   * @type {boolean}
   */
  #isFrozen = false


  /**
   * Represents an empty instance of ProxyMeta.
   * 
   * @type {ProxyMeta}
   * @private
   * @static
   */
  static #emptyInstance = Object.freeze(new ProxyMeta({}))
}

