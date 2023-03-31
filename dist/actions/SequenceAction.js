import { Action } from '../Action';
export class SequenceAction extends Action {
    constructor(actions) {
        super(undefined, undefined);
        this.index = 0;
        this.actions = actions;
    }
    tick(delta) {
        // If empty, we are done!
        if (this.index == this.actions.length)
            return true;
        // Otherwise, tick the first element
        if (this.actions[this.index].tick(delta)) {
            this.index++;
        }
    }
    reset() {
        super.reset();
        this.index = 0;
        for (const i in this.actions) {
            this.actions[i].reset();
        }
        return this;
    }
}
;
//# sourceMappingURL=SequenceAction.js.map