import { emitEnum } from './utils'

export const WriteTarget = emitEnum(
  'WriteTarget',
  [
    ['None', 'No value can be written to this proxy instance'],
    ['ProxyAny', 'Values may only be written to the proxy object'],
    ['ProxyExisting', 'Only defined values may be written to proxy properties'],
    ['TargetAny', 'Values may only be written to the target object'],
    ['TargetExisting', 'Only target defined values may be written'],
    ['ProxyThenTarget', 'Values may be written to proxy first then target'],
    ['TargetThenProxy', 'Values may be written to target first then proxy'],
  ],
  {
    get isAnyProxy() {
      const { ProxyAny, ProxyExisting, ProxyThenTarget, TargetThenProxy } =
        WriteTarget
      return [ ProxyAny, ProxyExisting, ProxyThenTarget, TargetThenProxy ].
        includes(this)
    },
    get isAnyTarget() {
      const { TargetAny, TargetExisting, TargetThenProxy, ProxyThenTarget } =
        WriteTarget
      return [ TargetAny, TargetExisting, TargetThenProxy, ProxyThenTarget ].
        includes(this)
    },
    get isAnyAny() {
      const { None, ProxyExisting, TargetExisting } = WriteTarget
      return ![ None, ProxyExisting, TargetExisting ].includes(this)
    },
    get isAnyExisting() {
      const { ProxyExisting, TargetExisting } = WriteTarget
      return [ ProxyExisting, TargetExisting ].includes(this)
    }
  }
)

export const ConflictResolution = emitEnum(
  'ConflictResolution',
  ['ProxyValue', 'TargetValue']
)

