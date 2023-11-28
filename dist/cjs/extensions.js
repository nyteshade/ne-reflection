"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEReflect = void 0;
const getproxy_js_1 = require("./getproxy.js");
exports.NEReflect = new getproxy_js_1.GetProxy(Reflect, {
    hasEvery(object, ...props) {
        return (props
            .map(prop => Reflect.has(object, prop))
            .every(e => e));
    },
    /**
     * Iterate through each of the supplied properties and return
     * true if at least one of them exists on the supplied object
     *
     * @param {object} object the object to check for properties to
     * iterate over
     * @param  {...any} props the properties, in a comma separated
     * list, to determine existence of on the supplied object
     * @returns true if some of the properties supplied exist, false
     * otherwise
     */
    hasSome(object, ...props) {
        return (props
            .map(prop => Reflect.has(object, prop))
            .some(e => e));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QztBQUUzQixRQUFBLFNBQVMsR0FBRyxJQUFJLHNCQUFRLENBQUMsT0FBTyxFQUFFO0lBQzdDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLO1FBQ3ZCLE9BQU8sQ0FDTCxLQUFLO2FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdEMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ2pCLENBQUE7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLO1FBQ3RCLE9BQU8sQ0FDTCxLQUFLO2FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ2hCLENBQUE7SUFDSCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIn0=