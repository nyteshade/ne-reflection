import { GetProxy } from './getproxy.js';
export const NEReflect = new GetProxy(Reflect, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFFeEMsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRTtJQUM3QyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSztRQUN2QixPQUFPLENBQ0wsS0FBSzthQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3RDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNqQixDQUFBO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSztRQUN0QixPQUFPLENBQ0wsS0FBSzthQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3RDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNoQixDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQSJ9