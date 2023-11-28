/**
 * Removes nullish values from an object.
 *
 * @param {Object} object - The object to remove nullish values from.
 * @returns {Object} - The object with nullish values removed.
 */
export function stripNullish(object: Object): Object;
/**
 * Copies properties from multiple objects into a new object.
 *
 * @param {Object} to - The target object to copy properties into.
 * @param {...Object} from - The source objects to copy properties from.
 * @returns {Object} - A new object with copied properties.
 */
export function objectCopy(to: Object, ...from: Object[]): Object;
/**
 * Creates an inspectToolKit object with various utility functions for
 * inspecting and manipulating text with ANSI escape codes.
 *
 * @param {number} [depth=10] - The maximum depth to recursively
 * inspect objects.
 * @param {object} [opts={ colors: true }] - Options for inspecting
 * objects, including whether to use colors.
 * @param {Function} [inspect=utilInspect] - The inspect function to
 * use for inspecting objects.
 * @returns {object} - The inspectToolKit object with utility functions.
 */
export function inspectToolKit(depth?: number | undefined, opts?: object | undefined, inspect?: Function | undefined): object;
/**
 * Creates an immutable enum object with the specified name, cases,
 * and additional properties.
 *
 * @param {string} name - The name of the enum.
 * @param {string[]} cases - An array of strings representing the
 * enum cases.
 * @param {object} [enumStatic] - Additional properties to be added
 * to the enum object.
 * @returns {object} - The created enum object.
 */
export function emitEnum(name: string, cases: string[], perCaseProps?: {}, enumStatic?: object | undefined): object;
/**
 * Masks an object as a string by defining special properties and
 * setting the prototype to String.prototype.
 *
 * @param {Object} object - The object to be masked.
 * @param {Function} [toPrimitive=(val) => String(val)] - The function
 * used to convert the object to a primitive value.
 */
export function maskAsString(object: Object, toPrimitive?: Function | undefined): void;
export function asBigIntObject(bigIntPrimitive: any): {
    value: any;
};
export function toInstance(object: any, passthru?: boolean): any;
export function isPrimitive(value: any): boolean;
