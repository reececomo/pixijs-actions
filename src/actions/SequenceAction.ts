import { Action } from '../Action';

export class SequenceAction extends Action {
	index: number = 0;
	actions: Action[];

	constructor(actions: Action[]) {
		super(undefined, undefined);
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
	}

	public reset() {
		super.reset();

		this.index = 0;
		for (const i in this.actions) {
			this.actions[i].reset();
		}
		return this;
	}
};