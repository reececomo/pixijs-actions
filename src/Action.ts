import * as PIXI from 'pixi.js';

import { TimingMode, TimingModeFn } from './TimingMode';
import { getIsPaused, getSpeed } from './util';

const EPSILON = 0.0000000001;
const EPSILON_ONE = 1 - EPSILON;
const DEG_TO_RAD = Math.PI / 180;
const HALF_PI = Math.PI / 2;

/** Time measured in seconds. */
type TimeInterval = number;

/** Targeted display node. */
type TargetNode = PIXI.DisplayObject;

/** Any two dimensional vector. */
interface VectorLike {
  x: number;
  y: number;
}

/** Any object containing an array of points. */
interface PathLike {
  points: VectorLike[];
}

//
// ----- Action: -----
//

/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently
 * (i.e. UI and Game World).
 */
export abstract class Action {

  //
  // ----------------- Global Settings: -----------------
  //

  /** All currently running actions. */
  protected static readonly _actions: Action[] = [];

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
  public static group(actions: Action[]): Action {
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
  public static sequence(actions: Action[]): Action {
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
  public static repeat(action: Action, repeats: number): Action {
    const length = Math.max(0, Math.round(repeats));
    return Action.sequence(Array.from({ length }, () => action));
  }

  /**
   * Creates an action that repeats another action forever.
   *
   * When the action executes, the associated action runs to completion and then repeats.
   *
   * This action is reversible; it creates a new action that is the reverse of the specified action
   * and then repeats it forever.
   */
  public static repeatForever(action: Action): Action {
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
  public static waitForDuration(duration: TimeInterval): Action {
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
  public static waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval): Action {
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
  public static moveBy(x: number, y: number, duration: TimeInterval): Action {
    return new MoveByAction(x, y, duration);
  }

  /**
   * Creates an action that moves a node relative to its current position.
   *
   * This action is reversible.
   */
  public static moveByVector(vec: VectorLike, duration: TimeInterval): Action {
    return Action.moveBy(vec.x, vec.y, duration);
  }

  /**
   * Creates an action that moves a node horizontally relative to its current position.
   *
   * This action is reversible.
   */
  public static moveByX(x: number, duration: TimeInterval): Action {
    return Action.moveBy(x, 0, duration);
  }

  /**
   * Creates an action that moves a node vertically relative to its current position.
   *
   * This action is reversible.
   */
  public static moveByY(y: number, duration: TimeInterval): Action {
    return Action.moveBy(0, y, duration);
  }

  /**
   * Creates an action that moves a node to a new position.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * move the node.
   */
  public static moveTo(x: number, y: number, duration: TimeInterval): Action {
    return new MoveToAction(x, y, duration);
  }

  /**
   * Creates an action that moves a node to a new position.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * move the node.
   */
  public static moveToPoint(point: VectorLike, duration: TimeInterval): Action {
    return Action.moveTo(point.x, point.y, duration);
  }

  /**
   * Creates an action that moves a node horizontally.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * move the node.
   */
  public static moveToX(x: number, duration: TimeInterval): Action {
    return new MoveToAction(x, undefined, duration);
  }

  /**
   * Creates an action that moves a node vertically.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * move the node.
   */
  public static moveToY(y: number, duration: TimeInterval): Action {
    return new MoveToAction(undefined, y, duration);
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
   * @param asOffset When true, the path is relative to the node's current position.
   * @param orientToPath When true, the node’s rotation turns to follow the path.
   * @param fixedSpeed When true, the node's speed is consistent across different length segments.
   */
  public static followPath(
    path: VectorLike[] | PathLike,
    duration: number,
    asOffset: boolean = true,
    orientToPath: boolean = true,
    fixedSpeed: boolean = true,
  ): Action {
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
   * @param speed The velocity at which the node should move in world units per second.
   * @param asOffset When true, the path is relative to the node's current position.
   * @param orientToPath If true, the node’s rotation turns to follow the path.
   */
  public static followPathAtSpeed(
    path: VectorLike[] | PathLike,
    speed: number,
    asOffset: boolean = true,
    orientToPath: boolean = true,
  ): Action {
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
  public static rotateBy(rotation: number, duration: TimeInterval): Action {
    return new RotateByAction(rotation, duration);
  }

  /**
   * Creates an action that rotates the node by a relative value (in degrees).
   *
   * This action is reversible.
   */
  public static rotateByDegrees(degrees: number, duration: TimeInterval): Action {
    return Action.rotateBy(degrees * DEG_TO_RAD, duration);
  }

  /**
   * Creates an action that rotates the node to an absolute value (in radians).
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static rotateTo(rotation: number, duration: TimeInterval): Action {
    return new RotateToAction(rotation, duration);
  }

  /**
   * Creates an action that rotates the node to an absolute value (in degrees).
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static rotateToDegrees(degrees: number, duration: TimeInterval): Action {
    return Action.rotateTo(degrees * DEG_TO_RAD, duration);
  }


  //
  // ----------------- Speed Actions: -----------------
  //

  /**
   * Creates an action that changes how fast the node executes actions by a relative value.
   *
   * This action is reversible.
   */
  public static speedBy(speed: number, duration: TimeInterval): Action {
    return new SpeedByAction(speed, duration);
  }

  /**
   * Creates an action that changes how fast the node executes actions.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static speedTo(speed: number, duration: TimeInterval): Action {
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
  public static scaleBy(value: number, duration: TimeInterval): Action;
  public static scaleBy(x: number, y: number, duration: TimeInterval): Action;
  public static scaleBy(x: number, y: number | TimeInterval, duration?: TimeInterval): Action {
    return duration === undefined
      ? new ScaleByAction(x, x, y)
      : new ScaleByAction(x, y, duration);
  }

  /**
   * Creates an action that changes the x and y scale values of a node by a relative value.
   *
   * This action is reversible.
   */
  public static scaleByVector(vector: VectorLike, duration: TimeInterval): Action {
    return Action.scaleBy(vector.x, vector.y, duration);
  }

  /**
   * Creates an action that changes the x scale of a node by a relative value.
   *
   * This action is reversible.
   */
  public static scaleXBy(x: number, duration: TimeInterval): Action {
    return Action.scaleBy(x, 0.0, duration);
  }

  /**
   * Creates an action that changes the y scale of a node by a relative value.
   *
   * This action is reversible.
   */
  public static scaleYBy(y: number, duration: TimeInterval): Action {
    return Action.scaleBy(0.0, y, duration);
  }

  /**
   * Creates an action that changes the x and y scale values of a node.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static scaleTo(value: number, duration: TimeInterval): Action;
  public static scaleTo(x: number, y: number, duration: TimeInterval): Action;
  public static scaleTo(x: number, y: number | TimeInterval, duration?: TimeInterval): Action {
    return duration === undefined
      ? new ScaleToAction(x, x, y)
      : new ScaleToAction(x, y, duration);
  }

  /**
   * Creates an action that changes the x and y scale values of a node.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static scaleToSize(size: VectorLike, duration: TimeInterval): Action {
    return Action.scaleTo(size.x, size.y, duration);
  }

  /**
   * Creates an action that changes the y scale values of a node.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static scaleXTo(x: number, duration: TimeInterval): Action {
    return new ScaleToAction(x, undefined, duration);
  }

  /**
   * Creates an action that changes the x scale values of a node.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static scaleYTo(y: number, duration: TimeInterval): Action {
    return new ScaleToAction(undefined, y, duration);
  }

  //
  // ----------------- Transparency Actions: -----------------
  //

  /**
   * Creates an action that changes the alpha value of the node to 1.0.
   *
   * This action is reversible. The reverse is equivalent to fadeOut(duration).
   */
  public static fadeIn(duration: TimeInterval): Action {
    return new FadeInAction(duration);
  }

  /**
   * Creates an action that changes the alpha value of the node to 0.0.
   *
   * This action is reversible. The reverse is equivalent to fadeIn(duration).
   */
  public static fadeOut(duration: TimeInterval): Action {
    return new FadeOutAction(duration);
  }

  /**
   * Creates an action that adjusts the alpha value of a node to a new value.
   *
   * This action is not reversible; the reverse of this action has the same duration but does not
   * change anything.
   */
  public static fadeAlphaTo(alpha: number, duration: TimeInterval): Action {
    return new FadeToAction(alpha, duration);
  }

  /**
   * Creates an action that adjusts the alpha value of a node by a relative value.
   *
   * This action is reversible.
   */
  public static fadeAlphaBy(alpha: number, duration: TimeInterval): Action {
    return new FadeByAction(alpha, duration);
  }

  //
  // ----------------- Display Object Actions: -----------------
  //

  /**
   * Creates an action that hides a node.
   *
   * This action has an instantaneous duration. When the action executes, the node’s visible
   * property is set to true.
   *
   * This action is reversible. The reversed action is equivalent to show().
   */
  public static hide(): Action {
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
  public static unhide(): Action {
    return new SetVisibleAction(true);
  }

  /**
   * Creates an action that removes the node from its parent.
   *
   * This action has an instantaneous duration.
   *
   * This action is not reversible; the reverse of this action is the same action.
   */
  public static removeFromParent(): Action {
    return new RemoveFromParentAction();
  }

  //
  // ----------------- Transparency Actions: -----------------
  //

  /**
   * Creates an action that executes a block.
   *
   * This action takes place instantaneously.
   *
   * This action is not reversible; the reverse action executes the same block.
   */
  public static run(fn: () => void): Action {
    return new RunBlockAction(fn);
  }

  /**
   * Creates an action that executes a stepping function over its duration.
   *
   * The function will be triggered on every redraw until the action completes, and is passed
   * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
   * mode function).
   *
   * This action is not reversible; the reverse action executes the same block.
   */
  public static customAction(duration: number, stepFn: (target: TargetNode, x: number) => void): Action {
    return new CustomAction(duration, stepFn);
  }

  //
  // ----------------- Global Methods: -----------------
  //

  /**
   * Tick all actions forward.
   *
   * @param deltaTimeMs Delta time in milliseconds.
   * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
   * @param onErrorHandler (Optional) Handler errors from each action's tick.
   */
  public static tick(deltaTimeMs: number, categoryMask: number | undefined = undefined, onErrorHandler?: (error: any) => void): void {
    ActionTicker.stepAllActionsForward(deltaTimeMs, categoryMask, onErrorHandler);
  }

  public constructor(
    public readonly duration: TimeInterval,
    public speed: number = 1.0,
    public timingMode: TimingModeFn = TimingMode.linear,
    public categoryMask: number = 0x1,
  ) {}

  //
  // ----------------- Action Instance Methods: -----------------
  //

  /**
   * Update function for the action.
   *
   * @param target The affected display object.
   * @param progress The elapsed progress of the action, with the timing mode function applied. Generally a scalar number between 0.0 and 1.0.
   * @param progressDelta Relative change in progress since the previous animation change. Use this for relative actions.
   * @param actionTicker The actual ticker running this update.
   * @param deltaTime The amount of time elapsed in this tick. This number is scaled by both speed of target and any parent actions.
   */
  public abstract updateAction(
    target: TargetNode,
    progress: number,
    progressDelta: number,
    actionTicker: ActionTicker,
    deltaTime: number
  ): void;

  /** Duration of the action after the speed scalar is applied. */
  public get scaledDuration(): number {
    return this.duration / this.speed;
  }

  /**
   * Creates an action that reverses the behavior of another action.
   *
   * This method always returns an action object; however, not all actions are reversible.
   * When reversed, some actions return an object that either does nothing or that performs the same action as the original action.
   */
  public abstract reversed(): Action;

  /**
   * Do first time setup here.
   *
   * Anything you return here will be available as `ticker.data`.
   */
  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return undefined;
  }

  /** Set the action's speed scale. Defaults to 1.0. */
  public setSpeed(speed: number): this {
    this.speed = speed;
    return this;
  }

  /** Set a timing mode function for this action. Defaults to TimingMode.linear. */
  public setTimingMode(timingMode: TimingModeFn): this {
    this.timingMode = timingMode;
    return this;
  }

  /**
   * Set a category mask for this action.
   *
   * Use this to tick different categories of actions separately (e.g. separate different UI).
   *
   * @deprecated use speed instead
   */
  public setCategory(categoryMask: number): this {
    this.categoryMask = categoryMask;
    return this;
  }
}

//
// ----------------- Built-in Actions: -----------------
//

class GroupAction extends Action {
  protected index: number = 0;
  protected actions: Action[];

  public constructor(actions: Action[]) {
    super(
      // Max duration:
      Math.max(...actions.map(action => action.scaledDuration))
    );

    this.actions = actions;
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    ticker.autoComplete = false;

    return {
      childTickers: this.actions.map(action => new ActionTicker(undefined, target, action))
    };
  }

  public updateAction(
    target: TargetNode,
    progress: number,
    progressDelta: number,
    ticker: ActionTicker,
    timeDelta: number,
  ): void {
    const relativeTimeDelta = timeDelta * this.speed;

    let allDone = true;
    for (const childTicker of ticker.data.childTickers as ActionTicker[]) {
      if (!childTicker.isDone) {
        allDone = false;
        childTicker.stepActionForward(relativeTimeDelta);
      }
    }

    if (allDone) {
      ticker.isDone = true;
    }
  }

  public reversed(): Action {
    return new GroupAction(this.actions.map(action => action.reversed()));
  }
}

class SequenceAction extends Action {
  protected actions: Action[];

  public constructor(actions: Action[]) {
    super(
      // Total duration:
      actions.reduce((total, action) => total + action.scaledDuration, 0)
    );
    this.actions = actions;
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    ticker.autoComplete = false;

    return {
      childTickers: this.actions.map(action => new ActionTicker(undefined, target, action))
    };
  }

  public updateAction(
    target: TargetNode,
    progress: number,
    progressDelta: number,
    ticker: ActionTicker,
    timeDelta: number,
  ): void {
    let allDone = true;
    let remainingTimeDelta = timeDelta * this.speed;

    for (const childTicker of ticker.data.childTickers as ActionTicker[]) {
      if (!childTicker.isDone) {

        if (remainingTimeDelta > 0 || childTicker.duration === 0) {
          remainingTimeDelta = childTicker.stepActionForward(remainingTimeDelta);
        }
        else {
          allDone = false;
          break;
        }

        if (remainingTimeDelta < 0) {
          allDone = false;
          break;
        }
      }
    }

    if (allDone) {
      ticker.isDone = true;
    }
  }

  public reversed(): Action {
    const reversedSequence = [...this.actions].reverse().map(action => action.reversed());
    return new SequenceAction(reversedSequence);
  }
}

class RepeatForeverAction extends Action {
  public constructor(
    protected readonly action: Action
  ) {
    super(Infinity);

    if (action.duration <= 0) {
      throw new Error('The action to be repeated must have a non-instantaneous duration.');
    }
  }

  public reversed(): Action {
    return new RepeatForeverAction(this.action.reversed());
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return {
      childTicker: new ActionTicker(undefined, target, this.action)
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker, timeDelta: number): void {
    let childTicker: ActionTicker = ticker.data.childTicker;
    let remainingTimeDelta = timeDelta * this.speed;

    remainingTimeDelta = childTicker.stepActionForward(remainingTimeDelta);

    if (remainingTimeDelta > 0) {
      childTicker.elapsed = 0.0; // reset
      childTicker.stepActionForward(remainingTimeDelta);
    }
  }
}

class ScaleToAction extends Action {
  public constructor(
    protected readonly x: number | undefined,
    protected readonly y: number | undefined,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return {
      startX: target.scale.x,
      startY: target.scale.y
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.scale.set(
      this.x === undefined ? target.scale.x : ticker.data.startX + (this.x - ticker.data.startX) * progress,
      this.y === undefined ? target.scale.y : ticker.data.startY + (this.y - ticker.data.startY) * progress
    );
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}

class ScaleByAction extends Action {
  public constructor(
    protected readonly x: number,
    protected readonly y: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return {
      dx: target.scale.x * this.x - target.scale.x,
      dy: target.scale.y * this.y - target.scale.y
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.scale.set(
      target.scale.x + ticker.data.dx * progressDelta,
      target.scale.y + ticker.data.dy * progressDelta,
    );
  }

  public reversed(): Action {
    return new ScaleByAction(-this.x, -this.y, this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}

class SetVisibleAction extends Action {
  public constructor(
    protected readonly visible: boolean,
  ) {
    super(0);
  }

  public updateAction(target: TargetNode): void {
    target.visible = this.visible;
  }

  public reversed(): Action {
    return new SetVisibleAction(!this.visible);
  }
}

class RemoveFromParentAction extends Action {
  public constructor() {
    super(0);
  }

  public updateAction(target: TargetNode): void {
    target.parent?.removeChild(target);
  }

  public reversed(): Action {
    return this;
  }
}

class CustomAction extends Action {
  public constructor(
    duration: TimeInterval,
    protected stepFn: (target: TargetNode, t: number, dt: number) => void
  ) {
    super(duration);
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number): void {
    this.stepFn(target, progress, progressDelta);
  }

  public reversed(): Action {
    return this;
  }
}

class RunBlockAction extends Action {
  protected block: () => any;

  public constructor(block: () => void) {
    super(0);
    this.block = block;
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number): void {
    this.block();
  }

  public reversed(): Action {
    return this;
  }
}

class SpeedToAction extends Action {
  public constructor(
    protected readonly _speed: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return {
      startSpeed: target.speed
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.rotation = ticker.data.startRotation + (this._speed - ticker.data.startSpeed) * progress;
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}

class SpeedByAction extends Action {
  public constructor(
    protected readonly _speed: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.rotation += this._speed * progressDelta;
  }

  public reversed(): Action {
    return new SpeedByAction(-this._speed, this.duration);
  }
}

class FollowPathAction extends Action {
  protected readonly path: VectorLike[];
  protected readonly lastIndex: number;
  protected readonly segmentLengths!: number[];
  protected readonly segmentWeights!: number[];

  public constructor(
    path: VectorLike[],
    duration: number,
		protected readonly asOffset: boolean,
		protected readonly orientToPath: boolean,
    protected readonly fixedSpeed: boolean,
  ) {
    super(duration);
    this.path = path;
    this.lastIndex = path.length - 1;

    // Precalculate segment lengths, if needed.
    if (orientToPath || fixedSpeed) {
      const [totalDist, segmentLengths] = FollowPathAction.getLength(path);
      this.segmentLengths = segmentLengths;
      if (fixedSpeed) {
        this.segmentWeights = segmentLengths.map(v => v / (totalDist || 1));
      }
    }
  }

  // ----- Static helpers: -----

  public static getPath(path: VectorLike[] | { points: VectorLike[] }): VectorLike[] {
    return Array.isArray(path) ? [...path] : [...path.points];
  }

  public static getLength(path: VectorLike[]): [length: number, segmentLengths: number[]] {
    let totalLength = 0;
    const segmentLengths: number[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const directionX = path[i + 1]!.x - path[i]!.x;
      const directionY = path[i + 1]!.y - path[i]!.y;
      const length = Math.sqrt(directionX * directionX + directionY * directionY);

      segmentLengths.push(length);
      totalLength += length;
    }

    return [totalLength, segmentLengths];
  }

  // ----- Methods: -----

  public updateAction(target: any, progress: number, progressDelta: number, ticker: any): void {
    if (this.lastIndex < 0) {
      return; // Empty path.
    }

    const [index, t] = this.fixedSpeed
      ? this._getFixedSpeedProgress(progress)
      : this._getDynamicSpeedProgress(progress);

    const startPoint = this.path[index]!;
    const endPoint = this.path[index + 1] ?? startPoint;

    target.position.set(
      ticker.data.x + startPoint.x + (endPoint.x - startPoint.x) * t,
      ticker.data.y + startPoint.y + (endPoint.y - startPoint.y) * t
    );

    if (this.orientToPath) {
      const length = this.segmentLengths[index]! || 1;
      const ndx = (endPoint.x - startPoint.x) / length;
      const ndy = (endPoint.y - startPoint.y) / length;
      const rotation = HALF_PI + Math.atan2(ndy, ndx);

      target.rotation = rotation;
    }
  }

  public reversed(): Action {
    return new FollowPathAction(
      this._reversePath(),
      this.duration,
      this.asOffset,
      this.orientToPath,
      this.fixedSpeed,
    )
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected _setupTicker(target: any): any {
    return {
      x: this.asOffset ? target.x : 0,
      y: this.asOffset ? target.y : 0,
    };
  }

  protected _reversePath(): VectorLike[] {
    if (this.asOffset && this.path.length > 0) {
      // Calculate the relative delta offset when first and last are flipped.
      const first = this.path[0]!, last = this.path[this.path.length - 1]!;
      const dx = last.x + first.x, dy = last.y + first.y;

      return this.path.map(({x, y}) => ({ x: x - dx, y: y - dy })).reverse();
    }

    // Absolute path is the path backwards.
    return [...this.path].reverse();
  }

  protected _getDynamicSpeedProgress(progress: number): [index: number, t: number] {
    const index = Math.max(Math.min(Math.floor(progress * this.lastIndex), this.lastIndex - 1), 0);
    const lastIndexNonZero = this.lastIndex || 1;
    const t = (progress - index / lastIndexNonZero) * lastIndexNonZero;

    return [index, t];
  }

  protected _getFixedSpeedProgress(progress: number): [index: number, t: number] {
    let remainingProgress = progress;
    let index = 0;
    let t = 0;

    for (let i = 0; i < this.lastIndex; i++) {
      const segmentWeight = this.segmentWeights[i]!;

      if (segmentWeight! > remainingProgress || i === this.lastIndex - 1) {
        t = remainingProgress / segmentWeight || 1;
        break;
      }

      remainingProgress -= segmentWeight;
      index++;
    }

    return [index, t];
  }
}

class RotateToAction extends Action {
  public constructor(
    protected readonly rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return {
      startRotation: target.rotation
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.rotation = ticker.data.startRotation + (this.rotation - ticker.data.startRotation) * progress;
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}

class RotateByAction extends Action {
  public constructor(
    protected readonly rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number): void {
    target.rotation += this.rotation * progressDelta;
  }

  public reversed(): Action {
    return new RotateByAction(-this.rotation, this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}

class MoveToAction extends Action {
  public constructor(
    protected readonly x: number | undefined,
    protected readonly y: number | undefined,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  protected _setupTicker(target: TargetNode, ticker: ActionTicker): any {
    return {
      startX: target.x,
      startY: target.y
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.position.set(
      this.x === undefined ? target.position.x : ticker.data.startX + (this.x - ticker.data.startX) * progress,
      this.y === undefined ? target.position.y : ticker.data.startY + (this.y - ticker.data.startY) * progress
    );
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}

class MoveByAction extends Action {
  public constructor(
    protected readonly x: number,
    protected readonly y: number,
    duration: number,
  ) {
    super(duration);
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number): void {
    target.position.x += this.x * progressDelta;
    target.position.y += this.y * progressDelta;
  }

  public reversed(): Action {
    return new MoveByAction(-this.x, -this.y, this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}

class FadeToAction extends Action {
  public constructor(
    protected readonly alpha: number,
    duration: TimeInterval
  ) {
    super(duration);
  }

  protected _setupTicker(target: PIXI.DisplayObject, ticker: ActionTicker): any {
    return {
      startAlpha: target.alpha
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.alpha = ticker.data.startAlpha + (this.alpha - ticker.data.startAlpha) * progress;
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}

class FadeInAction extends Action {
  protected _setupTicker(target: PIXI.DisplayObject, ticker: ActionTicker): any {
    return {
      startAlpha: target.alpha
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.alpha = ticker.data.startAlpha + (1.0 - ticker.data.startAlpha) * progress;
  }

  public reversed(): Action {
    return new FadeOutAction(this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}

class FadeOutAction extends Action {
  protected _setupTicker(target: PIXI.DisplayObject, ticker: ActionTicker): any {
    return {
      startAlpha: target.alpha
    };
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number, ticker: ActionTicker): void {
    target.alpha = ticker.data.startAlpha + (0.0 - ticker.data.startAlpha) * progress;
  }

  public reversed(): Action {
    return new FadeInAction(this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}

class FadeByAction extends Action {
  public constructor(
    protected readonly alpha: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public updateAction(target: TargetNode, progress: number, progressDelta: number): void {
    target.alpha += this.alpha * progressDelta;
  }

  public reversed(): Action {
    return new FadeByAction(-this.alpha, this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}

class DelayAction extends Action {
  public updateAction(): void {
    // Idle
  }

  public reversed(): Action {
    return this;
  }
}

//
// ----- Action Ticker: -----
//

class ActionTicker {
  protected static _running: ActionTicker[] = [];

  public static runAction(
    key: string | undefined,
    target: TargetNode,
    action: Action,
  ): void {
    if (key !== undefined) {
      const existingAction = this._running
        .find(a => a.target === target && a.key === key);

      if (existingAction !== undefined) {
        ActionTicker.removeAction(existingAction);
      }
    }

    this._running.push(new ActionTicker(key, target, action));
  }

  public static removeAction(actionTicker: ActionTicker): ActionTicker {
    const index = ActionTicker._running.indexOf(actionTicker);
    if (index >= 0) {
      ActionTicker._running.splice(index, 1);
    }
    return actionTicker;
  }

  public static hasTargetActions(target: TargetNode): boolean {
    return ActionTicker._running.find(at => at.target === target) !== undefined;
  }

  public static getTargetActionTickerForKey(
    target: TargetNode,
    key: string
  ): ActionTicker | undefined {
    return ActionTicker._running.find(at => at.target === target && at.key === key);
  }

  public static getTargetActionForKey(target: TargetNode, key: string): Action | undefined {
    return this.getTargetActionTickerForKey(target, key)?.action;
  }

  public static removeTargetActionForKey(target: TargetNode, key: string): void {
    const actionTicker = this.getTargetActionTickerForKey(target, key);

    if (!actionTicker) {
      return;
    }

    ActionTicker.removeAction(actionTicker);
  }

  public static removeAllTargetActions(target: TargetNode): void {
    for (let i = ActionTicker._running.length - 1; i >= 0; i--) {
      const actionTicker = ActionTicker._running[i];

      if (actionTicker.target === target) {
        ActionTicker.removeAction(actionTicker);
      }
    }
  }

  /**
   * Tick all actions forward.
   *
   * @param deltaTimeMs Delta time given in milliseconds.
   * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
   * @param onErrorHandler (Optional) Handler errors from each action's tick.
   */
  public static stepAllActionsForward(
    deltaTimeMs: number,
    categoryMask: number | undefined = undefined,
    onErrorHandler?: (error: any) => void
  ): void {
    const deltaTime = deltaTimeMs * 0.001;

    for (let i = ActionTicker._running.length - 1; i >= 0; i--) {
      const actionTicker = ActionTicker._running[i];

      if (categoryMask !== undefined && (categoryMask & actionTicker.action.categoryMask) === 0) {
        continue;
      }

      if (getIsPaused(actionTicker.target)) {
        continue;
      }

      try {
        actionTicker.stepActionForward(deltaTime * getSpeed(actionTicker.target));
      }
      catch (error) {
        // Isolate individual action errors.
        if (onErrorHandler === undefined) {
          console.error('Action failed with error: ', error);
        }
        else {
          onErrorHandler(error);
        }

        // Remove offending ticker.
        ActionTicker.removeAction(actionTicker);
      }
    }
  }

  /** Any instance data that will live for the duration of the ticker. */
  public data: any;

  /** Time elapsed in the action. */
  public elapsed: number = 0.0;

  /** Whether the action ticker has been setup. This is triggered on the first iteration. */
  public isSetup = false;

  /** Whether the action has completed. */
  public isDone: boolean = false;

  /** Whether the action ticker will mark the action as done when time elapsed >= duration. */
  public autoComplete: boolean = true;

  /**
   * Relative speed of the action ticker.
   *
   * Defaults to the action's speed and is capture at creation time, and updated on
   * the setup tick.
   */
  public speed: number;

  /**
   * Expected duration of the action ticker.
   *
   * Defaults to the action's scaled duration and is capture at creation time, and updated on
   * the setup tick.
   */
  public duration: number;

  public constructor(
    public key: string | undefined,
    public target: TargetNode,
    public action: Action,
  ) {
    this.speed = action.speed;
    this.duration = action.scaledDuration;
  }

  /** Whether action is in progress (or has not yet started). */
  public get isPlaying(): boolean {
    return this.isDone === false;
  }

  /** The relative time elapsed between 0 and 1. */
  public get timeDistance(): number {
    return this.duration === 0 ? 1 : Math.min(1, this.elapsed / this.action.scaledDuration);
  }

  /**
   * The relative time elapsed between 0 and 1, eased by the timing mode function.
   *
   * Can be a value beyond 0 or 1 depending on the timing mode function.
   */
  protected get easedTimeDistance(): number {
    return this.action.timingMode(this.timeDistance);
  }

  /** @returns Any unused time delta. Negative value means action is still in progress. */
  public stepActionForward(timeDelta: number): number {
    if (!this.isSetup) {
      this.speed = this.action.speed;
      this.duration = this.action.duration;
      this.data = (this.action as any)._setupTicker(this.target, this);
      this.isSetup = true;
    }

    const target = this.target;
    const action = this.action;

    // If action no longer valid, or target not on the stage
    // we garbage collect its actions.
    if (
      target == null
      || target.destroyed
      || target.parent === undefined
    ) {
      ActionTicker.removeAction(this);

      return;
    }

    const scaledTimeDelta = timeDelta * this.speed /* target speed is applied at the root */;

    if (this.duration === 0) {
      // Instantaneous action.
      action.updateAction(this.target, 1.0, 1.0, this, scaledTimeDelta);
      this.isDone = true;

      // Remove completed action.
      ActionTicker.removeAction(this);

      return timeDelta; // relinquish the full time.
    }

    if (timeDelta === 0) {
      return -1; // Early exit, no progress.
    }

    const beforeProgress = this.easedTimeDistance;
    this.elapsed += scaledTimeDelta;
    const progress = this.easedTimeDistance;
    const progressDelta = progress - beforeProgress;

    action.updateAction(this.target, progress, progressDelta, this, scaledTimeDelta);

    if (this.isDone || (this.autoComplete && this.timeDistance >= EPSILON_ONE)) {
      this.isDone = true;

      // Remove completed action.
      ActionTicker.removeAction(this);

      return this.elapsed > this.duration ? this.elapsed - this.duration : 0;
    }

    return -1; // relinquish no time
  }
}

//
// ----- Global Mixin: -----
//

/**
 * Register the global mixins for PIXI.DisplayObject.
 *
 * @param displayObject A reference to `PIXI.DisplayObject`.
 */
export function registerGlobalMixin(displayObject: any): void {
  const _prototype = displayObject.prototype;

  // - Properties:

  _prototype.speed = 1.0;
  _prototype.isPaused = false;

  // - Methods:

  _prototype.run = function (_action: Action, completion?: () => void): void {
    const action = completion ? Action.sequence([_action, Action.run(completion)]) : _action;
    ActionTicker.runAction(undefined, this, action);
  };

  _prototype.runWithKey = function (action: Action, key: string): void {
    ActionTicker.runAction(key, this, action);
  };

  _prototype.runAsPromise = function (
    action: Action,
    timeoutBufferMs: number = 100
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this;
    return new Promise(function (resolve, reject) {
      const timeLimitMs = timeoutBufferMs + (node.speed * action.duration * 1_000);
      const timeoutCheck = setTimeout(() => reject('Took too long to complete.'), timeLimitMs);
      node.run(action, () => {
        clearTimeout(timeoutCheck);
        resolve();
      });
    });
  };

  _prototype.action = function (forKey: string): Action | undefined {
    return ActionTicker.getTargetActionForKey(this, forKey);
  };

  _prototype.hasActions = function (): boolean {
    return ActionTicker.hasTargetActions(this);
  };

  _prototype.removeAllActions = function (): void {
    ActionTicker.removeAllTargetActions(this);
  };

  _prototype.removeAction = function (forKey: string): void {
    ActionTicker.removeTargetActionForKey(this, forKey);
  };
}
