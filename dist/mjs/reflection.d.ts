export class NEGetProxy {
    static for(object: any, newProps?: any[]): any[];
    constructor(toProxy: any, newProperties?: any[]);
    target: any;
    properties: any[];
    proxy: any;
    process(inputParameters: any): any[];
    get proxyTraps(): null;
    getIfHas(property: any, returnDestructable?: boolean): any;
    #private;
}
