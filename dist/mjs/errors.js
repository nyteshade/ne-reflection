import { WriteOptions } from './enums.js';
/**
 * Represents an error that occurs when write operation is
 * not allowed.
 */
export class WriteNotAllowedError extends Error {
    constructor(declaredWriteOptions) {
        super([
            `Unable to write value to property. Options for this`,
            `instance of GetProxy are set to ${declaredWriteOptions}`
        ].join(' '));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRXpDOzs7R0FHRztBQUNILE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxLQUFLO0lBQzdDLFlBQVksb0JBQW9CO1FBQzlCLEtBQUssQ0FBQztZQUNKLHFEQUFxRDtZQUNyRCxtQ0FBbUMsb0JBQW9CLEVBQUU7U0FDMUQsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNkLENBQUM7Q0FDRiJ9