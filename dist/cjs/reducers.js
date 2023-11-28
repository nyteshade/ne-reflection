"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergedObjToDescriptorsReducer = exports.EntriesToObjectReducer = exports.ObjectToKeysAndSymbolsReducer = exports.ArrayValuesAsKeysAndDescsReducer = exports.ArrayValuesAsEntriesReducer = void 0;
const utils_1 = require("./utils");
const descriptor_1 = require("./descriptor");
const types_1 = require("@babel/types");
/**
 * Reducer function that converts array values into key-value entries.
 * This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {string} key - The key value from the array.
 * @returns {Object} - The updated accumulator object.
 */
const ArrayValuesAsEntriesReducer = (accumulator, key) => {
    accumulator[key] = key;
    return accumulator;
};
exports.ArrayValuesAsEntriesReducer = ArrayValuesAsEntriesReducer;
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
const ArrayValuesAsKeysAndDescsReducer = (accumulator, key) => {
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
exports.ArrayValuesAsKeysAndDescsReducer = ArrayValuesAsKeysAndDescsReducer;
/**
 * Reducer function that converts an object into an array of its keys
 * and symbols. This reducer expects a default object of type Array
 *
 * @param {Array} accumulator - The accumulated array of keys and symbols.
 * @param {Object} object - The object to extract keys and symbols from.
 * @returns {Array} - The updated array of keys and symbols.
 */
const ObjectToKeysAndSymbolsReducer = (accumulator, object) => {
    accumulator = accumulator.concat(descriptor_1.Descriptor.keysFor(object));
    return accumulator;
};
exports.ObjectToKeysAndSymbolsReducer = ObjectToKeysAndSymbolsReducer;
/**
 * Reducer function that converts an array of key-value pairs into an object.
 * This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {Array} entry - The key-value pair array.
 * @returns {Object} The updated accumulator object.
 */
const EntriesToObjectReducer = (accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
};
exports.EntriesToObjectReducer = EntriesToObjectReducer;
/**
 * Reducer function that merges an object's descriptors into an accumulator
 * object. This reducer expects a default object of type Object
 *
 * @param {Object} accumulator - The accumulator object.
 * @param {Object} object - The object whose descriptors will be merged.
 * @returns {Object} - The updated accumulator object.
 */
const MergedObjToDescriptorsReducer = (accumulator, object) => {
    (0, utils_1.objectCopy)({}, accumulator, descriptor_1.Descriptor.descriptorsFor(object));
    return accumulator;
};
exports.MergedObjToDescriptorsReducer = MergedObjToDescriptorsReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVkdWNlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQXFDO0FBQ3JDLDZDQUEwQztBQUMxQyx3Q0FBcUU7QUFFckU7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDOUQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFIWSxRQUFBLDJCQUEyQiwrQkFHdkM7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0ksTUFBTSxnQ0FBZ0MsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUNuRSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFFaEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQztRQUNwQyxXQUFXLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQTtJQUV4QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0lBRXhCLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQTtJQUNkLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQTtJQUVmLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRTtRQUM1RCxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQTtRQUNkLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO0tBQ2pCO1NBQ0ksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQy9DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2Y7SUFFRCxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUM5QixXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO0lBQzdELE9BQU8sV0FBVyxDQUFBO0FBQ3BCLENBQUMsQ0FBQTtBQXpCWSxRQUFBLGdDQUFnQyxvQ0F5QjVDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDbkUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsdUJBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUM1RCxPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFIWSxRQUFBLDZCQUE2QixpQ0FHekM7QUFFRDs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO0lBQ2xFLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7SUFDeEIsT0FBTyxXQUFXLENBQUE7QUFDcEIsQ0FBQyxDQUFBO0FBSFksUUFBQSxzQkFBc0IsMEJBR2xDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDbkUsSUFBQSxrQkFBVSxFQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsdUJBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUM5RCxPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFIWSxRQUFBLDZCQUE2QixpQ0FHekMifQ==