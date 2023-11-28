import { objectCopy } from "./utils";
import { Descriptor } from "./descriptor";
import { assertTSConstructSignatureDeclaration } from "@babel/types";

/**
 * Reducer function that converts array values into key-value entries.
 * This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {string} key - The key value from the array.
 * @returns {Object} - The updated accumulator object.
 */
export const ArrayValuesAsEntriesReducer = (accumulator, key) => {
  accumulator[key] = key
  return accumulator
}

/**
 * Reducer function that transforms an array of values into an object with
 * values as keys and descriptions as values. If the input value is an object
 * with 'key' and 'desc' properties, those will be used as the key and
 * description respectively. If the input value is an array with two
 * elements, the first element will be used as the key and the second
 * element as the description.
 *
 * @param {Object} accumulator - The accumulator object to store the
 * transformed values.
 * @param {any} key - The value to be transformed into a key-value pair.
 * @returns {Object} - The updated accumulator object with the new
 * key-value pair.
 */
export const ArrayValuesAsKeysAndDescsReducer = (accumulator, key) => {
  const has = (o, keys) => keys.map(k => Reflect.has(o,k)).every(e => e)
  const eo = o => (typeof o === 'object') ? o : {}

  if (!Reflect.has(accumulator, 'descs'))
    accumulator.descs = {}

  if (!Reflect.has(accumulator, 'cases'))
    accumulator.cases = {}

  let _key = key
  let _desc = key

  if (typeof key === 'object' && has(eo(key), ['key', 'desc'])) {
    _key = key.key
    _desc = key.desc
  }
  else if (Array.isArray(key) && key.length === 2) {
    _key = key[0]
    _desc = key[1]
  }

  accumulator.cases[_key] = _key
  accumulator.descs[Symbol.for(`Desc:${String(_key)}`)] = _desc
  return accumulator
}

/**
 * Reducer function that converts an object into an array of its keys
 * and symbols. This reducer expects a default object of type Array
 *
 * @param {Array} accumulator - The accumulated array of keys and symbols.
 * @param {Object} object - The object to extract keys and symbols from.
 * @returns {Array} - The updated array of keys and symbols.
 */
export const ObjectToKeysAndSymbolsReducer = (accumulator, object) => {
  accumulator = accumulator.concat(Descriptor.keysFor(object))
  return accumulator
}

/**
 * Reducer function that converts an array of key-value pairs into an object.
 * This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {Array} entry - The key-value pair array.
 * @returns {Object} The updated accumulator object.
 */
export const EntriesToObjectReducer = (accumulator, [key, value]) => {
  accumulator[key] = value
  return accumulator
}

/**
 * Reducer function that merges an object's descriptors into an accumulator
 * object. This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {Object} object - The object whose descriptors will be merged.
 * @returns {Object} - The updated accumulator object.
 */
export const MergedObjToDescriptorsReducer = (accumulator, object) => {
  objectCopy({}, accumulator, Descriptor.descriptorsFor(object))
  return accumulator
}
