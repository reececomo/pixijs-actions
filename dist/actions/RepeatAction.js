import { Action } from '../Action';
export class RepeatAction extends Action {
    /**
     * @param action Targeted action.
     * @param repeats A negative value indicates looping forever.
     */
    constructor(action, repeats) {
        super(action.target, 
        // Duration:
        repeats === -1 ? Infinity : action.duration * repeats);
        this.n = 0;
        this.action = action;
        this.maxRepeats = repeats;
    }
    tick(delta) {
        if (this.action.tick(delta)) {
            this.n += 1;
            if (this.maxRepeats >= 0 && this.n >= this.maxRepeats) {
                return true;
            }
            else {
                // Reset delta.
                this.reset();
            }
        }
        return false;
    }
    reset() {
        super.reset();
        this.action.reset();
        return this;
    }
}
//# sourceMappingURL=RepeatAction.js.map