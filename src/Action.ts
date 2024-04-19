import * as PIXI from 'pixi.js';

import { TimingMode, TimingModeFn } from './TimingMode';

interface VectorLike {
	x: number;
	y: number;
}

/** Path of points. */
type PathLike = VectorLike[];

/** Time / duration (in seconds) */
type TimeInterval = number;

/** Targeted display node. */
type TargetNode = PIXI.DisplayObject;

/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently (i.e. UI and Game World).
 */
export abstract class Action {

  //
  // ----------------- Global Settings: -----------------
  //

  /** All currently running actions. */
  public static readonly actions: Action[] = [];

  //
  // ----------------- Global Settings: -----------------
  //

  /** Set a global default timing mode. */
  public static DefaultTimingMode: TimingModeFn = TimingMode.linear;

  /** Set the global default action category. */
  public static DefaultCategoryMask: number = 0x1 << 0;

  //
  // ----------------- Chaining Actions: -----------------
  //

	/** Creates an action that runs a collection of actions sequentially. */
  public static sequence(actions: Action[]): Action {
    return new SequenceAction(actions);
  }

	/** Creates an action that runs a collection of actions in parallel. */
  public static group(actions: Action[]): Action {
    return new GroupAction(actions);
  }
  
	/** Creates an action that repeats another action a specified number of times. */
  public static repeat(action: Action, repeats: number): Action {
    return new RepeatAction(action, repeats);
  }

	/** Creates an action that repeats another action forever. */
  public static repeatForever(action: Action): Action {
    return new RepeatAction(action, -1);
  }

  //
  // ----------------- Delaying Actions: -----------------
  //

	/** Creates an action that idles for a specified period of time. */
  public static waitForDuration(duration: TimeInterval): Action {
    return new DelayAction(duration);
  }

	/**
	 * Creates an action that idles for a randomized period of time.
	 * The resulting action will wait for averageDuration ± (rangeSize / 2).
	 *
	 * @param average The average amount of time to wait.
	 * @param rangeSize The range of possible values for the duration.
	 * @param randomSeed (Optional) A scalar between 0 and 1. Defaults to `Math.random()`.
	 *
	 * @example Action.waitForDurationWithRange(10.0, 5.0) // duration will be 7.5 -> 12.5
	 */
  public static waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval, randomSeed?: number): Action {
		const randomComponent = rangeSize * (randomSeed ?? Math.random()) - rangeSize * 0.5;
    return new DelayAction(average + randomComponent);
  }

  //
  // ----------------- Linear Path Actions: -----------------
  //

	/** Creates an action that moves a node relative to its current position. */
  public static moveBy(x: number, y: number, duration: TimeInterval): Action {
    return new MoveByAction(x, y, duration);
  }

	/** Creates an action that moves a node relative to its current position. */
  public static moveByVector(vec: VectorLike, duration: TimeInterval): Action {
    return Action.moveBy(vec.x, vec.y, duration);
  }

	/** Creates an action that moves a node horizontally relative to its current position. */
  public static moveByX(x: number, duration: TimeInterval): Action {
    return Action.moveBy(x, 0, duration);
  }

	/** Creates an action that moves a node vertically relative to its current position. */
  public static moveByY(y: number, duration: TimeInterval): Action {
    return Action.moveBy(0, y, duration);
  }

	/** Creates an action that moves a node to a new position. */
  public static moveTo(x: number, y: number, duration: TimeInterval): Action {
    return new MoveToAction(x, y, duration);
  }

	/** Creates an action that moves a node to a new position. */
  public static moveToPoint(point: VectorLike, duration: TimeInterval): Action {
    return Action.moveTo(point.x, point.y, duration);
  }

	/** Creates an action that moves a node horizontally. */
  public static moveToX(x: number, duration: TimeInterval): Action {
    return new MoveToAction(x, undefined, duration);
  }

	/** Creates an action that moves a node vertically. */
  public static moveToY(y: number, duration: TimeInterval): Action {
    return new MoveToAction(undefined, y, duration);
  }

  //
  // ----------------- Rotation Actions: -----------------
  //

	/** Creates an action that rotates the node by a relative value. */
  public static rotateBy(rotation: number, duration: TimeInterval): Action {
    return new RotateByAction(rotation, duration);
  }

	/** Creates an action that rotates the node to an absolute value. */
  public static rotateTo(rotation: number, duration: TimeInterval): Action {
    return new RotateToAction(rotation, duration);
  }

  //
  // ----------------- Scale Actions: -----------------
  //

	/** Creates an action that changes the x and y scale values of a node by a relative value. */
  public static scaleBy(x: number, y: number, duration: TimeInterval): Action {
    return new ScaleByAction(x, y, duration);
  }

	/** Creates an action that changes the x and y scale values of a node by a relative value. */
  public static scaleBySize(size: VectorLike, duration: TimeInterval): Action {
    return Action.scaleBy(size.x, size.y, duration);
  }

	/** Creates an action that changes the x scale of a node by a relative value. */
  public static scaleXBy(x: number, duration: TimeInterval): Action {
    return Action.scaleBy(x, 0, duration);
  }

	/** Creates an action that changes the y scale of a node by a relative value. */
  public static scaleYBy(y: number, duration: TimeInterval): Action {
    return Action.scaleBy(0, y, duration);
  }

	/** Creates an action that changes the x and y scale values of a node. */
  public static scaleTo(x: number, y: number, duration: TimeInterval): Action {
    return new ScaleToAction(x, y, duration);
  }

	/** Creates an action that changes the x and y scale values of a node. */
  public static scaleToSize(size: VectorLike, duration: TimeInterval): Action {
    return Action.scaleTo(size.x, size.y, duration);
  }

	/** Creates an action that changes the y scale values of a node. */
  public static scaleXTo(x: number, duration: TimeInterval): Action {
    return new ScaleToAction(x, undefined, duration);
  }

	/** Creates an action that changes the x scale values of a node. */
  public static scaleYTo(y: number, duration: TimeInterval): Action {
    return new ScaleToAction(undefined, y, duration);
  }

  //
  // ----------------- Transparency Actions: -----------------
  //

	/** Creates an action that changes the alpha value of the node to 1.0. */
  public static fadeIn(duration: TimeInterval): Action {
    return Action.fadeAlphaTo(1, duration);
  }

	/** Creates an action that changes the alpha value of the node to 0.0. */
  public static fadeOut(duration: TimeInterval): Action {
    return Action.fadeAlphaTo(0.0, duration);
  }

	/** Creates an action that adjusts the alpha value of a node to a new value. */
  public static fadeAlphaTo(alpha: number, duration: TimeInterval): Action {
    return new FadeToAction(alpha, duration);
  }

	/** Creates an action that adjusts the alpha value of a node by a relative value. */
  public static fadeAlphaBy(alpha: number, duration: TimeInterval): Action {
    return new FadeByAction(alpha, duration);
  }

  //
  // ----------------- Display Object Actions: -----------------
  //

  public static removeFromParent(): Action {
    return new RemoveFromParentAction();
  }

  //
  // ----------------- Transparency Actions: -----------------
  //

	/** Creates an action that executes a block. */
  public static run(fn: () => void): Action {
    return new RunBlockAction(fn);
  }

	/**
	 * Creates an action that executes a stepping function over its duration.
	 *
	 * The function will be triggered on every redraw until the action completes, and is passed
	 * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing mode function).
	 */
	public static custom(duration: number, stepFn: (target: TargetNode, x: number) => void): Action {
		return new CustomAction(duration, stepFn);
	}

  //
  // ----------------- Global Methods: -----------------
  //

  /** Clear all actions with this target. */
  public static removeActionsForTarget(target: TargetNode | undefined): void {
    for (let i = Action.actions.length - 1; i >= 0; i--) {
      const action: Action = this.actions[i];

      if (action.target === target) {
        Action.actions.splice(i, 1);
      }
    }
  }

  /** Clears all actions. */
  public static removeAllActions(): void {
    Action.actions.splice(0, this.actions.length);
  }

  /** Play an action. */
  protected static playAction(action: Action): Action {
    Action.actions.push(action);
    return action;
  }

  /** Stop an action. */
  protected static stopAction(action: Action): Action {
    const index = Action.actions.indexOf(action);
    if (index >= 0) {
      Action.actions.splice(index, 1);
    }
    return action;
  }

  /** Tick all actions forward.
   *
   * @param dt Delta time
   * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
   * @param onErrorHandler (Optional) Handler errors from each action's tick.
   */
  public static tick(dt: number, categoryMask: number = 0x1, onErrorHandler?: (error: any) => void): void {
    for (let i = Action.actions.length - 1; i >= 0; i--) {
      const action: Action = Action.actions[i];

      if (categoryMask !== undefined && (categoryMask & action.categoryMask) === 0) {
        continue;
      }
        
      try {
        Action.tickAction(action, dt);
      }
      catch (error) {
        // Isolate individual action errors.
        if (onErrorHandler !== undefined) {
          onErrorHandler(error);
        }
      }
    }
  }

  protected static tickAction(action: Action, delta: number): void {
    if (!action.target) {
			console.warn('Action was unexpectedly missing target display object when running!');
		}

		// If the action is targeted, but is no longer valid or on the stage
		// we garbage collect its actions.
		if (
			action.target == null
			|| action.target.destroyed
			|| action.target.parent === undefined
		) {
			const index = Action.actions.indexOf(action);
			if (index > -1) {
				Action.actions.splice(index, 1);
			}

			return;
		}

    // Tick the action
    const isDone = action.tick(delta * action.speed);
    if (isDone) {
      action.isDone = true;

      // Remove completed action.
      const index = Action.actions.indexOf(action);
      if (index > -1) {
        Action.actions.splice(index, 1);
      }

			// Check queued actions.
			for (let j = 0; j < action.queuedActions.length; j++) {
				this.playAction(action.queuedActions[j]);
			}
			action.queuedActions = [];
    }
  }

  //
  // ----------------- Action Instance Properties: -----------------
  //

	/** The display object the action is running against. Set during `runOn` and cannot be changed. */
  public target!: TargetNode;

	/** A speed factor that modifies how fast an action runs. */
  public speed: number = 1.0;

	/** Time elapsed in the action. */
  public elapsed: number = 0.0;

	/** Whether the action has completed. Set by `Action. */
  public isDone: boolean = false;

	/** Actions that will be triggered when this action completes. */
	protected queuedActions: Action[] = [];

  /** Whether action is in progress (or has not yet started). */
  public get isPlaying(): boolean {
    return this.isDone === false;
  }

	/** The relative time elapsed between 0 and 1. */
  protected get timeDistance(): number {
    return Math.min(1, this.elapsed / this.duration)
  }

	/**
	 * The relative time elapsed between 0 and 1, eased by the timing mode function.
	 *
	 * Can be a value beyond 0 or 1 depending on the timing mode function.
	 */
  protected get easedTimeDistance(): number {
    return this.timingMode(this.timeDistance);
  }

  //
  // ----------------- Action Instance Methods: -----------------
  //

  constructor(
    public readonly duration: TimeInterval,
    public timingMode: TimingModeFn = Action.DefaultTimingMode,
    public categoryMask: number = Action.DefaultCategoryMask,
  ) {}

  /** Must be implmented by each class. */
  public abstract tick(progress: number): boolean;

	/** Run an action on this target. */
  public runOn(target: TargetNode): this {
		this.setTarget(target);
    Action.playAction(this);
    return this;
  }

	/** Set an action to run after this action. */
	public queueAction(next: Action): this {
		this.queuedActions.push(next);
		return this;
	}

	/** Reset an action to the start. */
  public reset(): this {
    this.isDone = false;
    this.elapsed = 0;
    return this;
  }

	/** Stop and reset an action. */
  public stop(): this {
    Action.stopAction(this);
		this.reset();
    return this;
  }

	/** Set a timing mode function for this action. */
  public withTimingMode(timingMode: TimingModeFn): this {
		this.timingMode = timingMode;
    return this;
  }

	/** Set a category mask for this action. Used to group different actions together. */
  public setCategory(categoryMask: number): this {
    this.categoryMask = categoryMask;
    return this;
  }

	/** Set which display object should be targeted. Internal use only. */
  public setTarget(target: TargetNode): this {
		if (this.target && target !== this.target) {
			console.warn('setTarget() called on Action that already has another target. Recycling actions is currently unsupported. Behavior may be unexpected.');
		}

    this.target = target;
    return this;
  }

	// ----- Implementation: -----

	/**
	 * For relative actions, increments time by delta, and returns the change in easedTimeDistance.
	 *
	 * @param delta change in time to apply
	 * @returns the relative change in easedTimeDistance.
	 */
	protected applyDelta(delta: number): number {
		const before = this.easedTimeDistance;
		this.elapsed += delta;

		return this.easedTimeDistance - before;
	}
}

//
// ----------------- Built-ins: -----------------
//

export class SequenceAction extends Action {
  index: number = 0;
  actions: Action[];

  constructor(actions: Action[]) {
    super(
      // Total duration:
      actions.reduce((total, action) => total + action.duration, 0)
    );
    this.actions = actions;
  }

  public tick(delta: number): boolean {
    // If empty, we are done!
    if (this.index == this.actions.length)
      return true;

    // Otherwise, tick the first element
    if (this.actions[this.index].tick(delta)) {
      this.index++;
    }

    return false;
  }

  public reset() {
    super.reset();

    this.index = 0;
    for (const i in this.actions) {
      this.actions[i].reset();
    }
    return this;
  }

  public setTarget(target: TargetNode): this {
		this.actions.forEach(action => action.setTarget(target));
		return super.setTarget(target);
	}
}

export class ScaleToAction extends Action {
  protected startX!: number;
  protected startY!: number;

  constructor(
		protected readonly x: number | undefined,
		protected readonly y: number | undefined,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public tick(delta: number): boolean {
    if (this.elapsed === 0) {
      this.startX = this.target.scale.x;
      this.startY = this.target.scale.y;
    }

    this.elapsed += delta;

    const factor: number = this.easedTimeDistance;

		const newXScale = this.x === undefined ? this.target.scale.x : this.startX + (this.x - this.startX) * factor;
		const newYScale = this.y === undefined ? this.target.scale.y : this.startY + (this.y - this.startY) * factor;
	
    this.target.scale.set(newXScale, newYScale);

    return this.timeDistance >= 1;
  }
}
export class ScaleByAction extends Action {
  constructor(
		protected readonly x: number,
		protected readonly y: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public tick(delta: number): boolean {
		const factorDelta = this.applyDelta(delta);
	
    this.target.scale.set(
      this.target.scale.x + this.x * factorDelta,
      this.target.scale.y + this.y * factorDelta,
    );

    return this.timeDistance >= 1;
  }
}

export class RemoveFromParentAction extends Action {
  constructor() {
    super(0);
  }

  public tick(delta: number): boolean {
		if (this.target?.parent) {
			this.target.parent?.removeChild(this.target);
		}

    return true;
  }
}

export class CustomAction extends Action {
  constructor(
		duration: TimeInterval,
		protected stepFn: (target: TargetNode, x: number) => void
	) {
    super(duration);
  }

  public tick(delta: number): boolean {
		this.elapsed += delta;
    this.stepFn(this.target, this.easedTimeDistance);

    return this.timeDistance >= 1;
  }
}

export class RunBlockAction extends Action {
  protected block: () => any;

  constructor(block: () => void) {
    super(0);
    this.block = block;
  }

  public tick(delta: number): boolean {
    this.block.call(this);

    return true;
  }
}

export class RotateToAction extends Action {
  protected startRotation!: number;

  constructor(
    protected readonly rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public tick(delta: number): boolean {
    if (this.elapsed === 0) {
      this.startRotation = this.target.rotation;
    }

    this.elapsed += delta;

    const factor: number = this.easedTimeDistance;
    this.target.rotation = this.startRotation + (this.rotation - this.startRotation) * factor;
    return this.timeDistance >= 1;
  }
}

export class RotateByAction extends Action {
  constructor(
    protected readonly rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public tick(delta: number): boolean {
		const factorDelta = this.applyDelta(delta);
    this.target.rotation += this.rotation * factorDelta;

    return this.timeDistance >= 1;
  }
}

export class RepeatAction extends Action {
  protected action: Action;
  protected maxRepeats: number;
  protected n: number = 0;

  /**
   * @param action Targeted action.
   * @param repeats A negative value indicates looping forever.
   */
  constructor(action: Action, repeats: number) {
    super(
      // Duration:
      repeats === -1 ? Infinity : action.duration * repeats
    );

    this.action = action;
    this.maxRepeats = repeats;
  }

  public tick(delta: number): boolean {
    if (this.action.tick(delta)) {
      this.n += 1;
      if (this.maxRepeats >= 0 && this.n >= this.maxRepeats) {
        return true;
      } else {
        // Reset delta.
        this.reset();
      }
    }
    return false;
  }

  public reset() {
    super.reset();
    this.action.reset();
    return this;
  }

  public setTarget(target: TargetNode): this {
		this.action.setTarget(target);
		return super.setTarget(target);
	}
}

export class MoveToAction extends Action {
  protected startX!: number;
  protected startY!: number;

  constructor(
		protected readonly x: number | undefined,
		protected readonly y: number | undefined,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public tick(delta: number): boolean {
    if (this.elapsed === 0) {
      this.startX = this.target.x;
      this.startY = this.target.y;
    }

    this.elapsed += delta;

    const factor: number = this.easedTimeDistance;
		const newX = this.x === undefined ? this.target.position.x : this.startX + (this.x - this.startX) * factor;
		const newY = this.y === undefined ? this.target.position.y : this.startY + (this.y - this.startY) * factor;
		
		this.target.position.set(newX, newY);

    return this.timeDistance >= 1;
  }
}

class MoveByAction extends Action {
  public constructor(
		protected x: number,
		protected y: number,
		duration: number,
	) {
    super(duration);
  }

  public tick(delta: number): boolean {
		const factorDelta = this.applyDelta(delta);

    if (this.target) {
      this.target.position.x += this.x * factorDelta;
      this.target.position.y += this.y * factorDelta;
    }

    return this.timeDistance >= 1;
  }
}

export class GroupAction extends Action {
  protected index: number = 0;
  protected actions: Action[];

  constructor(actions: Action[]) {
    super(
      // Max duration:
      Math.max(...actions.map(action => action.duration))
    );

    this.actions = actions;
  }

  public tick(delta: number): boolean {
    // Tick all elements!
    let allDone = true;

    for (const action of this.actions) {
      if (action.isDone) {
        continue;
      }

      if (action.tick(delta)) {
        action.isDone = true;
      } else {
        allDone = false;
      }
    }

    return allDone;
  }

  public reset() {
    super.reset();

    this.index = 0;
    for (const i in this.actions) {
      this.actions[i].reset();
    }
    return this;
  }

  public setTarget(target: TargetNode): this {
		this.actions.forEach(action => action.setTarget(target));
		return super.setTarget(target);
	}
}

export class FadeToAction extends Action {
  protected startAlpha!: number;
  protected alpha: number;

  constructor(alpha: number, duration: TimeInterval) {
    super(duration);
    this.alpha = alpha;
  }

  public tick(delta: number): boolean {
    if (this.elapsed === 0) {
      this.startAlpha = this.target.alpha;
    }

    this.elapsed += delta;

    const factor: number = this.timingMode(this.timeDistance);
    this.target.alpha = this.startAlpha + (this.alpha - this.startAlpha) * factor;

    return this.timeDistance >= 1;
  }
}

export class FadeByAction extends Action {
  constructor(
		protected readonly alpha: number,
		duration: TimeInterval,
		timingMode: TimingModeFn = Action.DefaultTimingMode
	) {
    super(duration);
  }

  public tick(delta: number): boolean {
		const factorDelta = this.applyDelta(delta);
    this.target.alpha += this.alpha * factorDelta;

    return this.timeDistance >= 1;
  }
}

export class DelayAction extends Action {
  public tick(delta: number): boolean {
    this.elapsed += delta;
    return this.elapsed >= this.duration;
  }
}
