"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEReflectHasAllOf = exports.NEReflectHasOneOf = exports.NEIsReflectable = void 0;
const objectdescriptor_1 = require("./objectdescriptor");
function NEIsReflectable(object) {
    return object && (object instanceof Object);
}
exports.NEIsReflectable = NEIsReflectable;
function NEReflectHasOneOf(object, ...props) {
    let found = false;
    if (!NEIsReflectable(object))
        return found;
    for (const prop of props) {
        if (Reflect.has(object, prop)) {
            found = true;
            break;
        }
    }
    return found;
}
exports.NEReflectHasOneOf = NEReflectHasOneOf;
function NEReflectHasAllOf(object, ...props) {
    let found = true;
    if (!NEIsReflectable(object))
        return !found;
    for (const prop of props) {
        if (!Reflect.has(object, prop)) {
            found = false;
            break;
        }
    }
    return found;
}
exports.NEReflectHasAllOf = NEReflectHasAllOf;
