import { WriteOptions } from './enums.js'

/**
 * Represents an error that occurs when write operation is 
 * not allowed.
 */
export class WriteNotAllowedError extends Error {
  constructor(declaredWriteOptions) {
    super([
      `Unable to write value to property. Options for this`,
      `instance of GetProxy are set to ${declaredWriteOptions}`
    ].join(' '))
  }
}

