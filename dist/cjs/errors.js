"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteNotAllowedError = void 0;
const enums_js_1 = require("./enums.js");
/**
 * Represents an error that occurs when write operation is
 * not allowed.
 */
class WriteNotAllowedError extends Error {
    constructor(declaredWriteOptions) {
        super([
            `Unable to write value to property. Options for this`,
            `instance of GetProxy are set to ${declaredWriteOptions}`
        ].join(' '));
    }
}
exports.WriteNotAllowedError = WriteNotAllowedError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5Q0FBeUM7QUFFekM7OztHQUdHO0FBQ0gsTUFBYSxvQkFBcUIsU0FBUSxLQUFLO0lBQzdDLFlBQVksb0JBQW9CO1FBQzlCLEtBQUssQ0FBQztZQUNKLHFEQUFxRDtZQUNyRCxtQ0FBbUMsb0JBQW9CLEVBQUU7U0FDMUQsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNkLENBQUM7Q0FDRjtBQVBELG9EQU9DIn0=