"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GetProxy_instances, _GetProxy_traps, _GetProxy_forceMeta, _GetProxy_hasMeta, _GetProxy_proxyPrinter, _GetProxy_proxyGet, _GetProxy_proxyHas, _GetProxy_proxyCustomInspect, _GetProxy_proxyStringTag, _GetProxy_proxySet, _GetProxy_proxyDeleteProperty, _GetProxy_proxyGetOwnPropertyDescriptor, _GetProxy_proxyOwnKeys, _GetProxy_proxyDefineProperty, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProxy = void 0;
const descriptor_js_1 = require("./descriptor.js");
const utils_js_1 = require("./utils.js");
const CustomInspect = Symbol.for('nodejs.util.inspect.custom');
class GetProxy {
    /**
     * Creates a new Proxy instwance around a given object in a quick and
     * easy manner. Normally, providing a good proxy around an object that
     * just needs a few more contextual properties is not a two or three
     * line solution.
     *
     * Simply provide an object of key value pairs that will also be
     * referenced when accessing the proxied object. So if you want to do
     * something
     */
    constructor(toProxy, newProperties, { forceMeta } = { forceMeta: false }) {
        _GetProxy_instances.add(this);
        // Private variables
        _GetProxy_traps.set(this, null);
        _GetProxy_forceMeta.set(this, false);
        _GetProxy_hasMeta.set(this, false
        /**
         * Creates a new Proxy instwance around a given object in a quick and
         * easy manner. Normally, providing a good proxy around an object that
         * just needs a few more contextual properties is not a two or three
         * line solution.
         *
         * Simply provide an object of key value pairs that will also be
         * referenced when accessing the proxied object. So if you want to do
         * something
         */
        );
        _GetProxy_proxyCustomInspect.set(this, null);
        _GetProxy_proxyStringTag.set(this, null);
        this[_a] = false;
        if (!toProxy) {
            throw new TypeError(`GetProxy must have a valid object to proxy`);
        }
        this.genProperties(newProperties);
        this.target = toProxy;
        this.proxy = this.genProxy();
        if (forceMeta) {
            __classPrivateFieldSet(this, _GetProxy_forceMeta, true, "f");
            return this;
        }
        return this.proxy;
    }
    genProperties(fromObject) {
        const [properties, propertiesObj] = this.process(fromObject ?? this.propertiesObject);
        this.propertiesObject = propertiesObj;
        this.properties = properties;
    }
    genProxy(apply = false) {
        const { newDataDescriptor, newAccessorDescriptor, BASE, VISIBLE } = descriptor_js_1.Descriptor;
        const proxy = new Proxy(this.target, this.proxyTraps);
        const meta = this;
        Object.defineProperties(this.propertiesObject, {
            // The following items need be on the proxy but this breaks things
            // [GetProxy.META]: newDataDescriptor({ value: this }, VISIBLE),
            // [CustomInspect]: newAccessorDescriptor({
            //   get: function() { return function (depth, opts, inspect) {
            //     return meta[CustomInspect](depth, opts, inspect)
            //   }
            // }}, BASE) ,
            [Symbol.toStringTag]: newDataDescriptor({ value: 'GetProxyInstance' }, BASE),
        });
        if (process.env.NODE_ENV !== 'production' || __classPrivateFieldGet(this, _GetProxy_forceMeta, "f")) {
            __classPrivateFieldSet(this, _GetProxy_hasMeta, true, "f");
        }
        else {
            delete this.propertiesObject[GetProxy.META];
        }
        if (apply)
            this.proxy = proxy;
        return proxy;
    }
    process(object) {
        const { descriptorsFor } = descriptor_js_1.Descriptor;
        const useObject = object;
        const converted = descriptorsFor(useObject, 'instance', 'values');
        return [converted, useObject];
    }
    get proxyTraps() {
        if (!__classPrivateFieldGet(this, _GetProxy_traps, "f")) {
            __classPrivateFieldSet(this, _GetProxy_traps, {
                get: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxyGet).bind(this),
                has: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxyHas).bind(this),
                set: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxySet).bind(this),
                ownKeys: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxyOwnKeys).bind(this),
                deleteProperty: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxyDeleteProperty).bind(this),
                getOwnPropertyDescriptor: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxyGetOwnPropertyDescriptor).bind(this),
                defineProperty: __classPrivateFieldGet(this, _GetProxy_instances, "m", _GetProxy_proxyDefineProperty).bind(this),
            }, "f");
        }
        return __classPrivateFieldGet(this, _GetProxy_traps, "f");
    }
    getIfHas(property) {
        const index = this.properties.findIndex(entry => entry?.property == property);
        const entry = this.properties[index];
        if (~index && entry) {
            return (0, utils_js_1.stripNullish)((0, utils_js_1.objectCopy)({}, entry.descriptor, {
                index,
                property: entry?.property,
                object: entry?.thisObj,
                descriptor: entry
            }));
        }
        return null;
    }
    get [(_GetProxy_traps = new WeakMap(), _GetProxy_forceMeta = new WeakMap(), _GetProxy_hasMeta = new WeakMap(), _GetProxy_proxyCustomInspect = new WeakMap(), _GetProxy_proxyStringTag = new WeakMap(), _GetProxy_instances = new WeakSet(), Symbol.toStringTag)]() { return this.constructor.name; }
    [(_GetProxy_proxyPrinter = function _GetProxy_proxyPrinter(depth, opts, inspect) {
        return this[CustomInspect](depth, opts, inspect);
    }, _GetProxy_proxyGet = function _GetProxy_proxyGet(target, prop, receiver) {
        const neProp = this.getIfHas(prop);
        if (prop === CustomInspect)
            return __classPrivateFieldGet(this, _GetProxy_proxyCustomInspect, "f");
        if (prop === Symbol.toStringTag)
            return __classPrivateFieldGet(this, _GetProxy_proxyStringTag, "f");
        if (neProp) {
            return neProp.descriptor.computeValue();
        }
        return Reflect.get(target, prop, receiver);
    }, _GetProxy_proxyHas = function _GetProxy_proxyHas(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        if (prop === CustomInspect)
            return !!__classPrivateFieldGet(this, _GetProxy_proxyCustomInspect, "f");
        if (prop === Symbol.toStringTag && !Reflect.ownKeys(target).includes(Symbol.toStringTag))
            return !!__classPrivateFieldGet(this, _GetProxy_proxyStringTag, "f");
        if (descriptor) {
            if (descriptor.hasEnumerable && descriptor.isEnumerable)
                return true;
        }
        return Reflect.has(target, prop);
    }, _GetProxy_proxySet = function _GetProxy_proxySet(target, prop, newValue, receiver) {
        const entry = this.getIfHas(prop) ?? {};
        const propObj = this.propertiesObject;
        let { descriptor } = entry;
        if (prop === CustomInspect) {
            return (__classPrivateFieldSet(this, _GetProxy_proxyCustomInspect, newValue, "f"));
        }
        if (prop === Symbol.toStringTag) {
            return (__classPrivateFieldSet(this, _GetProxy_proxyStringTag, newValue, "f"));
        }
        if (descriptor && propObj) {
            const success = descriptor.alterValue(newValue);
            if (success) {
                this.genProperties(propObj);
                ({ descriptor, index } = (this.getIfHas(prop) ?? {}));
            }
            return descriptor.computeValue();
        }
        else if (prop.startsWith('__') && propObj) {
            propObj[prop.substring(2)] = newValue;
            this.genProperties(propObj);
            return newValue;
        }
        return Reflect.set(target, prop, newValue, receiver);
    }, _GetProxy_proxyDeleteProperty = function _GetProxy_proxyDeleteProperty(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor, index } = entry;
        if (descriptor?.canDelete && this.propertiesObject) {
            const currentCount = this.properties.length;
            delete this.propertiesObject[prop];
            const [newProps, newObj] = this.process(this.propertiesObject);
            this.propertiesObject = newObj;
            this.properties = newProps;
            return (currentCount > this.properties.length);
        }
        return Reflect.deleteProperty(target, prop);
    }, _GetProxy_proxyGetOwnPropertyDescriptor = function _GetProxy_proxyGetOwnPropertyDescriptor(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        if (descriptor) {
            return descriptor.descriptor;
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
    }, _GetProxy_proxyOwnKeys = function _GetProxy_proxyOwnKeys(target) {
        const ownKeys = descriptor_js_1.Descriptor.keysFor(this.target);
        const proxyKeys = descriptor_js_1.Descriptor.keysFor(this.propertiesObject);
        return Array.from(new Set(ownKeys.concat(proxyKeys)));
    }, _GetProxy_proxyDefineProperty = function _GetProxy_proxyDefineProperty(target, prop, newDescriptor) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor, index } = entry;
        if (descriptor?.canChange) {
            this.properties[index] = new descriptor_js_1.Descriptor(newDescriptor);
            return !!this.properties[index];
        }
        return Reflect.defineProperty(target, prop, newDescriptor);
    }, _a = Symbol.for(`GetProxy.replVerbosity`), Symbol.for('nodejs.util.inspect.custom'))](depth, opts, inspect) {
        const { keysFor } = descriptor_js_1.Descriptor;
        const quickType = o => /(\w+)]/.exec(Object.prototype.toString.call(o))[1];
        const killCruft = s => s.replace(/^\[ /g, '').replace(/ ]$/, '').replace(/'/g, '');
        const kinspect = o => killCruft(inspect(o, iOpts));
        const iOpts = { ...opts, depth };
        const typeOfObj = quickType(this.target);
        const targetKeys = kinspect(keysFor(this.target, false, true));
        const proxiedKeys = kinspect(keysFor(this.propertiesObject, false, true));
        const metaState = __classPrivateFieldGet(this, _GetProxy_hasMeta, "f") ? "present" : "missing";
        const forcedState = __classPrivateFieldGet(this, _GetProxy_forceMeta, "f") ? ' (forced)' : '';
        const metaString = `${metaState}${forcedState}`;
        const verbose = GetProxy[GetProxy.REPL_VERBOSITY];
        if (verbose)
            return [
                `${this[Symbol.toStringTag]} (proxying ${typeOfObj} instance) {`,
                `  targetKeys: ${targetKeys}`,
                `  proxiedKeys: ${proxiedKeys}`,
                `  meta: ${metaString}`,
                `}`
            ].join('\n');
        else
            return (`${this[Symbol.toStringTag]} { target: ${targetKeys} proxy: ${proxiedKeys} }`);
    }
    static get META() { return Symbol.for(this.name); }
    static get REPL_VERBOSITY() {
        return Symbol.for(`GetProxy.replVerbosity`);
    }
    static for(object, newProps = []) {
        const meta = new GetProxy(object, newProps, { forceMeta: true });
        const proxy = meta.proxy;
        return [proxy, meta];
    }
}
exports.GetProxy = GetProxy;
