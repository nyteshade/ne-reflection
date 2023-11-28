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
    accumulator[key] = key;
    return accumulator;
};
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
    const has = (o, keys) => keys.map(k => Reflect.has(o, k)).every(e => e);
    const eo = o => (typeof o === 'object') ? o : {};
    if (!Reflect.has(accumulator, 'descs'))
        accumulator.descs = {};
    if (!Reflect.has(accumulator, 'cases'))
        accumulator.cases = {};
    let _key = key;
    let _desc = key;
    if (typeof key === 'object' && has(eo(key), ['key', 'desc'])) {
        _key = key.key;
        _desc = key.desc;
    }
    else if (Array.isArray(key) && key.length === 2) {
        _key = key[0];
        _desc = key[1];
    }
    accumulator.cases[_key] = _key;
    accumulator.descs[Symbol.for(`Desc:${String(_key)}`)] = _desc;
    return accumulator;
};
/**
 * Reducer function that converts an object into an array of its keys
 * and symbols. This reducer expects a default object of type Array
 *
 * @param {Array} accumulator - The accumulated array of keys and symbols.
 * @param {Object} object - The object to extract keys and symbols from.
 * @returns {Array} - The updated array of keys and symbols.
 */
export const ObjectToKeysAndSymbolsReducer = (accumulator, object) => {
    accumulator = accumulator.concat(Descriptor.keysFor(object));
    return accumulator;
};
/**
 * Reducer function that converts an array of key-value pairs into an object.
 * This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {Array} entry - The key-value pair array.
 * @returns {Object} The updated accumulator object.
 */
export const EntriesToObjectReducer = (accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
};
/**
 * Reducer function that merges an object's descriptors into an accumulator
 * object. This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {Object} object - The object whose descriptors will be merged.
 * @returns {Object} - The updated accumulator object.
 */
export const MergedObjToDescriptorsReducer = (accumulator, object) => {
    objectCopy({}, accumulator, Descriptor.descriptorsFor(object));
    return accumulator;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVkdWNlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNyQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBRSxxQ0FBcUMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVyRTs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDOUQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0NBQWdDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDbkUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0RSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBRWhELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUM7UUFDcEMsV0FBVyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7SUFFeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQztRQUNwQyxXQUFXLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQTtJQUV4QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUE7SUFDZCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUE7SUFFZixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUU7UUFDNUQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUE7UUFDZCxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtLQUNqQjtTQUNJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMvQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNmO0lBRUQsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDOUIsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtJQUM3RCxPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDbkUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQzVELE9BQU8sV0FBVyxDQUFBO0FBQ3BCLENBQUMsQ0FBQTtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO0lBQ2xFLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7SUFDeEIsT0FBTyxXQUFXLENBQUE7QUFDcEIsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ25FLFVBQVUsQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUM5RCxPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDLENBQUEifQ==