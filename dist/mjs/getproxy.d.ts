export class GetProxy {
    static get META(): symbol;
    static get REPL_VERBOSITY(): symbol;
    static for(object: any, newProps?: any[]): any[];
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
    constructor(toProxy: any, newProperties?: {}, options?: {});
    options: {
        conflictResolution: any;
        preferInstance: boolean;
        writeTarget: any;
    };
    /** Public object describing proxied values */
    proxyMeta: ProxyMeta;
    target: any;
    proxy: any;
    genProxy(apply?: boolean): any;
    get proxyTraps(): null;
    getIfHas(property: any): Object | null;
    combinedKeys(): any[];
    hasConflictWith(property: any): any;
    destinationObject(): Object | null;
    resolvePropConflict(property: any): any;
    get [Symbol.toStringTag](): string;
    #private;
}
import { ProxyMeta } from './proxymeta.js';
