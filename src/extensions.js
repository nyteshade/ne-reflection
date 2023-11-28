import { GetProxy } from './getproxy.js'

export const NEReflect = new GetProxy(Reflect, {
  hasEvery(object, ...props) {
    return (
      props
        .map(prop => Reflect.has(object, prop))
        .every(e => e)
    )
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
    return (
      props
        .map(prop => Reflect.has(object, prop))
        .some(e => e)
    )
  }
})