import { Action } from '../Action';

export class GroupAction extends Action {
	protected index: number = 0;
	protected actions: Action[];

	constructor(actions: Action[]) {
		super(
			undefined,
			// Total duration:
			actions.reduce((total, action) => total + action.duration, 0)
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
};