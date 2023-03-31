import * as PIXI from 'pixi.js';

import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';

export class FadeToAction extends Action {
	protected startAlpha: number;
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
			this.startAlpha = this.target.alpha;
		}

		this.time += delta;

		const factor: number = this.timingMode(this.timeDistance);
		this.target.alpha = this.startAlpha + (this.alpha - this.startAlpha) * factor;

		return this.timeDistance >= 1;
	}
}
