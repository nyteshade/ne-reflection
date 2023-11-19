const { NEGetProxy } = require('..')

describe('NEGetProxy', () => {
  let targetObject
  let neProxy

  beforeEach(() => {
    targetObject = { existingProp: 'existingValue' }
    neProxy = new NEGetProxy(targetObject, [
      ['newProp', 'newValue', null, false],
      { property: 'getterProp', value: () => 'getterValue', isGetter: true }
    ])
  })

  test('constructor should create proxy with additional properties', () => {
    expect(neProxy.proxy.newProp).toBe('newValue')
    expect(neProxy.proxy.existingProp).toBe('existingValue')
  })

  test('constructor should throw if no target object is provided', () => {
    expect(() => new NEGetProxy(null)).toThrow(TypeError)
  })

  test('proxy should handle getter properties correctly', () => {
    expect(neProxy.proxy.getterProp).toBe('getterValue')
  })

  test('proxy should reflect changes to the target object', () => {
    targetObject.existingProp = 'updatedValue'
    expect(neProxy.proxy.existingProp).toBe('updatedValue')
  })

  test('proxy should allow adding new properties', () => {
    neProxy.proxy.anotherNewProp = 'anotherNewValue'
    expect(neProxy.proxy.anotherNewProp).toBe('anotherNewValue')
  })

  test('proxy should handle property deletion correctly', () => {
    delete neProxy.proxy.newProp
    expect(neProxy.proxy.newProp).toBeUndefined()
  })

  test('proxy should handle property definition correctly', () => {
    Object.defineProperty(neProxy.proxy, 'definedProp', {
      value: 'definedValue',
      writable: true
    })
    expect(neProxy.proxy.definedProp).toBe('definedValue')
  })

  test('proxy should respect property descriptors', () => {
    Object.defineProperty(neProxy.proxy, 'readOnlyProp', {
      value: 'readOnlyValue',
      writable: false
    })

    neProxy.proxy.readOnlyProp = 'newValue'
    expect(neProxy.proxy.readOnlyProp).toBe('readOnlyValue')
  })

  test('proxy `has` trap should work correctly', () => {
    expect('newProp' in neProxy.proxy).toBe(true)
    expect('nonExistentProp' in neProxy.proxy).toBe(false)
  })

  // Add more tests as needed to cover all aspects of your class
})
