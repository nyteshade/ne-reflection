import { emitEnum } from './utils';
export const WriteTarget = emitEnum('WriteTarget', [
    ['None', 'No value can be written to this proxy instance'],
    ['ProxyAny', 'Values may only be written to the proxy object'],
    ['ProxyExisting', 'Only defined values may be written to proxy properties'],
    ['TargetAny', 'Values may only be written to the target object'],
    ['TargetExisting', 'Only target defined values may be written'],
    ['ProxyThenTarget', 'Values may be written to proxy first then target'],
    ['TargetThenProxy', 'Values may be written to target first then proxy'],
], {
    get isAnyProxy() {
        const { ProxyAny, ProxyExisting, ProxyThenTarget, TargetThenProxy } = WriteTarget;
        return [ProxyAny, ProxyExisting, ProxyThenTarget, TargetThenProxy].
            includes(this);
    },
    get isAnyTarget() {
        const { TargetAny, TargetExisting, TargetThenProxy, ProxyThenTarget } = WriteTarget;
        return [TargetAny, TargetExisting, TargetThenProxy, ProxyThenTarget].
            includes(this);
    },
    get isAnyAny() {
        const { None, ProxyExisting, TargetExisting } = WriteTarget;
        return ![None, ProxyExisting, TargetExisting].includes(this);
    },
    get isAnyExisting() {
        const { ProxyExisting, TargetExisting } = WriteTarget;
        return [ProxyExisting, TargetExisting].includes(this);
    }
});
export const ConflictResolution = emitEnum('ConflictResolution', ['ProxyValue', 'TargetValue']);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW51bXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUVsQyxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUNqQyxhQUFhLEVBQ2I7SUFDRSxDQUFDLE1BQU0sRUFBRSxnREFBZ0QsQ0FBQztJQUMxRCxDQUFDLFVBQVUsRUFBRSxnREFBZ0QsQ0FBQztJQUM5RCxDQUFDLGVBQWUsRUFBRSx3REFBd0QsQ0FBQztJQUMzRSxDQUFDLFdBQVcsRUFBRSxpREFBaUQsQ0FBQztJQUNoRSxDQUFDLGdCQUFnQixFQUFFLDJDQUEyQyxDQUFDO0lBQy9ELENBQUMsaUJBQWlCLEVBQUUsa0RBQWtELENBQUM7SUFDdkUsQ0FBQyxpQkFBaUIsRUFBRSxrREFBa0QsQ0FBQztDQUN4RSxFQUNEO0lBQ0UsSUFBSSxVQUFVO1FBQ1osTUFBTSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxHQUNqRSxXQUFXLENBQUE7UUFDYixPQUFPLENBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFFO1lBQ2xFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ2IsTUFBTSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxHQUNuRSxXQUFXLENBQUE7UUFDYixPQUFPLENBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFFO1lBQ3BFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLEdBQUcsV0FBVyxDQUFBO1FBQzNELE9BQU8sQ0FBQyxDQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2hFLENBQUM7SUFDRCxJQUFJLGFBQWE7UUFDZixNQUFNLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxHQUFHLFdBQVcsQ0FBQTtRQUNyRCxPQUFPLENBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN6RCxDQUFDO0NBQ0YsQ0FDRixDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUN4QyxvQkFBb0IsRUFDcEIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQzlCLENBQUEifQ==