import { Action } from '../Action';

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
