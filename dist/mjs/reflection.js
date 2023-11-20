import { ObjectDescriptor } from "./objectdescriptor.js";
export class NEGetProxy {
    // Private variables
    #traps = null;
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
        if (!toProxy) {
            throw new TypeError('NEGetProxy must have a valid object to proxy');
        }
        this.propertiesObject = newProperties;
        this.properties = this.process(newProperties);
        this.target = toProxy;
        this.proxy = new Proxy(toProxy, this.proxyTraps);
    }
    process(object) {
        const { OPEN, BASE } = ObjectDescriptor;
        const { entries, getOwnPropertyDescriptors: getDescriptors } = Object;
        const converted = entries(getDescriptors(object))
            .map(([name, descriptor]) => {
            return new ObjectDescriptor(descriptor, OPEN, object, name);
        });
        if (process.env.NODE_ENV !== 'production') {
            const propObj = this.propertiesObject;
            const property = NEGetProxy.kNEGetProxy;
            const rawDescriptor = ObjectDescriptor.newDataDescriptor({ value: this });
            converted.push(new ObjectDescriptor(rawDescriptor, BASE, propObj, property));
            console.log(`[post-process] `, propObj, property, rawDescriptor);
        }
        return converted;
    }
    get proxyTraps() {
        if (!this.#traps) {
            this.#traps = {
                get: this.#proxyGet.bind(this),
                has: this.#proxyHas.bind(this),
                set: this.#proxySet.bind(this),
                deleteProperty: this.#proxyDeleteProperty.bind(this),
                getOwnPropertyDescriptor: this.#proxyGetOwnPropertyDescriptor.bind(this),
                defineProperty: this.#proxyDefineProperty.bind(this),
            };
        }
        return this.#traps;
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
    #proxyGet(target, prop, receiver) {
        const neProp = this.getIfHas(prop);
        if (neProp) {
            return neProp.descriptorObj.computeValue();
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
    }
    #proxyDeleteProperty(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor, index } = entry;
        if (descriptor?.canDelete) {
            const currentCount = this.properties.length;
            this.properties.splice(index, 1);
            return (currentCount > this.properties.length);
        }
        return Reflect.deleteProperty(target, prop);
    }
    #proxyGetOwnPropertyDescriptor(target, prop) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor } = entry;
        if (descriptor) {
            return descriptor.descriptor;
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
    }
    #proxyDefineProperty(target, prop, newDescriptor) {
        const entry = this.getIfHas(prop) ?? {};
        const { descriptor, index } = entry;
        if (descriptor?.canChange) {
            this.properties[index] = new ObjectDescriptor(newDescriptor);
            return !!this.properties[index];
        }
        return Reflect.defineProperty(target, prop, newDescriptor);
    }
    static get kNEGetProxy() { return Symbol.for(this.name); }
    static for(object, newProps = []) {
        const instance = new NEGetProxy(object, newProps);
        return [instance?.proxy, instance];
    }
}
