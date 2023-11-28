"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolution = exports.WriteTarget = void 0;
const utils_1 = require("./utils");
exports.WriteTarget = (0, utils_1.emitEnum)('WriteTarget', [
    ['None', 'No value can be written to this proxy instance'],
    ['ProxyAny', 'Values may only be written to the proxy object'],
    ['ProxyExisting', 'Only defined values may be written to proxy properties'],
    ['TargetAny', 'Values may only be written to the target object'],
    ['TargetExisting', 'Only target defined values may be written'],
    ['ProxyThenTarget', 'Values may be written to proxy first then target'],
    ['TargetThenProxy', 'Values may be written to target first then proxy'],
], {
    get isAnyProxy() {
        const { ProxyAny, ProxyExisting, ProxyThenTarget, TargetThenProxy } = exports.WriteTarget;
        return [ProxyAny, ProxyExisting, ProxyThenTarget, TargetThenProxy].
            includes(this);
    },
    get isAnyTarget() {
        const { TargetAny, TargetExisting, TargetThenProxy, ProxyThenTarget } = exports.WriteTarget;
        return [TargetAny, TargetExisting, TargetThenProxy, ProxyThenTarget].
            includes(this);
    },
    get isAnyAny() {
        const { None, ProxyExisting, TargetExisting } = exports.WriteTarget;
        return ![None, ProxyExisting, TargetExisting].includes(this);
    },
    get isAnyExisting() {
        const { ProxyExisting, TargetExisting } = exports.WriteTarget;
        return [ProxyExisting, TargetExisting].includes(this);
    }
});
exports.ConflictResolution = (0, utils_1.emitEnum)('ConflictResolution', ['ProxyValue', 'TargetValue']);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW51bXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQWtDO0FBRXJCLFFBQUEsV0FBVyxHQUFHLElBQUEsZ0JBQVEsRUFDakMsYUFBYSxFQUNiO0lBQ0UsQ0FBQyxNQUFNLEVBQUUsZ0RBQWdELENBQUM7SUFDMUQsQ0FBQyxVQUFVLEVBQUUsZ0RBQWdELENBQUM7SUFDOUQsQ0FBQyxlQUFlLEVBQUUsd0RBQXdELENBQUM7SUFDM0UsQ0FBQyxXQUFXLEVBQUUsaURBQWlELENBQUM7SUFDaEUsQ0FBQyxnQkFBZ0IsRUFBRSwyQ0FBMkMsQ0FBQztJQUMvRCxDQUFDLGlCQUFpQixFQUFFLGtEQUFrRCxDQUFDO0lBQ3ZFLENBQUMsaUJBQWlCLEVBQUUsa0RBQWtELENBQUM7Q0FDeEUsRUFDRDtJQUNFLElBQUksVUFBVTtRQUNaLE1BQU0sRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsR0FDakUsbUJBQVcsQ0FBQTtRQUNiLE9BQU8sQ0FBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUU7WUFDbEUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xCLENBQUM7SUFDRCxJQUFJLFdBQVc7UUFDYixNQUFNLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLEdBQ25FLG1CQUFXLENBQUE7UUFDYixPQUFPLENBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFFO1lBQ3BFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLEdBQUcsbUJBQVcsQ0FBQTtRQUMzRCxPQUFPLENBQUMsQ0FBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0lBQ0QsSUFBSSxhQUFhO1FBQ2YsTUFBTSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsR0FBRyxtQkFBVyxDQUFBO1FBQ3JELE9BQU8sQ0FBRSxhQUFhLEVBQUUsY0FBYyxDQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3pELENBQUM7Q0FDRixDQUNGLENBQUE7QUFFWSxRQUFBLGtCQUFrQixHQUFHLElBQUEsZ0JBQVEsRUFDeEMsb0JBQW9CLEVBQ3BCLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUM5QixDQUFBIn0=