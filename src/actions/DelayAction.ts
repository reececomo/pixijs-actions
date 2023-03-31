import { Action } from '../Action';

export class DelayAction extends Action {

	public tick(delta: number): boolean {
		this.time += delta;
		return this.time >= this.duration;
	}

}
