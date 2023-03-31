import * as PIXI from 'pixi.js';

import { ActionTimingMode, TimingModeFn } from './ActionTimingMode';


export abstract class Action {

	//
	// ----------------- STATC -----------------
	//

	/** Optionally check a boolean property with this name on display objects. */
	public static PausedProperty: string | undefined = 'paused';

	/** Set a global default timing mode. */
	public static DefaultTimingMode: TimingModeFn = ActionTimingMode.linear;

	/** All currently running actions. */
	public static actions: Action[] = [];

	//
	// ----------------- BUILT-INS -----------------
	//

	public static sequence(actions: Action[]): Action {
		return new SequenceAction(actions);
	}

	public static group(actions: Action[]): Action {
		return new GroupAction(actions);
	}

	public static repeat(action: Action, repeats: number): Action {
		return new RepeatAction(action, repeats);
	}

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

	public static fadeOutAndRemove(
		target: PIXI.DisplayObject,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return this.sequence([
			this.fadeOut(target, duration, timingMode),
			this.remove(target),
		]);
	}

	public static fadeIn(
		target: PIXI.DisplayObject,
		duration: number,
		timingMode?: TimingModeFn
	): Action {
		return this.fadeTo(target, 1, duration, timingMode);
	}

	public static remove(target: PIXI.DisplayObject): Action {
		return this.runBlock(() => {
			if (target.parent) {
				target.parent.removeChild(target);
			}
		});
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
	public static clearTargetActions(target: PIXI.DisplayObject | undefined): void {
		for (let i = this.actions.length - 1; i >= 0; i--) {
			const action: Action = this.actions[i];

			if (action.target === target) {
				this.actions.splice(i, 1);
			}
		}
	}

	/** Clear all actions. */
	public static clearAllActions(): void {
		this.actions = [];
	}

	/** Play an action. */
	protected static play(action: Action): Action {
		this.actions.push(action);
		return action;
	}

	/** Pause an action. */
	protected static pause(action: Action): Action {
		const index = this.actions.indexOf(action);
		if (index >= 0) {
			this.actions.splice(index, 1);
		}
		return action;
	}

	/** Tick all actions forward. */
	public static tick(delta: number): void {
		for (let i = this.actions.length - 1; i >= 0; i--) {
			const action: Action = this.actions[i];

			// If the action is targeted, but is no longer on the stage
			// we remove its actions.
			if (action.target) {
				if (action.target.parent === undefined) {
					this.actions.splice(i, 1);
					continue;
				}

				if (Action.PausedProperty !== undefined && isTargetPaused(action.target)) {
					// Display object is paused. Skip tick.
					continue;
				}
			}

			// Otherwise, we tick the action
			const done = action.tick(delta);
			if (done) {
				action.done = true;
				this.actions.splice(i, 1);

				// Are there any queued events?
				for (let j = 0; j < action.queued.length; j++) {
					this.play(action.queued[j]);
				}
				action.queued = [];
			}
		}
	}

	//
	// ----------------- INSTANCE PROPERTIES -----------------
	//

	public time: number = 0;
	public duration: number;
	public target?: PIXI.DisplayObject;
	public done: boolean = false;
	public timingMode: TimingModeFn = Action.DefaultTimingMode;
	protected queued: Action[] = [];

	protected get timeDistance(): number {
		return Math.min(1, this.time / this.duration)
	}

	protected get easedTimeDistance(): number {
		return this.timingMode(this.timeDistance);
	}

	//
	// ----------------- INSTANCE METHODS -----------------
	//

	constructor(target: PIXI.DisplayObject | undefined, duration: number) {
		this.target = target;
		this.duration = duration;
	}

	/** Must be implmented by each class. */
	public abstract tick(progress: number): boolean;

	public play() {
		Action.play(this);
		return this;
	}

	public pause() {
		Action.pause(this);
		return this;
	}

	public queue(next: Action) {
		this.queued.push(next);
		return this;
	}

	public reset() {
		this.done = false;
		this.time = 0;
		return this;
	}

	public stop() {
		this.pause().reset();
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

export class SequenceAction extends Action {
	index: number = 0;
	actions: Action[];

	constructor(actions: Action[]) {
		super(
			undefined,
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

export class GroupAction extends Action {
	protected index: number = 0;
	protected actions: Action[];

	constructor(actions: Action[]) {
		super(
			undefined,
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
