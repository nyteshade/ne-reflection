/**
 * Represents an error that occurs when write operation is
 * not allowed.
 */
export class WriteNotAllowedError extends Error {
    constructor(declaredWriteOptions: any);
}
