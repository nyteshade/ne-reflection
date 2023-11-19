import { ObjectDescriptor } from "./objectdescriptor";
export function NEIsReflectable(object) {
    return object && (object instanceof Object);
}
export function NEReflectHasOneOf(object, ...props) {
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
export function NEReflectHasAllOf(object, ...props) {
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
