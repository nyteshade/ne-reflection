import { Descriptor } from './descriptor.js';
import { ConflictResolution, WriteTarget } from './enums.js';
import { ProxyMeta } from './proxymeta.js';
import { objectCopy, stripNullish, toInstance } from './utils.js';
const CustomInspect = Symbol.for('nodejs.util.inspect.custom');
const { None: _None, ProxyAny: _ProxyAny, ProxyExisting: _ProxyExisting, TargetAny: _TargetAny, TargetExisting: _TargetExisting, ProxyThenTarget: _ProxyThenTarget, TargetThenProxy: _TargetThenProxy, } = WriteTarget;
const { ProxyValue: _ProxyValue, TargetValue: _TargetValue, } = ConflictResolution;
export class GetProxy {
    // Private variables
    #traps = null;
    #getProxyInstance = {
        instance: this,
        forced: false,
        present: false,
    };
    #targetMeta = ProxyMeta.Empty;
    options = {
        conflictResolution: ConflictResolution.ProxyValue,
        preferInstance: false,
        writeTarget: WriteTarget.ProxyAny
    };
    /** Public object describing proxied values */
    proxyMeta = ProxyMeta.Empty;
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
        toProxy = toInstance(toProxy);
        if (!toProxy) {
            throw new TypeError(`GetProxy must have a valid object to proxy`);
        }
        const { preferInstance } = options;
        if (options)
            objectCopy(this.options, options);
        this.target = toProxy;
        this.proxyMeta = new ProxyMeta(newProperties);
        this.#targetMeta = new ProxyMeta(this.target);
        this.proxy = this.genProxy();
        if (preferInstance) {
            this.#getProxyInstance.forced = true;
            return this;
        }
        return this.proxy;
    }
    genProxy(apply = false) {
        const { newDataDescriptor, BASE, VISIBLE } = Descriptor;
        const proxy = new Proxy(this.target, this.proxyTraps);
        Object.defineProperties(this.proxyMeta.object, {
            [Symbol.toStringTag]: newDataDescriptor({ value: 'GetProxyInstance' }, BASE),
        });
        if (process.env.NODE_ENV !== 'production' || this.#getProxyInstance.forced) {
            Object.defineProperties(this.proxyMeta.object, {
                [GetProxy.META]: newDataDescriptor({ value: this }, VISIBLE)
            });
            this.#getProxyInstance.present = true;
        }
        if (apply)
            this.proxy = proxy;
        return proxy;
    }
    get proxyTraps() {
        if (!this.#traps) {
            this.#traps = {
                get: this.#proxyGet.bind(this),
                has: this.#proxyHas.bind(this),
                set: this.#proxySet.bind(this),
                ownKeys: this.#proxyOwnKeys.bind(this),
                deleteProperty: this.#proxyDeleteProperty.bind(this),
                getOwnPropertyDescriptor: this.#proxyGetOwnPropertyDescriptor.bind(this),
                defineProperty: this.#proxyDefineProperty.bind(this),
            };
        }
        return this.#traps;
    }
    getIfHas(property) {
        const { props: proxyProps } = this.proxyMeta;
        const index = proxyProps.findIndex(entry => entry?.property == property);
        const entry = proxyProps[index];
        if (~index && entry) {
            return stripNullish(objectCopy({}, entry.descriptor, {
                index,
                property: entry?.property,
                object: entry?.thisObj,
                descriptor: entry
            }));
        }
        return null;
    }
    combinedKeys() {
        return Array.from(new Set(this.proxyMeta.keys.concat(this.#targetMeta.keys)));
    }
    hasConflictWith(property) {
        const { keys: proxyKeys } = this.proxyMeta;
        const { keys: targetKeys } = this.#targetMeta;
        return (proxyKeys.includes(property) && targetKeys.includes(property));
    }
    destinationObject() {
        const _dest = this.options.writeTarget;
        if (_dest === WriteTarget.None) {
            return null;
        }
        if (_dest.isAnyProxy) {
            return this.proxyMeta.object;
        }
        if (_dest.isAnyTarget) {
            return this.#targetMeta.object;
        }
        return null;
    }
    resolvePropConflict(property) {
        const { writeTarget } = this.options;
        const conflictExists = this.hasConflictWith(property);
        const targetFrozen = Object.isFrozen(this.#targetMeta.object);
        const targetHas = Reflect.has(this.#targetMeta.object, property);
        const proxyHas = Reflect.has(this.proxyMeta.object, property);
        if (conflictExists) {
            if (writeTarget.isAnyProxy ||
                (writeTarget.isAnyExisting && proxyHas) ||
                (writeTarget === _TargetThenProxy && targetFrozen)) {
                return ConflictResolution.ProxyValue;
            }
            else if (writeTarget.isAnyTarget ||
                (writeTarget.isAnyExisting && targetHas)) {
                return ConflictResolution.TargetValue;
            }
        }
        return writeTarget.isAnyProxy
            ? ConflictResolution.ProxyValue
            : ConflictResolution.TargetValue;
    }
    get [Symbol.toStringTag]() { return this.constructor.name; }
    #proxyGet(target, prop, receiver) {
        const _dest = this.destinationObject();
        if (_dest) {
            if (Reflect.has(_dest, prop)) {
                return _dest[prop];
            }
        }
        return Reflect.get(target, prop, receiver);
    }
    #proxyHas(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        if (descriptor) {
            if (descriptor.hasEnumerable && descriptor.isEnumerable)
                return true;
        }
        return Reflect.has(target, prop);
    }
    #proxySet(target, prop, newValue, receiver) {
        const _dest = this.destinationObject();
        const _desc = _dest ? Descriptor.descriptorFor(_dest, prop) : null;
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
    }
    #proxyDeleteProperty(target, prop) {
        const { writeTarget } = this.options;
        if (writeTarget === _None)
            return false;
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor, index } = entry;
        const { props: proxyProps, object: proxyObj } = this.proxyMeta;
        if (descriptor?.canDelete && proxyObj) {
            const currentCount = proxyProps.length;
            delete proxyObj[prop];
            this.proxyMeta = new ProxyMeta(this.proxyMeta.object);
            return (currentCount > proxyProps.length);
        }
        return Reflect.deleteProperty(target, prop);
    }
    #proxyGetOwnPropertyDescriptor(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        // TODO: check the proper object and look for conflicts
        if (descriptor) {
            return descriptor.descriptor;
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
    }
    #proxyOwnKeys(target) {
        const ownKeys = this.#targetMeta.keys;
        const proxyKeys = this.proxyMeta.keys;
        return Array.from(new Set(ownKeys.concat(proxyKeys)));
    }
    #proxyDefineProperty(target, prop, newDescriptor) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        const _dest = this.destinationObject();
        const _destDescriptors = Descriptor.descriptorsFor(_dest, 'instance', true);
        if (_dest) {
            if (Descriptor.descriptorsFor(_dest, false, 'keys').includes(prop)) {
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
    }
    [Symbol.for(`GetProxy.replVerbosity`)] = false;
    [Symbol.for('nodejs.util.inspect.custom')](depth, opts, inspect) {
        const { keysFor } = Descriptor;
        const quickType = o => /(\w+)]/.exec(Object.prototype.toString.call(o))[1];
        const killCruft = s => s.replace(/^\[ /g, '').replace(/ ]$/, '').replace(/'/g, '');
        const kinspect = o => killCruft(inspect(o, iOpts));
        const iOpts = { ...opts, depth };
        const typeOfObj = quickType(this.target);
        const targetKeys = kinspect(keysFor(this.#targetMeta.object, false, true));
        const proxiedKeys = kinspect(keysFor(this.proxyMeta.object, false, true));
        const metaState = this.#getProxyInstance.present ? "present" : "missing";
        const forcedState = this.#getProxyInstance.forced ? ' (forced)' : '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0cHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0cHJveHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUVqRSxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUE7QUFFOUQsTUFBTSxFQUNKLElBQUksRUFBRSxLQUFLLEVBQ1gsUUFBUSxFQUFFLFNBQVMsRUFDbkIsYUFBYSxFQUFFLGNBQWMsRUFDN0IsU0FBUyxFQUFFLFVBQVUsRUFDckIsY0FBYyxFQUFFLGVBQWUsRUFDL0IsZUFBZSxFQUFFLGdCQUFnQixFQUNqQyxlQUFlLEVBQUUsZ0JBQWdCLEdBQ2xDLEdBQUcsV0FBVyxDQUFBO0FBRWYsTUFBTSxFQUNKLFVBQVUsRUFBRSxXQUFXLEVBQ3ZCLFdBQVcsRUFBRSxZQUFZLEdBQzFCLEdBQUcsa0JBQWtCLENBQUE7QUFFdEIsTUFBTSxPQUFPLFFBQVE7SUFDbkIsb0JBQW9CO0lBQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDYixpQkFBaUIsR0FBRztRQUNsQixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxLQUFLO1FBQ2IsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFBO0lBQ0QsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUE7SUFDN0IsT0FBTyxHQUFHO1FBQ1Isa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsVUFBVTtRQUNqRCxjQUFjLEVBQUUsS0FBSztRQUNyQixXQUFXLEVBQUUsV0FBVyxDQUFD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