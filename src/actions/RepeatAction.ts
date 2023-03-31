import { Action } from '../Action';

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
