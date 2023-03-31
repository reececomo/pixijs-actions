import * as PIXI from 'pixi.js';

import { ActionTimingMode, TimingModeFn } from './ActionTimingMode';

import { DelayAction } from './actions/DelayAction';
import { FadeToAction } from './actions/FadeToAction';
import { GroupAction } from './actions/GroupAction';
import { MoveByAction } from './actions/MoveByAction';
import { MoveToAction } from './actions/MoveToAction';
import { RepeatAction } from './actions/RepeatAction';
import { RotateByAction } from './actions/RotateByAction';
import { RotateToAction } from './actions/RotateToAction';
import { RunBlockAction } from './actions/RunBlockAction';
import { ScaleByAction } from './actions/ScaleByAction';
import { ScaleToAction } from './actions/ScaleToAction';
import { SequenceAction } from './actions/SequenceAction';
import { DisplayObject } from 'pixi.js';

export abstract class Action {

	/** Optionally check a boolean property with this name on display objects. */
	public static PausedProperty: string | undefined = 'paused';

	/** Set a global default timing mode. */
	public static DefaultTimingMode: TimingModeFn = ActionTimingMode.linear;

	/** All currently running actions. */
	protected static actions: Action[] = [];

	// Shortcuts:

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
			if (target.parent != null)
				target.parent.removeChild(target);
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

	public static clearTargetActions(target: PIXI.DisplayObject | undefined): void {
		for (let i = this.actions.length - 1; i >= 0; i--) {
			const action: Action = this.actions[i];

			if (action.target === target) {
				this.actions.splice(i, 1);
			}
		}
	}

	public static clearAllActions(): void {
		this.actions = [];
	}

	protected static play(action: Action): Action {
		this.actions.push(action);
		return action;
	}

	protected static pause(action: Action): Action {
		const index = this.actions.indexOf(action);
		if (index >= 0) {
			this.actions.splice(index, 1);
		}
		return action;
	}

	/**
	 * Tick all actions forward.
	 */
	public static tick(delta: number): void {
		for (let i = this.actions.length - 1; i >= 0; i--) {
			const action: Action = this.actions[i];

			// If the action is targeted, but is no longer on the stage
			// we remove its actions.
			if (action.target !== undefined) {
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

	// --------------------- INSTANCE:

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

	// Instance methods:

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

function isTargetPaused(target: DisplayObject): boolean {
	let next: any = target;

	// Check each parent.
	while (next !== undefined) {
		if ((next[Action.PausedProperty] ?? false) === true) {
			return true;
		}

		next = next.parent;
	}

	return false;
}
