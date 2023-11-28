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
var _GetProxy_instances, _GetProxy_traps, _GetProxy_getProxyInstance, _GetProxy_targetMeta, _GetProxy_proxyGet, _GetProxy_proxyHas, _GetProxy_proxySet, _GetProxy_proxyDeleteProperty, _GetProxy_proxyGetOwnPropertyDescriptor, _GetProxy_proxyOwnKeys, _GetProxy_proxyDefineProperty, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProxy = void 0;
const descriptor_js_1 = require("./descriptor.js");
const enums_js_1 = require("./enums.js");
const proxymeta_js_1 = require("./proxymeta.js");
const utils_js_1 = require("./utils.js");
const CustomInspect = Symbol.for('nodejs.util.inspect.custom');
const { None: _None, ProxyAny: _ProxyAny, ProxyExisting: _ProxyExisting, TargetAny: _TargetAny, TargetExisting: _TargetExisting, ProxyThenTarget: _ProxyThenTarget, TargetThenProxy: _TargetThenProxy, } = enums_js_1.WriteTarget;
const { ProxyValue: _ProxyValue, TargetValue: _TargetValue, } = enums_js_1.ConflictResolution;
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
    constructor(toProxy, newProperties = {}, options = {}) {
        _GetProxy_instances.add(this);
        // Private variables
        _GetProxy_traps.set(this, null);
        _GetProxy_getProxyInstance.set(this, {
            instance: this,
            forced: false,
            present: false,
        });
        _GetProxy_targetMeta.set(this, proxymeta_js_1.ProxyMeta.Empty);
        this.options = {
            conflictResolution: enums_js_1.ConflictResolution.ProxyValue,
            preferInstance: false,
            writeTarget: enums_js_1.WriteTarget.ProxyAny
        };
        /** Public object describing proxied values */
        this.proxyMeta = proxymeta_js_1.ProxyMeta.Empty;
        this[_a] = false;
        toProxy = (0, utils_js_1.toInstance)(toProxy);
        if (!toProxy) {
            throw new TypeError(`GetProxy must have a valid object to proxy`);
        }
        const { preferInstance } = options;
        if (options)
            (0, utils_js_1.objectCopy)(this.options, options);
        this.target = toProxy;
        this.proxyMeta = new proxymeta_js_1.ProxyMeta(newProperties);
        __classPrivateFieldSet(this, _GetProxy_targetMeta, new proxymeta_js_1.ProxyMeta(this.target), "f");
        this.proxy = this.genProxy();
        if (preferInstance) {
            __classPrivateFieldGet(this, _GetProxy_getProxyInstance, "f").forced = true;
            return this;
        }
        return this.proxy;
    }
    genProxy(apply = false) {
        const { newDataDescriptor, BASE, VISIBLE } = descriptor_js_1.Descriptor;
        const proxy = new Proxy(this.target, this.proxyTraps);
        Object.defineProperties(this.proxyMeta.object, {
            [Symbol.toStringTag]: newDataDescriptor({ value: 'GetProxyInstance' }, BASE),
        });
        if (process.env.NODE_ENV !== 'production' || __classPrivateFieldGet(this, _GetProxy_getProxyInstance, "f").forced) {
            Object.defineProperties(this.proxyMeta.object, {
                [GetProxy.META]: newDataDescriptor({ value: this }, VISIBLE)
            });
            __classPrivateFieldGet(this, _GetProxy_getProxyInstance, "f").present = true;
        }
        if (apply)
            this.proxy = proxy;
        return proxy;
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
        const { props: proxyProps } = this.proxyMeta;
        const index = proxyProps.findIndex(entry => entry?.property == property);
        const entry = proxyProps[index];
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
    combinedKeys() {
        return Array.from(new Set(this.proxyMeta.keys.concat(__classPrivateFieldGet(this, _GetProxy_targetMeta, "f").keys)));
    }
    hasConflictWith(property) {
        const { keys: proxyKeys } = this.proxyMeta;
        const { keys: targetKeys } = __classPrivateFieldGet(this, _GetProxy_targetMeta, "f");
        return (proxyKeys.includes(property) && targetKeys.includes(property));
    }
    destinationObject() {
        const _dest = this.options.writeTarget;
        if (_dest === enums_js_1.WriteTarget.None) {
            return null;
        }
        if (_dest.isAnyProxy) {
            return this.proxyMeta.object;
        }
        if (_dest.isAnyTarget) {
            return __classPrivateFieldGet(this, _GetProxy_targetMeta, "f").object;
        }
        return null;
    }
    resolvePropConflict(property) {
        const { writeTarget } = this.options;
        const conflictExists = this.hasConflictWith(property);
        const targetFrozen = Object.isFrozen(__classPrivateFieldGet(this, _GetProxy_targetMeta, "f").object);
        const targetHas = Reflect.has(__classPrivateFieldGet(this, _GetProxy_targetMeta, "f").object, property);
        const proxyHas = Reflect.has(this.proxyMeta.object, property);
        if (conflictExists) {
            if (writeTarget.isAnyProxy ||
                (writeTarget.isAnyExisting && proxyHas) ||
                (writeTarget === _TargetThenProxy && targetFrozen)) {
                return enums_js_1.ConflictResolution.ProxyValue;
            }
            else if (writeTarget.isAnyTarget ||
                (writeTarget.isAnyExisting && targetHas)) {
                return enums_js_1.ConflictResolution.TargetValue;
            }
        }
        return writeTarget.isAnyProxy
            ? enums_js_1.ConflictResolution.ProxyValue
            : enums_js_1.ConflictResolution.TargetValue;
    }
    get [(_GetProxy_traps = new WeakMap(), _GetProxy_getProxyInstance = new WeakMap(), _GetProxy_targetMeta = new WeakMap(), _GetProxy_instances = new WeakSet(), Symbol.toStringTag)]() { return this.constructor.name; }
    [(_GetProxy_proxyGet = function _GetProxy_proxyGet(target, prop, receiver) {
        const _dest = this.destinationObject();
        if (_dest) {
            if (Reflect.has(_dest, prop)) {
                return _dest[prop];
            }
        }
        return Reflect.get(target, prop, receiver);
    }, _GetProxy_proxyHas = function _GetProxy_proxyHas(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        if (descriptor) {
            if (descriptor.hasEnumerable && descriptor.isEnumerable)
                return true;
        }
        return Reflect.has(target, prop);
    }, _GetProxy_proxySet = function _GetProxy_proxySet(target, prop, newValue, receiver) {
        const _dest = this.destinationObject();
        const _desc = _dest ? descriptor_js_1.Descriptor.descriptorFor(_dest, prop) : null;
        if (_dest) {
            const frozen = Object.isFrozen(_dest);
            if (!frozen && _desc?.canChange) {
                _desc[prop] = newValue;
                return newValue;
            }
            if (!frozen) {
                _dest[prop] = newValue;
                return newValue;
            }
            return false;
        }
        // const { writeTarget } = this.options
        // const { keys: proxyKeys } = this.proxyMeta
        // const { keys: targetKeys } = this.#targetMeta
        //
        // if (writeTarget === _None) {
        //   return newValue
        // }
        //
        // if (!this.hasConflictWith(prop)) {
        //   if (
        //     (writeTarget === _ProxyExisting && ~proxyKeys.indexOf(prop)) ||
        //     [_ProxyAny, _ProxyThenTarget].includes(writeTarget) ||
        //     (writeTarget === _TargetThenProxy && Object.isFrozen(this.#targetMeta.object))
        //   ) {
        //     this.proxyMeta.object[prop] = newValue
        //     return newValue
        //   }
        //
        //   if (
        //     (writeTarget === _TargetExisting && ~targetKeys.indexOf(prop)) ||
        //     [_TargetAny, _TargetThenProxy].includes(writeTarget)
        //   ) {
        //     return Reflect.set(target, prop, newValue, receiver)
        //   }
        // }
        //
        // const resolution = this.resolvePropConflict(prop)
        // if (resolution === ConflictResolution.ProxyValue) {
        //   const entry = this.getIfHas(prop) ?? {}
        //   const propObj = this.proxyMeta.object
        //   let { descriptor } = entry
        //
        //   if (descriptor && propObj) {
        //     descriptor.alterValue(newValue)
        //     return descriptor.computeValue()
        //   }
        // }
        return Reflect.set(target, prop, newValue, receiver);
    }, _GetProxy_proxyDeleteProperty = function _GetProxy_proxyDeleteProperty(target, prop) {
        const { writeTarget } = this.options;
        if (writeTarget === _None)
            return false;
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor, index } = entry;
        const { props: proxyProps, object: proxyObj } = this.proxyMeta;
        if (descriptor?.canDelete && proxyObj) {
            const currentCount = proxyProps.length;
            delete proxyObj[prop];
            this.proxyMeta = new proxymeta_js_1.ProxyMeta(this.proxyMeta.object);
            return (currentCount > proxyProps.length);
        }
        return Reflect.deleteProperty(target, prop);
    }, _GetProxy_proxyGetOwnPropertyDescriptor = function _GetProxy_proxyGetOwnPropertyDescriptor(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        // TODO: check the proper object and look for conflicts
        if (descriptor) {
            return descriptor.descriptor;
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
    }, _GetProxy_proxyOwnKeys = function _GetProxy_proxyOwnKeys(target) {
        const ownKeys = __classPrivateFieldGet(this, _GetProxy_targetMeta, "f").keys;
        const proxyKeys = this.proxyMeta.keys;
        return Array.from(new Set(ownKeys.concat(proxyKeys)));
    }, _GetProxy_proxyDefineProperty = function _GetProxy_proxyDefineProperty(target, prop, newDescriptor) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        const _dest = this.destinationObject();
        const _destDescriptors = descriptor_js_1.Descriptor.descriptorsFor(_dest, 'instance', true);
        if (_dest) {
            if (descriptor_js_1.Descriptor.descriptorsFor(_dest, false, 'keys').includes(prop)) {
                if (_destDescriptors[prop].canChange) {
                    Object.defineProperty(_dest, prop, newDescriptor);
                    return true;
                }
                return false;
            }
            Object.defineProperty(_dest, prop, newDescriptor);
            return true;
        }
        return Reflect.defineProperty(target, prop, newDescriptor);
    }, _a = Symbol.for(`GetProxy.replVerbosity`), Symbol.for('nodejs.util.inspect.custom'))](depth, opts, inspect) {
        const { keysFor } = descriptor_js_1.Descriptor;
        const quickType = o => /(\w+)]/.exec(Object.prototype.toString.call(o))[1];
        const killCruft = s => s.replace(/^\[ /g, '').replace(/ ]$/, '').replace(/'/g, '');
        const kinspect = o => killCruft(inspect(o, iOpts));
        const iOpts = { ...opts, depth };
        const typeOfObj = quickType(this.target);
        const targetKeys = kinspect(keysFor(__classPrivateFieldGet(this, _GetProxy_targetMeta, "f").object, false, true));
        const proxiedKeys = kinspect(keysFor(this.proxyMeta.object, false, true));
        const metaState = __classPrivateFieldGet(this, _GetProxy_getProxyInstance, "f").present ? "present" : "missing";
        const forcedState = __classPrivateFieldGet(this, _GetProxy_getProxyInstance, "f").forced ? ' (forced)' : '';
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
        const meta = new GetProxy(object, newProps, { preferInstance: true });
        const proxy = meta.proxy;
        return [proxy, meta];
    }
}
exports.GetProxy = GetProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0cHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0cHJveHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQTRDO0FBQzVDLHlDQUE0RDtBQUM1RCxpREFBMEM7QUFDMUMseUNBQWlFO0FBRWpFLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtBQUU5RCxNQUFNLEVBQ0osSUFBSSxFQUFFLEtBQUssRUFDWCxRQUFRLEVBQUUsU0FBUyxFQUNuQixhQUFhLEVBQUUsY0FBYyxFQUM3QixTQUFTLEVBQUUsVUFBVSxFQUNyQixjQUFjLEVBQUUsZUFBZSxFQUMvQixlQUFlLEVBQUUsZ0JBQWdCLEVBQ2pDLGVBQWUsRUFBRSxnQkFBZ0IsR0FDbEMsR0FBRyxzQkFBVyxDQUFBO0FBRWYsTUFBTSxFQUNKLFVBQVUsRUFBRSxXQUFXLEVBQ3ZCLFdBQVcsRUFBRSxZQUFZLEdBQzFCLEdBQUcsNkJBQWtCLENBQUE7QUFFdEIsTUFBYSxRQUFRO0lBa0JuQjs7Ozs7Ozs7O09BU0c7SUFDSCxZQUNFLE9BQU8sRUFDUCxhQUFhLEdBQUcsRUFBRSxFQUNsQixPQUFPLEdBQUcsRUFBRTs7UUE5QmQsb0JBQW9CO1FBQ3BCLDBCQUFTLElBQUksRUFBQTtRQUNiLHFDQUFvQjtZQUNsQixRQUFRLEVBQUUsSUFBSTtZQUNkLE1BQU0sRUFBRSxLQUFLO1lBQ2IsT0FBTyxFQUFFLEtBQUs7U0FDZixFQUFBO1FBQ0QsK0JBQWMsd0JBQVMsQ0FBQyxLQUFLLEVBQUE7UUFDN0IsWUFBTyxHQUFHO1lBQ1Isa0JBQWtCLEVBQUUsNkJBQWtCLENBQUMsVUFBVTtZQUNqRCxjQUFjLEVBQUUsS0FBSztZQUNyQixXQUFXLEVBQUUsc0JBQVcsQ0FBQyxRQUFRO1NBQ2xDLENBQUE7UUFFRCw4Q0FBOEM7UUFDOUMsY0FBUyxHQUFHLHdCQUFTLENBQUMsS0FBSyxDQUFBO1FBOFQz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