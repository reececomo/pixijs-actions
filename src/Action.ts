import * as PIXI from 'pixi.js';

import { TimingMode, TimingModeFn } from './TimingMode';

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
  // ----------------- Static -----------------
  //

  /** All currently running actions. */
  public static readonly actions: Action[] = [];

  /** Set a global default timing mode. */
  public static DefaultTimingMode: TimingModeFn = TimingMode.linear;

  /** Set the global default action category. */
  public static DefaultCategoryMask: number = 0x1 << 0;

  //
  // ----------------- BUILT-INS -----------------
  //

  /** Infers target from given actions. */
  public static sequence(actions: Action[]): Action {
    return new SequenceAction(actions);
  }

  
/** Infers target from given actions. */
  public static group(actions: Action[]): Action {
    return new GroupAction(actions);
  }
  
/** Infers target from given action. */
  public static repeat(action: Action, repeats: number): Action {
    return new RepeatAction(action, repeats);
  }

  
  /** Infers target from given action. */
  public static repeatForever(action: Action): Action {
    return new RepeatAction(action, -1);
  }

  public static moveTo(
    x: number,
    y: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new MoveToAction(x, y, duration, timingMode);
  }

  public static moveBy(
    x: number,
    y: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new MoveByAction(x, y, duration, timingMode);
  }

  public static fadeTo(
    alpha: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new FadeToAction(alpha, duration, timingMode);
  }

  public static fadeOut(
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return Action.fadeTo(0.0, duration, timingMode);
  }

  public static fadeOutAndRemoveFromParent(
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return Action.sequence([
      Action.fadeOut(duration, timingMode),
      Action.removeFromParent(),
    ]);
  }

  public static fadeIn(
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return this.fadeTo(1.0, duration, timingMode);
  }

  public static removeFromParent(): Action {
    return new RemoveFromParentAction();
  }

  public static delay(duration: number
  ): Action {
    return new DelayAction(duration);
  }

  public static runBlock(fn: () => void): Action {
    return new RunBlockAction(fn);
  }

  public static scaleTo(
    x: number,
    y: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new ScaleToAction(x, y, duration, timingMode);
  }

  public static scaleBy(
    x: number,
    y: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new ScaleByAction(x, y, duration, timingMode);
  }

  public static rotateTo(
    rotation: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new RotateToAction(rotation, duration, timingMode);
  }

  public static rotateBy(
    rotation: number,
    duration: number,
    timingMode?: TimingModeFn
  ): Action {
    return new RotateByAction(rotation, duration, timingMode);
  }

  //
  // ----------------- METHODS -----------------
  //

  /** Clear all actions with this target. */
  public static removeActionsForTarget(target: PIXI.DisplayObject | undefined): void {
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

  private static tickAction(action: Action, delta: number): void {
    if (action.target) {
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
  // ----------------- INSTANCE PROPERTIES -----------------
  //

  public target: PIXI.DisplayObject | undefined;
  public speed: number = 1.0;
  public time: number = 0;
  public isDone: boolean = false;
	protected queuedActions: Action[] = [];

  /** Whether action is in progress */
  public get isPlaying(): boolean {
    return !this.isDone;
  }

  protected get timeDistance(): number {
    return Math.min(1, this.time / this.duration)
  }

  protected get easedTimeDistance(): number {
    return this.timingMode(this.timeDistance);
  }

  //
  // ----------------- INSTANCE METHODS -----------------
  //

  constructor(
    public readonly duration: number,
    public timingMode: TimingModeFn = Action.DefaultTimingMode,
    public categoryMask: number = Action.DefaultCategoryMask,
  ) {}

  /** Must be implmented by each class. */
  public abstract tick(progress: number): boolean;

	/** Run an action on this target. */
  public runOn(target: PIXI.DisplayObject): this {
		this.setTarget(target);
    Action.playAction(this);
    return this;
  }

	public queueAction(next: Action): this {
		this.queuedActions.push(next);
		return this;
	}

  public reset(): this {
    this.isDone = false;
    this.time = 0;
    return this;
  }

  public stop(): this {
    Action.stopAction(this);
		this.reset();
    return this;
  }

  public setCategory(categoryMask: number): this {
    this.categoryMask = categoryMask;
    return this;
  }

  public setTarget(target: PIXI.DisplayObject): this {
		if (this.target && target !== this.target) {
			console.warn('setTarget() called on Action that already has another target. Recycling actions is currently unsupported. Behavior may be unexpected.');
		}

    this.target = target;
    return this;
  }
}

//
// ----------------- BUILT-IN ACTION DEFINITIONS -----------------
//

/** Infers target from given actions. */
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

  public setTarget(target: PIXI.DisplayObject): this {
		this.actions.forEach(action => action.setTarget(target));
		return super.setTarget(target);
	}
}

export class ScaleToAction extends Action {
  protected startX!: number;
  protected startY!: number;
  protected x: number;
  protected y: number;

  constructor(
    x: number,
    y: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.x = x;
    this.y = y;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startX = this.target!.scale.x;
      this.startY = this.target!.scale.y;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target!.scale.set(
      this.startX + (this.x - this.startX) * factor,
      this.startY + (this.y - this.startY) * factor,
    );

    return this.timeDistance >= 1;
  }
}
export class ScaleByAction extends Action {
  protected startX!: number;
  protected startY!: number;
  protected x: number;
  protected y: number;

  constructor(
    x: number,
    y: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.x = x;
    this.y = y;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startX = this.target!.scale.x;
      this.startY = this.target!.scale.y;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target!.scale.set(
      this.startX + this.x * factor,
      this.startY + this.y * factor,
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
  protected rotation: number;

  constructor(
    rotation: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.rotation = rotation;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startRotation = this.target!.rotation;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target!.rotation = this.startRotation + (this.rotation - this.startRotation) * factor;
    return this.timeDistance >= 1;
  }
}

export class RotateByAction extends Action {
  protected startRotation!: number;
  protected rotation: number;

  constructor(
    rotation: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.rotation = rotation;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startRotation = this.target!.rotation;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target!.rotation = this.startRotation + this.rotation * factor;
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

  public setTarget(target: PIXI.DisplayObject): this {
		this.action.setTarget(target);
		return super.setTarget(target);
	}
}

export class MoveToAction extends Action {
  protected startX!: number;
  protected startY!: number;
  protected x: number;
  protected y: number;

  constructor(
    x: number,
    y: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.x = x;
    this.y = y;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startX = this.target!.x;
      this.startY = this.target!.y;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target!.position.set(
      this.startX + (this.x - this.startX) * factor,
      this.startY + (this.y - this.startY) * factor,
    );

    return this.timeDistance >= 1;
  }
}


export class MoveByAction extends Action {
  protected startX!: number;
  protected startY!: number;
  protected x: number;
  protected y: number;

  constructor(
    x: number,
    y: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.x = x;
    this.y = y;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startX = this.target!.x;
      this.startY = this.target!.y;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target!.position.set(
      this.startX + this.x * factor,
      this.startY + this.y * factor,
    );

    return this.timeDistance >= 1;
  }
}

/** Infers target from given actions. */
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

  public setTarget(target: PIXI.DisplayObject): this {
		this.actions.forEach(action => action.setTarget(target));
		return super.setTarget(target);
	}
}

export class FadeToAction extends Action {
  protected startAlpha!: number;
  protected alpha: number;

  constructor(
    alpha: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(duration);
    this.timingMode = timingMode;
    this.alpha = alpha;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startAlpha = this.target!.alpha;
    }

    this.time += delta;

    const factor: number = this.timingMode(this.timeDistance);
    this.target!.alpha = this.startAlpha + (this.alpha - this.startAlpha) * factor;

    return this.timeDistance >= 1;
  }
}

export class DelayAction extends Action {
  public tick(delta: number): boolean {
    this.time += delta;
    return this.time >= this.duration;
  }
}
