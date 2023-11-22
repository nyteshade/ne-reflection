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
    constructor(toProxy: any, newProperties: any, { forceMeta }?: {
        forceMeta: boolean;
    });
    target: any;
    proxy: any;
    genProperties(fromObject: any): void;
    propertiesObject: any;
    properties: any;
    genProxy(apply?: boolean): any;
    process(object: any): any[];
    get proxyTraps(): null;
    getIfHas(property: any): any;
    get [Symbol.toStringTag](): string;
    #private;
}
