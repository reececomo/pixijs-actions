import { Action } from "./lib/Action";
import { PixiJSActions as _ } from "./Action";
import { ActionTicker } from "./lib/ActionTicker";

/**
 * Register the mixin for PIXI.Container.
 *
 * @param containerType A reference to `PIXI.Container`.
 */
export function registerPixiJSActionsMixin(containerType: any): void {
  const prototype = containerType.prototype;

  // - Properties:
  prototype.speed = 1.0;
  prototype.isPaused = false;

  // - Methods:
  prototype.run = function (action: Action, completion?: () => void): void {
    return completion
      ? ActionTicker.runAction(undefined, this, _.sequence([action, _.run(completion)]))
      : ActionTicker.runAction(undefined, this, action);
  };

  prototype.runWithKey = function (_0: Action | string, _1: Action | string): void {
    if (typeof _1 === "string") ActionTicker.runAction(_1, this, _0 as Action);
    else ActionTicker.runAction(_0 as string, this, _1);
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
