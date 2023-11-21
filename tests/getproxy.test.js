const { GetProxy } = require('../dist/cjs/index.js')

describe(GetProxy.name, () => {
  let targetObject
  let neProxy
  let meta

  beforeEach(() => {
    targetObject = { existingProp: 'existingValue' };
    meta = new GetProxy(targetObject, {
      newProp: 'newValue',
      get getterProp() { return 'getterValue' },
    }, { forceMeta: true });
    neProxy = meta.proxy;
  })

  test('constructor should create proxy with additional properties', () => {
    expect(neProxy.newProp).toBe('newValue')
    expect(neProxy.existingProp).toBe('existingValue')
  })

  test('constructor should throw if no target object is provided', () => {
    jest.spyOn(console, 'error').mockImplementation(() => { })
    expect(() => new GetProxy(null)).toThrow(TypeError)
    console.error.mockRestore()
  })

  test('proxy should handle getter properties correctly', () => {
    expect(neProxy.getterProp).toBe('getterValue')
  })

  test('proxy should reflect changes to the target object', () => {
    targetObject.existingProp = 'updatedValue'
    expect(neProxy.existingProp).toBe('updatedValue')
  })

  test('proxy should allow adding new properties', () => {
    neProxy.anotherNewProp = 'anotherNewValue'
    expect(neProxy.anotherNewProp).toBe('anotherNewValue')
  })

  test('proxy should handle property deletion correctly', () => {
    delete neProxy.newProp
    expect(neProxy.newProp).toBeUndefined()
  })

  test('proxy should handle property definition correctly', () => {
    Object.defineProperty(neProxy, 'definedProp', {
      value: 'definedValue',
      writable: true
    })
    expect(neProxy.definedProp).toBe('definedValue')
  })

  test('proxy should respect property descriptors', () => {
    Object.defineProperty(neProxy, 'readOnlyProp', {
      value: 'readOnlyValue',
      writable: false
    })

    neProxy.readOnlyProp = 'newValue'
    expect(neProxy.readOnlyProp).toBe('readOnlyValue')
  })

  test('proxy `has` trap should work correctly', () => {
    expect('newProp' in neProxy).toBe(true)
    expect('nonExistentProp' in neProxy).toBe(false)
  })

  // Add more tests as needed to cover all aspects of your class
})
