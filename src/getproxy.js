import { Descriptor } from './descriptor.js'
import { ConflictResolution, WriteTarget } from './enums.js'
import { ProxyMeta } from './proxymeta.js'
import { objectCopy, stripNullish, toInstance } from './utils.js'

const CustomInspect = Symbol.for('nodejs.util.inspect.custom')

const {
  None: _None,
  ProxyAny: _ProxyAny,
  ProxyExisting: _ProxyExisting,
  TargetAny: _TargetAny,
  TargetExisting: _TargetExisting,
  ProxyThenTarget: _ProxyThenTarget,
  TargetThenProxy: _TargetThenProxy,
} = WriteTarget

const {
  ProxyValue: _ProxyValue,
  TargetValue: _TargetValue,
} = ConflictResolution

export class GetProxy {
  // Private variables
  #traps = null
  #getProxyInstance = {
    instance: this,
    forced: false,
    present: false,
  }
  #targetMeta = ProxyMeta.Empty
  options = {
    conflictResolution: ConflictResolution.ProxyValue,
    preferInstance: false,
    writeTarget: WriteTarget.ProxyAny
  }

  /** Public object describing proxied values */
  proxyMeta = ProxyMeta.Empty

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
  constructor(
    toProxy,
    newProperties = {},
    options = {}
  ) {
    toProxy = toInstance(toProxy)

    if (!toProxy) {
      throw new TypeError(`GetProxy must have a valid object to proxy`)
    }

    const { preferInstance } = options

    if (options)
      objectCopy(this.options, options)

    this.target = toProxy

    this.proxyMeta = new ProxyMeta(newProperties)
    this.#targetMeta = new ProxyMeta(this.target)

    this.proxy = this.genProxy()

    if (preferInstance) {
      this.#getProxyInstance.forced = true
      return this
    }

    return this.proxy
  }

  genProxy(apply = false) {
    const { newDataDescriptor, BASE, VISIBLE } = Descriptor
    const proxy = new Proxy(this.target, this.proxyTraps)

    Object.defineProperties(this.proxyMeta.object, {
      [Symbol.toStringTag]: newDataDescriptor(
        { value: 'GetProxyInstance' },
        BASE
      ),
    })

    if (process.env.NODE_ENV !== 'production' || this.#getProxyInstance.forced) {
      Object.defineProperties(this.proxyMeta.object, {
        [GetProxy.META]: newDataDescriptor(
          { value: this },
          VISIBLE
        )
      })

      this.#getProxyInstance.present = true
    }

    if (apply)
      this.proxy = proxy

    return proxy
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
      }
    }

    return this.#traps
  }

  getIfHas(property) {
    const { props: proxyProps } = this.proxyMeta
    const index = proxyProps.findIndex(entry => entry?.property == property)
    const entry = proxyProps[index]

    if (~index && entry) {
      return stripNullish(objectCopy({}, entry.descriptor, {
        index,
        property: entry?.property,
        object: entry?.thisObj,
        descriptor: entry
      }))
    }

    return null
  }

  combinedKeys() {
    return Array.from(
      new Set(
        this.proxyMeta.keys.concat(this.#targetMeta.keys)
      )
    )
  }

  hasConflictWith(property) {
    const { keys: proxyKeys } = this.proxyMeta
    const { keys: targetKeys } = this.#targetMeta

    return (
      proxyKeys.includes(property) && targetKeys.includes(property)
    )
  }

  destinationObject() {
    const _dest = this.options.writeTarget

    if (_dest === WriteTarget.None) {
      return null
    }

    if (_dest.isAnyProxy) {
      return this.proxyMeta.object
    }

    if (_dest.isAnyTarget) {
      return this.#targetMeta.object
    }

    return null
  }

  resolvePropConflict(property) {
    const { writeTarget } = this.options
    const conflictExists = this.hasConflictWith(property)
    const targetFrozen = Object.isFrozen(this.#targetMeta.object)
    const targetHas = Reflect.has(this.#targetMeta.object, property)
    const proxyHas = Reflect.has(this.proxyMeta.object, property)

    if (conflictExists) {
      if (
        writeTarget.isAnyProxy ||
        (writeTarget.isAnyExisting && proxyHas) ||
        (writeTarget === _TargetThenProxy && targetFrozen)
      ) {
        return ConflictResolution.ProxyValue
      }
      else if (
        writeTarget.isAnyTarget ||
        (writeTarget.isAnyExisting && targetHas)
      ) {
        return ConflictResolution.TargetValue
      }
    }

    return writeTarget.isAnyProxy
      ? ConflictResolution.ProxyValue
      : ConflictResolution.TargetValue
  }

  get [Symbol.toStringTag]() { return this.constructor.name }

  #proxyGet(target, prop, receiver) {
    const _dest = this.destinationObject()
    if (_dest) {
      if (Reflect.has(_dest, prop)) {
        return _dest[prop]
      }
    }

    return Reflect.get(target, prop, receiver)
  }

  #proxyHas(target, prop) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor } = entry

    if (descriptor) {
      if (descriptor.hasEnumerable && descriptor.isEnumerable)
        return true
    }

    return Reflect.has(target, prop)
  }

  #proxySet(target, prop, newValue, receiver) {
    const _dest = this.destinationObject()
    const _desc = _dest ? Descriptor.descriptorFor(_dest, prop) : null

    if (_dest) {
      const frozen = Object.isFrozen(_dest)

      if (!frozen && _desc?.canChange) {
        _desc[prop] = newValue
        return newValue
      }

      if (!frozen) {
        _dest[prop] = newValue
        return newValue
      }

      return false
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

    return Reflect.set(target, prop, newValue, receiver)
  }

  #proxyDeleteProperty(target, prop) {
    const { writeTarget } = this.options

    if (writeTarget === _None)
      return false

    const entry = this.getIfHas(prop) ?? {}
    const { descriptor, index } = entry
    const { props: proxyProps, object: proxyObj } = this.proxyMeta

    if (descriptor?.canDelete && proxyObj) {
      const currentCount = proxyProps.length

      delete proxyObj[prop]
      this.proxyMeta = new ProxyMeta(this.proxyMeta.object)

      return (currentCount > proxyProps.length)
    }

    return Reflect.deleteProperty(target, prop)
  }

  #proxyGetOwnPropertyDescriptor(target, prop) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor } = entry
    // TODO: check the proper object and look for conflicts

    if (descriptor) {
      return descriptor.descriptor
    }

    return Reflect.getOwnPropertyDescriptor(target, prop)
  }

  #proxyOwnKeys(target) {
    const ownKeys = this.#targetMeta.keys
    const proxyKeys = this.proxyMeta.keys

    return Array.from(new Set(ownKeys.concat(proxyKeys)))
  }

  #proxyDefineProperty(target, prop, newDescriptor) {
    const entry = this.getIfHas(prop) ?? {}
    const { descriptor } = entry
    const _dest = this.destinationObject()
    const _destDescriptors = Descriptor.descriptorsFor(_dest, 'instance', true)

    if (_dest) {
      if (Descriptor.descriptorsFor(_dest, false, 'keys').includes(prop)) {
        if (_destDescriptors[prop].canChange) {
          Object.defineProperty(_dest, prop, newDescriptor)
          return true
        }
        return false
      }

      Object.defineProperty(_dest, prop, newDescriptor)

      return true
    }

    return Reflect.defineProperty(target, prop, newDescriptor)
  }

  [Symbol.for(`GetProxy.replVerbosity`)] = false;
  [Symbol.for('nodejs.util.inspect.custom')](depth, opts, inspect) {
    const { keysFor } = Descriptor

    const quickType   = o => /(\w+)]/.exec(Object.prototype.toString.call(o))[1]
    const killCruft   = s => s.replace(/^\[ /g, '').replace(/ ]$/, '').replace(/'/g, '')
    const kinspect = o => killCruft(inspect(o, iOpts))

    const iOpts       = { ...opts, depth }
    const typeOfObj   = quickType(this.target)

    const targetKeys  = kinspect(keysFor(this.#targetMeta.object, false, true))
    const proxiedKeys = kinspect(keysFor(this.proxyMeta.object, false, true))

    const metaState   = this.#getProxyInstance.present ? "present" : "missing"
    const forcedState = this.#getProxyInstance.forced ? ' (forced)' : ''
    const metaString  = `${metaState}${forcedState}`
    const verbose     = GetProxy[GetProxy.REPL_VERBOSITY]

    if (verbose)
      return [
        `${this[Symbol.toStringTag]} (proxying ${typeOfObj} instance) {`,
        `  targetKeys: ${targetKeys}`,
        `  proxiedKeys: ${proxiedKeys}`,
        `  meta: ${metaString}`,
        `}`
      ].join('\n')
    else
      return (
        `${this[Symbol.toStringTag]} { target: ${targetKeys} proxy: ${proxiedKeys} }`
      )
  }

  static get META() { return Symbol.for(this.name) }
  static get REPL_VERBOSITY() {
    return Symbol.for(`GetProxy.replVerbosity`)
  }

  static for(object, newProps = []) {
    const meta = new GetProxy(object, newProps, { preferInstance: true })
    const proxy = meta.proxy
    return [proxy, meta]
  }
}
