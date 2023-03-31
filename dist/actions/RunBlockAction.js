import { Action } from '../Action';
export class RunBlockAction extends Action {
    constructor(block) {
        super(undefined, 0);
        this.block = block;
    }
    tick(delta) {
        this.block.call(this);
        return true;
    }
}
//# sourceMappingURL=RunBlockAction.js.map