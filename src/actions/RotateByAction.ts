import * as PIXI from 'pixi.js';

import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';

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
			this.startRotation = this.target.rotation;
		}

		this.time += delta;

		const factor: number = this.easedTimeDistance;
		this.target.rotation = this.startRotation + this.rotation * factor;
		return this.timeDistance >= 1;
	}
}
