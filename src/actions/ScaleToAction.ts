import * as PIXI from 'pixi.js';

import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';

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
			this.startX = this.target.scale.x;
			this.startY = this.target.scale.y;
		}

		this.time += delta;

		const factor: number = this.easedTimeDistance;
		this.target.scale.set(
			this.startX + (this.x - this.startX) * factor,
			this.startY + (this.y - this.startY) * factor,
		);

		return this.timeDistance >= 1;
	}
}