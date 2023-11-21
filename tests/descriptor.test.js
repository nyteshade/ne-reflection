const { Descriptor }  = require('../dist/cjs/index.js')

describe('Descriptor', () => {
  describe('constructor', () => {
    it('should create an Descriptor with the given properties', () => {
      const data = {
        configurable: true,
        enumerable: true,
        value: 'test',
        writable: true,
      }

      const descriptor = new Descriptor(data)

      expect(descriptor.descriptor).toEqual(data)
    })

    it('should throw TypeError for invalid property types', () => {
      jest.spyOn(console, 'error').mockImplementation(() => { })
      expect(() => new Descriptor({ configurable: 'invalid' })).toThrow(TypeError)
      expect(() => new Descriptor({ enumerable: 'invalid' })).toThrow(TypeError)
      expect(() => new Descriptor({ writable: 'invalid' })).toThrow(TypeError)
      expect(() => new Descriptor({ get: 'invalid' })).toThrow(TypeError)
      expect(() => new Descriptor({ set: 'invalid' })).toThrow(TypeError)
      console.error.mockRestore()
    })
  })

  describe('getters', () => {
    it('should correctly identify data and accessor descriptors', () => {
      const dataDescriptor = new Descriptor({ value: 'test', writable: true })
      expect(dataDescriptor.isDataType).toBe(true)
      expect(dataDescriptor.isAccessorType).toBe(false)

      const accessorDescriptor = new Descriptor({ get: () => {}, set: (v) => {} })
      expect(accessorDescriptor.isAccessorType).toBe(true)
      expect(accessorDescriptor.isDataType).toBe(false)
    })

    it('should return the correct descriptor type', () => {
      const dataDescriptor = new Descriptor({ value: 'test', writable: true })
      const accessorDescriptor = new Descriptor({ get: () => {} })
      const baseDescriptor = new Descriptor({})
      
      expect(dataDescriptor.type).toBe(Descriptor.DATA)
      expect(accessorDescriptor.type).toBe(Descriptor.ACCESSOR)
      expect(baseDescriptor.type).toBe(Descriptor.BASE)
    })

    it('should override toStringTag correctly', () => {
      const descriptor = new Descriptor({})
      expect(descriptor[Symbol.toStringTag]).toBe('Descriptor')
    })
  })

  describe('static methods', () => {
    describe('isDataDescriptor', () => {
      it('should correctly identify data descriptors', () => {
        expect(Descriptor.isDataDescriptor({ value: 'test', writable: true })).toBe(true)
        expect(Descriptor.isDataDescriptor({ get: () => {} })).toBe(false)
      })
    })

    describe('isAccessorTypeDescriptor', () => {
      it('should correctly identify accessor descriptors', () => {
        expect(Descriptor.isAccessorDescriptor({ get: () => {} })).toBe(true)
        expect(Descriptor.isAccessorDescriptor({ value: 'test' })).toBe(false)
      })
    })

    describe('newDataDescriptor', () => {
      it('should create a new data descriptor with defaults', () => {
        const descriptor = Descriptor.newDataDescriptor(
          { value: 'test', writable: true }
        )
        expect(descriptor).toEqual({
          enumerable: true,
          configurable: false,
          value: 'test',
          writable: true,
        })
      })
    })

    describe('newAccessorDescriptor', () => {
      it('should create a new accessor descriptor with defaults', () => {
        const get = () => {}
        const set = (v) => {}
        const descriptor = Descriptor.newAccessorDescriptor({ get, set })
        expect(descriptor).toEqual({
          enumerable: true,
          configurable: false,
          get,
          set,
        })
      })
    })
  })

  describe('static properties', () => {
    it('should have the correct static base types', () => {
      expect(Descriptor.BASE).toBe('base')
      expect(Descriptor.VISIBLE).toBe('visible')
      expect(Descriptor.OPEN).toBe('open')
    })

    it('should have the correct static descriptor types', () => {
      expect(Descriptor.DATA).toBe('data')
      expect(Descriptor.ACCESSOR).toBe('accessor')
    })

    it('should have the correct base descriptors', () => {
      expect(Descriptor.BaseDescriptor).toEqual({ enumerable: false, configurable: false })
      expect(Descriptor.VisibleDescriptor).toEqual({ enumerable: true, configurable: false })
      expect(Descriptor.OpenDescriptor).toEqual({ enumerable: true, configurable: true })
    })
  })
})
