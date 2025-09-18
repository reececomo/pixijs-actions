import { Action as _ } from './lib/Action';
import { ActionTicker } from './lib/ActionTicker';
import {
  AnimateAction,
  AnimateOptions,
  CustomAction,
  DelayAction,
  FadeAlphaToAction,
  FadeByAction,
  FadeInAction,
  FadeOutAction,
  FollowPathAction,
  GroupAction,
  MoveByAction,
  MoveToAction,
  RepeatAction,
  RepeatForeverAction,
  RotateByAction,
  RotateToAction,
  RunBlockAction,
  RunOnChildAction,
  ScaleByAction,
  ScaleToAction,
  ScaleToSizeAction,
  SequenceAction,
  SetVisibleAction,
  SpeedByAction,
  SpeedToAction,
} from './actions';
import { Timing, type TimingFunction, type TimingKey } from './Timing';
import { ActionSettings } from './lib/ActionSettings';

const DEG_TO_RAD = Math.PI / 180;

type DestroyOptions = Parameters<TargetNode["destroy"]>[0];

/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * Create, configure, and run actions in PixiJS.
 *
 * An action is an animation that is executed by a target node.
 *
 * ### Setup:
 * Bind `Action.tick(deltaTimeMs)` to your renderer/shared ticker to activate actions.
 */
export abstract class PixiJSActions {

  //
  // ----------------- Global Settings: -----------------
  //

  /**
   * Default `timePerFrame` in seconds for `Action.animate(…)`.
   *
   * @default 1/60
   */
  public static get DefaultAnimateTimePerFrame(): TimeInterval {
    return ActionSettings.animateTimePerFrame;
  }
  public static set DefaultAnimateTimePerFrame(value: TimeInterval) {
    ActionSettings.animateTimePerFrame = value;
  }

  /**
   * Default timing mode used for ease-in pacing.
   *
   * Set this to update the default `easeIn()` timing mode.
   *
   * @default Timing.easeInSine
   */
  public static get DefaultTimingEaseIn(): TimingFunction {
    return ActionSettings.timingEaseIn;
  }
  public static set DefaultTimingEaseIn(v: TimingFunction | TimingKey) {
    ActionSettings.timingEaseIn = typeof v === 'string' ? Timing[v] : v;
  }

  /**
   * Default timing mode used for ease-out pacing.
   *
   * Set this to update the default `easeOut()` timing mode.
   *
   * @default Timing.easeOutSine
   */
  public static get DefaultTimingEaseOut(): TimingFunction {
    return ActionSettings.timingEaseOut;
  }
  public static set DefaultTimingEaseOut(v: TimingFunction | TimingKey) {
    ActionSettings.timingEaseOut = typeof v === 'string' ? Timing[v] : v;
  }

  /**
   * Default timing mode used for ease-in, ease-out pacing.
   *
   * Set this to update the default `easeInOut()` timing mode.
   *
   * @default Timing.easeInOutSine
   */
  public static get DefaultTimingEaseInOut(): TimingFunction {
    return ActionSettings.timingEaseInOut;
  }
  public static set DefaultTimingEaseInOut(v: TimingFunction | TimingKey) {
    ActionSettings.timingEaseInOut = typeof v === 'string' ? Timing[v] : v;
  }

  //
  // ----------------- Global Methods: -----------------
  //

  /**
   * Tick all actions forward.
   *
   * @param deltaTimeMs Delta time in milliseconds.
   * @param onErrorHandler Handle action errors.
   */
  public static tick(deltaTimeMs: number, onErrorHandler?: (error: any) => void): void {
    ActionTicker.tickAll(deltaTimeMs, onErrorHandler);
  }

  //
  // ----------------- Chaining Actions: -----------------
  //

  /**
   * Creates an action that runs a collection of actions in parallel.
   *
   * When the action executes, the actions that comprise the group all start immediately and run in
   * parallel. The duration of the group action is the longest duration among the collection of
   * actions. If an action in the group has a duration less than the group’s duration, the action
   * completes, then idles until the group completes the remaining actions. This matters most when
   * creating a repeating action that repeats a group.
   *
   * This action is reversible; it creates a new group action that contains the reverse of each
   * action specified in the group.
   */
  public static group(actions: _[]): _ {
    return new GroupAction(actions);
  }

  /**
   * Creates an action that runs a collection of actions sequentially.
   *
   * When the action executes, the first action in the sequence starts and runs to completion.
   * Subsequent actions in the sequence run in a similar fashion until all of the actions in the
   * sequence have executed. The duration of the sequence action is the sum of the durations of the
   * actions in the sequence.
   *
   * This action is reversible; it creates a new sequence action that reverses the order of the
   * actions. Each action in the reversed sequence is itself reversed. For example, if an action
   * sequence is {1,2,3}, the reversed sequence would be {3R,2R,1R}.
   */
  public static sequence(actions: _[]): _ {
    return new SequenceAction(actions);
  }

  /**
   * Creates an action that repeats another action a specified number of times.
   *
   * When the action executes, the associated action runs to completion and then repeats, until the
   * count is reached.
   *
   * This action is reversible; it creates a new action that is the reverse of the specified action
   * and then repeats it the same number of times.
   */
  public static repeat(action: _, repeats: number): _ {
    return new RepeatAction(action, repeats);
  }

  /**
   * Creates an action that repeats another action forever.
   *
   * When the action executes, the associated action runs to completion and then repeats.
   *
   * This action is reversible; it creates a new action that is the reverse of the specified action
   * and then repeats it forever.
   */
  public static repeatForever(action: _): _ {
    return new RepeatForeverAction(action);
  }

  //
  // ----------------- Delaying Actions: -----------------
  //

  /**
   * Creates an action that idles for a specified period of time.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static waitForDuration(duration: TimeInterval): _ {
    return new DelayAction(duration);
  }

  /**
   * Creates an action that idles for a randomized period of time.
   * The resulting action will wait for averageDuration ± (rangeSize / 2).
   *
   * @param average The average amount of time to wait.
   * @param rangeSize The range of possible values for the duration.
   *
   * @example Action.waitForDurationWithRange(10.0, 5.0) // duration will be 7.5 -> 12.5
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval): _ {
    return new DelayAction(average + (rangeSize * Math.random() - rangeSize * 0.5));
  }

  //
  // ----------------- Linear Path Actions: -----------------
  //

  /**
   * Creates an action that moves a node relative to its current position.
   *
   * This action is reversible.
   */
  public static moveBy(delta: VectorLike, duration: TimeInterval): _;
  public static moveBy(dx: number, dy: number, duration: TimeInterval): _;
  public static moveBy(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): _ {
    return typeof a === 'number'
      ? new MoveByAction(a, b, c)
      : new MoveByAction(a.x, a.y, b);
  }

  /**
   * Creates an action that moves a node horizontally relative to its current position.
   *
   * This action is reversible.
   */
  public static moveByX(x: number, duration: TimeInterval): _ {
    return this.moveBy(x, 0, duration);
  }

  /**
   * Creates an action that moves a node vertically relative to its current position.
   *
   * This action is reversible.
   */
  public static moveByY(y: number, duration: TimeInterval): _ {
    return this.moveBy(0, y, duration);
  }

  /**
   * Creates an action that moves a node to a new position.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static moveTo(position: VectorLike, duration: TimeInterval): _;
  public static moveTo(x: number, y: number, duration: TimeInterval): _;
  public static moveTo(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): _ {
    return typeof a === 'number'
      ? new MoveToAction(a, b, c)
      : new MoveToAction(a.x, a.y, b);
  }

  /**
   * Creates an action that moves a node horizontally.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static moveToX(x: number, duration: TimeInterval): _ {
    return new MoveToAction(x, null, duration);
  }

  /**
   * Creates an action that moves a node vertically.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static moveToY(y: number, duration: TimeInterval): _ {
    return new MoveToAction(null, y, duration);
  }

  //
  // ----------------- Custom Path Actions: -----------------
  //

  /**
   * Creates an action that moves the node along a path, optionally orienting the node to the path.
   *
   * This action is reversible; the resulting action creates a reversed path and then follows it,
   * with the same duration.
   *
   * @param path A path to follow, or an object containing an array of points called `points`.
   * @param duration The duration of the animation.
   * @param asOffset (Default: true) When true, the path is relative to the node's current position.
   * @param orientToPath (Default: true) When true, the node’s rotation turns to follow the path.
   * @param fixedSpeed (Default: true) When true, the node's speed is consistent for each segment.
   */
  public static follow(
    path: PathObjectLike | VectorLike[],
    duration: number,
    asOffset: boolean = true,
    orientToPath: boolean = true,
    fixedSpeed: boolean = true,
  ): _ {
    const _path = FollowPathAction.getPath(path);
    return new FollowPathAction(_path, duration, asOffset, orientToPath, fixedSpeed);
  }

  /**
   * Creates an action that moves the node along a path at a specified speed, optionally orienting
   * the node to the path.
   *
   * This action is reversible; the resulting action creates a reversed path and then follows it,
   * with the same speed.
   *
   * @param path A path to follow.
   * @param speed The velocity at which the node should move, in world units per second.
   * @param asOffset (Default: true) When true, the path is relative to the node's current position.
   * @param orientToPath (Default: true) When true, the node’s rotation turns to follow the path.
   */
  public static followAtSpeed(
    path: PathObjectLike | VectorLike[],
    speed: number,
    asOffset: boolean = true,
    orientToPath: boolean = true,
  ): _ {
    const _path = FollowPathAction.getPath(path);
    const _length = FollowPathAction.getLength(_path);
    return new FollowPathAction(_path, _length[0] / speed, asOffset, orientToPath, true);
  }

  //
  // ----------------- Rotation Actions: -----------------
  //

  /**
   * Creates an action that rotates the node by a relative value (in radians).
   *
   * This action is reversible.
   */
  public static rotateBy(rotation: number, duration: TimeInterval): _ {
    return new RotateByAction(rotation, duration);
  }

  /**
   * Creates an action that rotates the node by a relative value (in degrees).
   *
   * This action is reversible.
   */
  public static rotateByDegrees(degrees: number, duration: TimeInterval): _ {
    return this.rotateBy(degrees * DEG_TO_RAD, duration);
  }

  /**
   * Creates an action that rotates the node to an absolute value (in radians).
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static rotateTo(rotation: number, duration: TimeInterval): _ {
    return new RotateToAction(rotation, duration);
  }

  /**
   * Creates an action that rotates the node to an absolute value (in degrees).
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static rotateToDegrees(degrees: number, duration: TimeInterval): _ {
    return this.rotateTo(degrees * DEG_TO_RAD, duration);
  }

  //
  // ----------------- Speed Actions: -----------------
  //

  /**
   * Creates an action that changes how fast the node executes actions by a relative value.
   *
   * This action is reversible.
   */
  public static speedBy(speed: number, duration: TimeInterval): _ {
    return new SpeedByAction(speed, duration);
  }

  /**
   * Creates an action that changes how fast the node executes actions.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static speedTo(speed: number, duration: TimeInterval): _ {
    return new SpeedToAction(speed, duration);
  }

  //
  // ----------------- Scale Actions: -----------------
  //

  /**
   * Creates an action that changes the scale of a node by a relative value.
   *
   * This action is reversible.
   */
  public static scaleBy(scale: number, duration: TimeInterval): _;
  public static scaleBy(size: VectorLike, duration: TimeInterval): _;
  public static scaleBy(dx: number, dy: number, duration: TimeInterval): _;
  public static scaleBy(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): _ {
    return typeof a === 'number'
      ? c == null
        ? new ScaleByAction(a, a, b)
        : new ScaleByAction(a, b, c)
      : new ScaleByAction(a.x, a.y, b);
  }

  /**
   * Creates an action that changes the x scale of a node by a relative value.
   *
   * This action is reversible.
   */
  public static scaleByX(x: number, duration: TimeInterval): _ {
    return this.scaleBy(x, 1, duration);
  }

  /**
   * Creates an action that changes the y scale of a node by a relative value.
   *
   * This action is reversible.
   */
  public static scaleByY(y: number, duration: TimeInterval): _ {
    return this.scaleBy(1, y, duration);
  }

  /**
   * Creates an action that changes the x and y scale values of a node.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static scaleTo(scale: number, duration: TimeInterval): _;
  public static scaleTo(size: SizeLike, duration: TimeInterval): _;
  public static scaleTo(x: number, y: number, duration: TimeInterval): _;
  public static scaleTo(a: number | SizeLike, b: number | TimeInterval, c?: TimeInterval): _ {
    return typeof a === 'number'
      ? c == null
        ? new ScaleToAction(a, a, b)
        : new ScaleToAction(a, b, c)
      : new ScaleToSizeAction(a.width, a.height, b);
  }

  /**
   * Creates an action that changes the y scale values of a node.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static scaleToX(x: number, duration: TimeInterval): _ {
    return new ScaleToAction(x, null, duration);
  }

  /**
   * Creates an action that changes the x scale values of a node.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static scaleToY(y: number, duration: TimeInterval): _ {
    return new ScaleToAction(null, y, duration);
  }

  //
  // ----------------- Transparency Actions: -----------------
  //

  /**
   * Creates an action that changes the alpha value of the node to 1.0.
   *
   * This action is reversible. The reverse is equivalent to fadeOut(duration).
   */
  public static fadeIn(duration: TimeInterval): _ {
    return new FadeInAction(duration);
  }

  /**
   * Creates an action that changes the alpha value of the node to 0.0.
   *
   * This action is reversible. The reverse is equivalent to fadeIn(duration).
   */
  public static fadeOut(duration: TimeInterval): _ {
    return new FadeOutAction(duration);
  }

  /**
   * Creates an action that adjusts the alpha value of a node to a new value.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static fadeAlphaTo(alpha: number, duration: TimeInterval): _ {
    return new FadeAlphaToAction(alpha, duration);
  }

  /**
   * Creates an action that adjusts the alpha value of a node by a relative value.
   *
   * This action is reversible.
   */
  public static fadeAlphaBy(alpha: number, duration: TimeInterval): _ {
    return new FadeByAction(alpha, duration);
  }

  //
  // ----------------- Sprite Actions: -----------------
  //

  /**
   * Creates an action that animates changes to a sprite’s texture.
   *
   * Note: Target must be a Sprite.
   *
   * This action is reversible.
   */
  public static animate(options: AnimateOptions): _ {
    return new AnimateAction(options);
  }

  //
  // ----------------- Container Actions: -----------------
  //

  /**
   * Creates an action that hides a node.
   *
   * This action has an instantaneous duration. When the action executes, the node’s visible
   * property is set to true.
   *
   * This action is reversible. The reversed action is equivalent to show().
   */
  public static hide(): _ {
    return new SetVisibleAction(false);
  }

  /**
   * Creates an action that makes a node visible.
   *
   * This action has an instantaneous duration. When the action executes, the node’s visible
   * property is set to false.
   *
   * This action is reversible. The reversed action is equivalent to hide().
   */
  public static unhide(): _ {
    return new SetVisibleAction(true);
  }

  /**
   * Creates an action that removes all internal references, listeners and actions,
   * as well as removes children from the display list.
   *
   * This action has an instantaneous duration.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static destroy(options?: DestroyOptions): _ {
    return this.run(target => target.destroy(options));
  }

  /**
   * Creates an action that removes the node from its parent.
   *
   * This action has an instantaneous duration.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static removeFromParent(): _ {
    return this.run(target => target.parent?.removeChild(target));
  }

  //
  // ----------------- Children Actions: -----------------
  //

  /**
   * Creates an action that runs an action on a named child object.
   *
   * This action has an instantaneous duration, although the action executed on the child may have
   * a duration of its own. When the action executes, it looks up an appropriate child node and
   * calls its `run(action)` method, passing in the action to execute.
   *
   * This action is reversible; it tells the child to execute the reverse of the action specified by
   * the action parameter.
   */
  public static runOnChild(childLabel: string, action: _): _ {
    return new RunOnChildAction(action, childLabel);
  }

  //
  // ----------------- Custom Actions: -----------------
  //

  /**
   * Creates an action that executes a block.
   *
   * This action takes place instantaneously.
   *
   * This action is not reversible; the reverse action executes the same block function.
   */
  public static run(blockFn: (target: TargetNode) => void): _ {
    return new RunBlockAction(blockFn);
  }

  /**
   * Creates an action that executes a stepping function over its duration.
   *
   * The function will be triggered on every redraw until the action completes, and is passed
   * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
   * mode function).
   *
   * This action is not reversible; the reverse action executes the same stepping function.
   */
  public static custom(
    duration: number,
    stepFn: (target: TargetNode, t: number, dt: number) => void
  ): _ {
    return new CustomAction(duration, stepFn);
  }
}
