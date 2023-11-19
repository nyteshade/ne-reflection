const { ObjectDescriptor }  = require('../dist/cjs/index.js')

describe('ObjectDescriptor', () => {
  describe('constructor', () => {
    it('should create an ObjectDescriptor with the given properties', () => {
      const data = {
        configurable: true,
        enumerable: true,
        value: 'test',
        writable: true,
      }

      const descriptor = new ObjectDescriptor(data)

      console.log(descriptor)

      expect(descriptor.descriptor).toEqual(data)
    })

    it('should throw TypeError for invalid property types', () => {
      expect(() => new ObjectDescriptor({ configurable: 'invalid' })).toThrow(TypeError)
      expect(() => new ObjectDescriptor({ enumerable: 'invalid' })).toThrow(TypeError)
      expect(() => new ObjectDescriptor({ writable: 'invalid' })).toThrow(TypeError)
      expect(() => new ObjectDescriptor({ get: 'invalid' })).toThrow(TypeError)
      expect(() => new ObjectDescriptor({ set: 'invalid' })).toThrow(TypeError)
    })
  })

  describe('getters', () => {
    it('should correctly identify data and accessor descriptors', () => {
      const dataDescriptor = new ObjectDescriptor({ value: 'test', writable: true })
      expect(dataDescriptor.isData).toBe(true)
      expect(dataDescriptor.isAccessor).toBe(false)

      const accessorDescriptor = new ObjectDescriptor({ get: () => {}, set: (v) => {} })
      expect(accessorDescriptor.isAccessor).toBe(true)
      expect(accessorDescriptor.isData).toBe(false)
    })

    it('should return the correct descriptor type', () => {
      const dataDescriptor = new ObjectDescriptor({ value: 'test', writable: true })
      const accessorDescriptor = new ObjectDescriptor({ get: () => {} })
      const baseDescriptor = new ObjectDescriptor({})
      
      expect(dataDescriptor.type).toBe(ObjectDescriptor.DATA)
      expect(accessorDescriptor.type).toBe(ObjectDescriptor.ACCESSOR)
      expect(baseDescriptor.type).toBe(ObjectDescriptor.BASE)
    })

    it('should override toStringTag correctly', () => {
      const descriptor = new ObjectDescriptor({})
      expect(descriptor[Symbol.toStringTag]).toBe('ObjectDescriptor')
    })
  })

  describe('static methods', () => {
    describe('isDataDescriptor', () => {
      it('should correctly identify data descriptors', () => {
        expect(ObjectDescriptor.isDataDescriptor({ value: 'test', writable: true })).toBe(true)
        expect(ObjectDescriptor.isDataDescriptor({ get: () => {} })).toBe(false)
      })
    })

    describe('isAccessorDescriptor', () => {
      it('should correctly identify accessor descriptors', () => {
        expect(ObjectDescriptor.isAccessorDescriptor({ get: () => {} })).toBe(true)
        expect(ObjectDescriptor.isAccessorDescriptor({ value: 'test' })).toBe(false)
      })
    })

    describe('newData', () => {
      it('should create a new data descriptor with defaults', () => {
        const descriptor = ObjectDescriptor.newData({ value: 'test', writable: true })
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
        const descriptor = ObjectDescriptor.newAccessorDescriptor({ get, set })
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
      expect(ObjectDescriptor.BASE).toBe('base')
      expect(ObjectDescriptor.VISIBLE).toBe('visible')
      expect(ObjectDescriptor.OPEN).toBe('open')
    })

    it('should have the correct static descriptor types', () => {
      expect(ObjectDescriptor.DATA).toBe('data')
      expect(ObjectDescriptor.ACCESSOR).toBe('accessor')
    })

    it('should have the correct base descriptors', () => {
      expect(ObjectDescriptor.BaseDescriptor).toEqual({ enumerable: false, configurable: false })
      expect(ObjectDescriptor.VisibleDescriptor).toEqual({ enumerable: true, configurable: false })
      expect(ObjectDescriptor.OpenDescriptor).toEqual({ enumerable: true, configurable: true })
    })
  })
})
