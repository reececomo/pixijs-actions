import { Action } from '../Action';
export class MoveByAction extends Action {
    constructor(target, x, y, duration, timingMode = Action.DefaultTimingMode) {
        super(target, duration);
        this.timingMode = timingMode;
        this.x = x;
        this.y = y;
    }
    tick(delta) {
        if (this.time === 0) {
            this.startX = this.target.x;
            this.startY = this.target.y;
        }
        this.time += delta;
        const factor = this.easedTimeDistance;
        this.target.position.set(this.startX + this.x * factor, this.startY + this.y * factor);
        return this.timeDistance >= 1;
    }
}
//# sourceMappingURL=MoveByAction.js.map