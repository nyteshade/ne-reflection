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
var _NEGetProxy_instances, _NEGetProxy_traps, _NEGetProxy_proxyGet, _NEGetProxy_proxyHas, _NEGetProxy_proxySet, _NEGetProxy_proxyDeleteProperty, _NEGetProxy_proxyGetOwnPropertyDescriptor, _NEGetProxy_proxyDefineProperty;
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
    constructor(toProxy, newProperties) {
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
        this.propertiesObject = newProperties;
        this.properties = this.process(newProperties);
        this.target = toProxy;
        this.proxy = new Proxy(toProxy, this.proxyTraps);
    }
    process(object) {
        const { OPEN, BASE } = objectdescriptor_js_1.ObjectDescriptor;
        const { entries, getOwnPropertyDescriptors: getDescriptors } = Object;
        const converted = entries(getDescriptors(object))
            .map(([name, descriptor]) => {
            return new objectdescriptor_js_1.ObjectDescriptor(descriptor, OPEN, object, name);
        });
        if (process.env.NODE_ENV !== 'production') {
            const propObj = this.propertiesObject;
            const property = NEGetProxy.kNEGetProxy;
            const rawDescriptor = objectdescriptor_js_1.ObjectDescriptor.newDataDescriptor({ value: this });
            converted.push(new objectdescriptor_js_1.ObjectDescriptor(rawDescriptor, BASE, propObj, property));
            console.log(`[post-process] `, propObj, property, rawDescriptor);
        }
        return converted;
    }
    get proxyTraps() {
        if (!__classPrivateFieldGet(this, _NEGetProxy_traps, "f")) {
            __classPrivateFieldSet(this, _NEGetProxy_traps, {
                get: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyGet).bind(this),
                has: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyHas).bind(this),
                set: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxySet).bind(this),
                deleteProperty: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyDeleteProperty).bind(this),
                getOwnPropertyDescriptor: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyGetOwnPropertyDescriptor).bind(this),
                defineProperty: __classPrivateFieldGet(this, _NEGetProxy_instances, "m", _NEGetProxy_proxyDefineProperty).bind(this),
            }, "f");
        }
        return __classPrivateFieldGet(this, _NEGetProxy_traps, "f");
    }
    getIfHas(property) {
        const index = this.properties.findIndex(entry => entry?.property == property);
        const entry = this.properties[index];
        const destructable = Object.entries({
            index: index,
            property: entry?.property,
            enumerable: entry?.enumerable,
            configurable: entry?.configurable,
            writable: entry?.writable,
            value: entry?.value,
            get: entry?.get,
            set: entry?.set,
            object: entry?.object,
            descriptorObj: entry,
        }).reduce((acc, [key, value]) => { if (value) {
            acc[key] = value;
        } ; return acc; }, {});
        return ~index ? destructable : null;
    }
    static get kNEGetProxy() { return Symbol.for(this.name); }
    static for(object, newProps = []) {
        const instance = new NEGetProxy(object, newProps);
        return [instance?.proxy, instance];
    }
}
exports.NEGetProxy = NEGetProxy;
_NEGetProxy_traps = new WeakMap(), _NEGetProxy_instances = new WeakSet(), _NEGetProxy_proxyGet = function _NEGetProxy_proxyGet(target, prop, receiver) {
    const neProp = this.getIfHas(prop);
    if (neProp) {
        return neProp.descriptorObj.computeValue();
    }
    return Reflect.get(target, prop, receiver);
}, _NEGetProxy_proxyHas = function _NEGetProxy_proxyHas(target, prop) {
    const entry = this.getIfHas(prop) ?? {};
    const { descriptor } = entry;
    if (descriptor) {
        if (descriptor.hasEnumerable && descriptor.isEnumerable)
            return true;
    }
    return Reflect.has(target, prop);
}, _NEGetProxy_proxySet = function _NEGetProxy_proxySet(target, prop, newValue, receiver) {
    const { getOwnPropertyDescriptor: getDescriptor } = Object;
    const entry = this.getIfHas(prop) ?? {};
    const { descriptor, index } = entry;
    const propObj = this.propertiesObject;
    if (descriptor && propObj) {
        const success = descriptor.alterValue(newValue);
        if (success) {
            const modifiedDescriptor = getDescriptor(propObj);
            if (modifiedDescriptor)
                this.properties[index] = modifiedDescriptor;
        }
        return descriptor.computeValue();
    }
    return Reflect.set(target, prop, newValue, receiver);
}, _NEGetProxy_proxyDeleteProperty = function _NEGetProxy_proxyDeleteProperty(target, prop) {
    const entry = this.getIfHas(prop) ?? {};
    const { descriptor, index } = entry;
    if (descriptor?.canDelete) {
        const currentCount = this.properties.length;
        this.properties.splice(index, 1);
        return (currentCount > this.properties.length);
    }
    return Reflect.deleteProperty(target, prop);
}, _NEGetProxy_proxyGetOwnPropertyDescriptor = function _NEGetProxy_proxyGetOwnPropertyDescriptor(target, prop) {
    const entry = this.getIfHas(prop) ?? {};
    const { descriptor } = entry;
    if (descriptor) {
        return descriptor.descriptor;
    }
    return Reflect.getOwnPropertyDescriptor(target, prop);
}, _NEGetProxy_proxyDefineProperty = function _NEGetProxy_proxyDefineProperty(target, prop, newDescriptor) {
    const entry = this.getIfHas(prop) ?? {};
    const { descriptor, index } = entry;
    if (descriptor?.canChange) {
        this.properties[index] = new objectdescriptor_js_1.ObjectDescriptor(newDescriptor);
        return !!this.properties[index];
    }
    return Reflect.defineProperty(target, prop, newDescriptor);
};
