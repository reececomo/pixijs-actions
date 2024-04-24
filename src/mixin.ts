import { _ as Action } from "./Action";
import { ActionTicker } from "./lib/ActionTicker";
import { getSpeed } from "./lib/utils/displayobject";

//
// ----- Global Mixin: -----
//

/**
 * Register the global mixins for PIXI.DisplayObject.
 *
 * @param displayObject A reference to `PIXI.DisplayObject`.
 */
export function registerGlobalMixin(displayObject: any): void {
  const prototype = displayObject.prototype;

  // - Properties:
  prototype.speed = 1.0;
  prototype.isPaused = false;

  // - Methods:
  prototype.run = function (_action: Action, completion?: () => void): void {
    const action = completion ? Action.sequence([_action, Action.run(completion)]) : _action;
    ActionTicker.runAction(undefined, this, action);
  };

  prototype.runWithKey = function (action: Action, key: string): void {
    ActionTicker.runAction(key, this, action);
  };

  prototype.runAsPromise = function (
    action: Action,
    timeoutBufferMs: number = 100
  ): Promise<void> {
    const node = this;
    return new Promise(function (resolve, reject) {
      const timeLimitMs = timeoutBufferMs + (getSpeed(node) * action.duration * 1_000);
      const timeoutCheck = setTimeout(() => reject('Took too long to complete.'), timeLimitMs);
      node.run(action, () => {
        clearTimeout(timeoutCheck);
        resolve();
      });
    });
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
