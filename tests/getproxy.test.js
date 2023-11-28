const { GetProxy } = require('../dist/cjs/index.js')

describe(GetProxy.name, () => {
  let targetObject
  let proxy

  beforeEach(() => {
    targetObject = { existingProp: 'existingValue' };
    proxy = new GetProxy(targetObject, {
      newProp: 'newValue',
      get getterProp() { return 'getterValue' },
    });
  })

  afterEach(() => {
    targetObject = null
    proxy = null
  })

  test('constructor should create proxy with additional properties', () => {
    expect(proxy.newProp).toBe('newValue')
    expect(proxy.existingProp).toBe('existingValue')
  })

  test('constructor should throw if no target object is provided', () => {
    jest.spyOn(console, 'error').mockImplementation(() => { })
    expect(() => new GetProxy(null)).toThrow(TypeError)
    console.error.mockRestore()
  })

  test('proxy should handle getter properties correctly', () => {
    expect(proxy.getterProp).toBe('getterValue')
  })

  test('proxy should reflect changes to the target object', () => {
    targetObject.existingProp = 'updatedValue'
    expect(proxy.existingProp).toBe('updatedValue')
  })

  test('proxy should allow adding new properties', () => {
    proxy.anotherNewProp = 'anotherNewValue'
    expect(proxy.anotherNewProp).toBe('anotherNewValue')
  })

  test('proxy should handle property deletion correctly', () => {
    delete proxy.newProp
    expect(proxy.newProp).toBeUndefined()
  })

  test('proxy should handle property definition correctly', () => {
    Object.defineProperty(proxy, 'definedProp', {
      value: 'definedValue',
      writable: true
    })
    expect(proxy.definedProp).toBe('definedValue')
  })

  test('proxy should respect property descriptors', () => {
    Object.defineProperty(proxy, 'readOnlyProp', {
      value: 'readOnlyValue',
      writable: false
    })

    expect(() => { proxy.readOnlyProp = 'newValue' }).toThrow()
    expect(proxy.readOnlyProp).toBe('readOnlyValue')
  })

  test('proxy `has` trap should work correctly', () => {
    expect('newProp' in proxy).toBe(true)
    expect('nonExistentProp' in proxy).toBe(false)
  })

  // Add more tests as needed to cover all aspects of your class
})
