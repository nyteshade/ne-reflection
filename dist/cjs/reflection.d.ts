export class NEGetProxy {
    static get kNEGetProxy(): symbol;
    static for(object: any, newProps?: any[]): any[];
    constructor(toProxy: any, newProperties: any);
    propertiesObject: any;
    properties: ObjectDescriptor[];
    target: any;
    proxy: any;
    process(object: any): ObjectDescriptor[];
    get proxyTraps(): null;
    getIfHas(property: any): {} | null;
    #private;
}
import { ObjectDescriptor } from "./objectdescriptor.js";
