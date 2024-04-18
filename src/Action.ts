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

	/** Optionally check a boolean property with this name on display objects. */
	public static PausedProperty?: string = 'paused';

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
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new MoveToAction(target, x, y, duration, timingMode);
	}

	public static moveBy(
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new MoveByAction(target, x, y, duration, timingMode);
	}

	public static fadeTo(
		target: PIXI.DisplayObject,
		alpha: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new FadeToAction(target, alpha, duration, timingMode);
	}

	public static fadeOut(
		target: PIXI.DisplayObject,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return this.fadeTo(target, 0, duration, timingMode);
	}

	public static fadeOutAndRemoveFromParent(
		target: PIXI.DisplayObject,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return this.sequence([
			this.fadeOut(target, duration, timingMode),
			this.removeFromParent(target),
		]);
	}

	public static fadeIn(
		target: PIXI.DisplayObject,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return this.fadeTo(target, 1, duration, timingMode);
	}

	public static removeFromParent(target: PIXI.DisplayObject): Action {
		return this.runBlock(() => target.parent?.removeChild(target));
	}

	public static delay(duration: number
	): Action {
		return new DelayAction(undefined, duration);
	}

	public static runBlock(fn: () => void
	): Action {
		return new RunBlockAction(fn);
	}

	public static scaleTo(
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new ScaleToAction(target, x, y, duration, timingMode);
	}

	public static scaleBy(
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new ScaleByAction(target, x, y, duration, timingMode);
	}

	public static rotateTo(
		target: PIXI.DisplayObject,
		rotation: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new RotateToAction(target, rotation, duration, timingMode);
	}

	public static rotateBy(
		target: PIXI.DisplayObject,
		rotation: number,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return new RotateByAction(target, rotation, duration, timingMode);
	}

	//
	// ----------------- METHODS -----------------
	//

	/** Clear all actions with this target. */
	public static removeActionsForTarget(target: PIXI.DisplayObject | undefined): void {
		for (let i = this.actions.length - 1; i >= 0; i--) {
			const action: Action = this.actions[i];

			if (action.target === target) {
				this.actions.splice(i, 1);
			}
		}
	}

	/** Clears all actions. */
	public static removeAllActions(): void {
		this.actions.splice(0, this.actions.length);
	}

	/** Play an action. */
	protected static playAction(action: Action): Action {
		this.actions.push(action);
		return action;
	}

	/** Pause an action. */
	protected static pauseAction(action: Action): Action {
		const index = this.actions.indexOf(action);
		if (index >= 0) {
			this.actions.splice(index, 1);
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
		for (let i = this.actions.length - 1; i >= 0; i--) {
			const action: Action = this.actions[i];

			if (categoryMask !== undefined && (categoryMask & action.categoryMask) === 0) {
				continue;
			}
				
			try {
				this.tickAction(action, dt);
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
		if (action.isTargeted || action.target) {
			// If the action is targeted, but is no longer valid or on the stage
			// we garbage collect its actions.
			if (
				action.target == null
				|| action.target.destroyed
				|| action.target.parent === undefined
			) {
				const index = this.actions.indexOf(action);
				if (index > -1) {
					this.actions.splice(index, 1);
				}

				return;
			}

			if (Action.PausedProperty !== undefined && isTargetPaused(action.target)) {
				// Display object is paused. Skip tick.
				return;
			}
		}

		// Otherwise, we tick the action
		const done = action.tick(delta);
		if (done) {
			action.done = true;

			// Remove this action.
			const index = this.actions.indexOf(action);
			if (index > -1) {
				this.actions.splice(index, 1);
			}

			// Are there any queued events?
			for (let j = 0; j < action.queued.length; j++) {
				this.playAction(action.queued[j]);
			}
			action.queued = [];
		}
	}

	//
	// ----------------- INSTANCE PROPERTIES -----------------
	//

	public time: number = 0;
	public done: boolean = false;;
	protected queued: Action[] = [];

	/** Whether the action is intended to be targeted. */
	public isTargeted: boolean;

	/** Whether action is in progress */
	public get isPlaying(): boolean {
		return !this.done;
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
		public target: PIXI.DisplayObject | undefined,
		public duration: number,
		public timingMode: TimingModeFn = Action.DefaultTimingMode,
		public categoryMask: number = Action.DefaultCategoryMask,
	) {
		this.isTargeted = target !== undefined;
	}

	/** Must be implmented by each class. */
	public abstract tick(progress: number): boolean;

	public play(): this {
		Action.playAction(this);
		return this;
	}

	public pause(): this {
		Action.pauseAction(this);
		return this;
	}

	public queue(next: Action): this {
		this.queued.push(next);
		return this;
	}

	public reset(): this {
		this.done = false;
		this.time = 0;
		return this;
	}

	public stop(): this {
		this.pause().reset();
		return this;
	}

	public setCategory(categoryMask: number): this {
		this.categoryMask = categoryMask;
		return this;
	}
}

/** Helper method to check if a target is paused. */
function isTargetPaused(target: PIXI.DisplayObject): boolean {
	let next: any = target;

	// Check each parent.
	while (next) {
		if (Action.PausedProperty !== undefined && (next[Action.PausedProperty] ?? false) === true) {
			return true;
		}

		next = next.parent;
	}

	return false;
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
			// Inferred target:
			actions.filter(action => action.target !== undefined)[0]?.target,
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
}

export class ScaleToAction extends Action {
	protected startX!: number;
	protected startY!: number;
	protected x: number;
	protected y: number;

	constructor(
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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

export class RunBlockAction extends Action {
	protected block: () => any;

	constructor(block: () => void) {
		super(undefined, 0);
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
		target: PIXI.DisplayObject,
		rotation: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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
		target: PIXI.DisplayObject,
		rotation: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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
			action.target,
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
}

export class MoveToAction extends Action {
	protected startX!: number;
	protected startY!: number;
	protected x: number;
	protected y: number;

	constructor(
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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
		target: PIXI.DisplayObject,
		x: number,
		y: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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
			// Inferred target:
			actions.filter(action => action.target !== undefined)[0]?.target,
			// Max duration:
			Math.max(...actions.map(action => action.duration))
		);

		this.actions = actions;
	}

	public tick(delta: number): boolean {
		// Tick all elements!
		let allDone = true;

		for (const action of this.actions) {
			if (action.done) {
				continue;
			}

			if (action.tick(delta)) {
				action.done = true;
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
}

export class FadeToAction extends Action {
	protected startAlpha!: number;
	protected alpha: number;

	constructor(
		target: PIXI.DisplayObject,
		alpha: number,
		duration: number,
		timingMode: TimingModeFn = Action.DefaultTimingMode,
	) {
		super(target, duration);
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
