import { _ as Action } from "./Action";
import { ActionTicker } from "./lib/ActionTicker";

/**
 * Register the mixin for PIXI.Container.
 *
 * @param container A reference to `PIXI.Container`.
 */
export function registerPixiJSActionsMixin(container: any): void {
  const prototype = container.prototype;

  // - Properties:
  prototype.speed = 1.0;
  prototype.isPaused = false;

  // - Methods:
  prototype.run = function (action: Action, completion?: () => void): void {
    return completion
      ? ActionTicker.runAction(undefined, this, Action.sequence([action, Action.run(completion)]))
      : ActionTicker.runAction(undefined, this, action);
  };

  prototype.runWithKey = function (action: Action, key: string): void {
    ActionTicker.runAction(key, this, action);
  };

  prototype.runAsPromise = function (action: Action): Promise<void> {
    return new Promise(resolve => this.run(action, () => resolve()));
  };

  prototype.action = function (forKey: string): Action | undefined {
    return ActionTicker.getTargetActionForKey(this, forKey);
  };

  prototype.hasActions = function (): boolean {
    return ActionTicker.hasTargetActions(this);
  };

  prototype.removeAllActions = function (): void {
    ActionTicker.removeAllTargetActions(this);
  };

  prototype.removeAction = function (forKey: string): void {
    ActionTicker.removeTargetActionForKey(this, forKey);
  };
}
