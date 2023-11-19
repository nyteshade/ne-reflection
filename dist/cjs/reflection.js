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
var _NEGetProxy_instances, _NEGetProxy_traps, _NEGetProxy_proxyGet, _NEGetProxy_proxyHas, _NEGetProxy_proxySet, _NEGetProxy_proxyDeleteProperty, _NEGetProxy_proxyGetOwnPropertyDescriptor, _NEGetProxy_proxyGetDefineProperty;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEGetProxy = void 0;
const objectdescriptor_js_1 = require("./objectdescriptor.js");
class NEGetProxy {
    // Creates a new Proxy instance around a given object in a quick and
    // easy manner. Normally, providing a good proxy around an object that
    // just needs a few more contextual properties is not a two or three
    // line solution.
    //
    // NEGetProxy aims to restore that simplicity. The types of values
    // that `newProperties` can accept are either an array of arrays or
    // an array of objects. In the array of arrays solution, the expected
    //
    // [[propertyName, value, descriptor, isGetter], ...] 
    //
    // or as an array of objects
    //
    // [{ property, value, descriptor, isGetter }, ...]
    //
    // where:
    //   property   - the name of the property to add to the proxy
    //   value      - this can be any type of value, however if isGetter
    //                is truthy and value is a function, its value will
    //                calculated upon each access
    //   descriptor - a basic descriptor will be provided with true for
    //                `enumerable` and `configurable` unless one is provided
    //                to the constructor. Values for `get`, `set`, and 
    //                `value` will be ignored if supplied.
    //   isGetter   - if truthy, and value is a function, the act of
    //                getting the property will invoke the function and
    //                return its results. Will default to false is not
    //                provided
    constructor(toProxy, newProperties = []) {
        _NEGetProxy_instances.add(this);
        // Private variables
        _NEGetProxy_traps.set(this, null
        // Creates a new Proxy instance around a given object in a quick and
        // easy manner. Normally, providing a good proxy around an object that
        // just needs a few more contextual properties is not a two or three
        // line solution.
        //
        // NEGetProxy aims to restore that simplicity. The types of values
        // that `newProperties` can accept are either an array of arrays or
        // an array of objects. In the array of arrays solution, the expected
        //
        // [[propertyName, value, descriptor, isGetter], ...] 
        //
        // or as an array of objects
        //
        // [{ property, value, descriptor, isGetter }, ...]
        //
        // where:
        //   property   - the name of the property to add to the proxy
        //   value      - this can be any type of value, however if isGetter
        //                is truthy and value is a function, its value will
        //                calculated upon each access
        //   descriptor - a basic descriptor will be provided with true for
        //                `enumerable` and `configurable` unless one is provided
        //                to the constructor. Values for `get`, `set`, and 
        //                `value` will be ignored if supplied.
        //   isGetter   - if truthy, and value is a function, the act of
        //                getting the property will invoke the function and
        //                return its results. Will default to false is not
        //                provided
        );
        if (!toProxy) {
            throw new TypeError('NEGetProxy must have a valid object to proxy');
        }
        const processedProperties = this.process(newProperties);
        this.target = toProxy;
        this.properties = processedProperties;
        const result = new Proxy(toProxy, this.proxyTraps);
        this.proxy = result;
    }
    process(inputParameters) {
        const output = [];
        const convertObject = object => {
            if (typeof object !== 'object')
                return;
            const { property, value, descriptor, isGetter } = object;
            const { from, OpenDescriptorInstance } = objectdescriptor_js_1.ObjectDescriptor;
            const descriptorObj = from(descriptor) ?? OpenDescriptorInstance;
            if ((typeof property !== 'undefined') && (typeof value !== 'undefined')) {
                output.push({
                    property,
                    value,
                    descriptor: descriptorObj,
                    isGetter: !!isGetter,
                });
            }
        };
        const convertArray = array => {
            if (!Array.isArray(array))
                return;
            const [property, value, descriptor, isGetter] = array;
            const { from, OpenDescriptorInstance } = objectdescriptor_js_1.ObjectDescriptor;
            const descriptorObj = from(descriptor) ?? OpenDescriptorInstance;
            if ((typeof property !== 'undefined') && (typeof value !== 'undefined')) {
                output.push({
                    property,
                    value,
                    descriptor: descriptorObj,
                    isGetter: !!isGetter,
                });
            }
        };
        if (!Array.isArray(inputParameters)) {
            convertObject(inputParameters);
        }
        else {
            for (const entry of inputParameters) {
                if (Array.isArray(entry))
                    convertArray(entry);
                else
                    convertObject(entry);
            }
        }
        return output;
    }
    get proxyTraps() {
        if (!__classPrivateFieldGet(this, _NEGetProxy_traps, "f")) {
            __classPrivateFieldSet(this, _NEGetProxy_traps, {
                get: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyGet).bind(this),
                has: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyHas).bind(this),
                set: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxySet).bind(this),
                deleteProperty: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyDeleteProperty).bind(this),
                getOwnPropertyDescriptor: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyGetOwnPropertyDescriptor).bind(this),
                defineProperty: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyGetDefineProperty).bind(this),
            }, "f");
        }
        return __classPrivateFieldGet(this, _NEGetProxy_traps, "f");
    }
    getIfHas(property, returnDestructable = false) {
        const index = this.properties.findIndex(entry => entry?.property == property);
        if (!~index) {
            if (returnDestructable) {
                return {
                    property: undefined,
                    value: undefined,
                    descriptor: undefined,
                    isGetter: undefined,
                };
            }
            return null;
        }
        return { ...this.properties[index], index };
    }
    static for(object, newProps = []) {
        const instance = new NEGetProxy(object, newProps);
        return [instance?.proxy, instance];
    }
}
exports.NEGetProxy = NEGetProxy;
_NEGetProxy_traps = new WeakMap(), _NEGetProxy_instances = new WeakSet(), _NEGetProxy_proxyGet = function _NEGetProxy_proxyGet(target, prop, receiver) {
    const neProp = this.getIfHas(prop);
    if (neProp) {
        if (neProp.isGetter && typeof neProp.value === 'function')
            return neProp.value();
        return neProp.value;
    }
    return Reflect.get(target, prop, receiver);
}, _NEGetProxy_proxyHas = function _NEGetProxy_proxyHas(target, prop) {
    const { isDescriptorInstance } = objectdescriptor_js_1.ObjectDescriptor;
    const { descriptor, property } = this.getIfHas(prop, true);
    if (prop === property && descriptor && isDescriptorInstance(descriptor)) {
        if (descriptor.hasEnumerable && descriptor.isEnumerable)
            return true;
    }
    return Reflect.has(target, prop);
}, _NEGetProxy_proxySet = function _NEGetProxy_proxySet(target, prop, newValue, receiver) {
    const { descriptor, index } = this.getIfHas(prop, true);
    if (descriptor?.canChange) {
        this.properties[index].value = newValue;
        return true;
    }
    return Reflect.set(target, prop, newValue, receiver);
}, _NEGetProxy_proxyDeleteProperty = function _NEGetProxy_proxyDeleteProperty(target, prop) {
    const { descriptor, index } = this.getIfHas(prop, true);
    if (descriptor?.canDelete) {
        const currentCount = this.properties.length;
        this.properties.splice(index, 1);
        return (currentCount > this.properties.length);
    }
    return Reflect.deleteProperty(target, prop);
}, _NEGetProxy_proxyGetOwnPropertyDescriptor = function _NEGetProxy_proxyGetOwnPropertyDescriptor(target, prop) {
    const { descriptor, value, isGetter } = this.getIfHas(prop, true);
    if (descriptor) {
        if (isGetter && descriptor.hasGet && descriptor.isAccessor) {
            return { ...descriptor.descriptor, get: value };
        }
        else {
            return { ...descriptor.descriptor, value };
        }
    }
    return Reflect.getOwnPropertyDescriptor(target, prop);
}, _NEGetProxy_proxyGetDefineProperty = function _NEGetProxy_proxyGetDefineProperty(target, prop, descriptor) {
    const { descriptor: _descriptor, index } = this.getIfHas(prop, true);
    if (_descriptor?.canChange) {
        const instance = objectdescriptor_js_1.ObjectDescriptor.from(descriptor);
        if (instance?.isAccessor) {
            const { get, set, configurable, enumerable } = descriptor;
            this.properties[index].descriptor = new objectdescriptor_js_1.ObjectDescriptor({
                enumerable, configurable, get, set
            });
        }
        else if (instance?.isData) {
            const { value, writable, enumerable, configurable } = descriptor;
            this.properties[index].descriptor = new objectdescriptor_js_1.ObjectDescriptor({
                enumerable, configurable, value, writable
            });
        }
        return !!this.properties[index].descriptor;
    }
    return Reflect.defineProperty(target, prop, descriptor);
};
