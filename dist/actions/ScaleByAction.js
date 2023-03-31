import { Action } from '../Action';
export class ScaleByAction extends Action {
    constructor(target, x, y, duration, timingMode = Action.DefaultTimingMode) {
        super(target, duration);
        this.timingMode = timingMode;
        this.x = x;
        this.y = y;
    }
    tick(delta) {
        if (this.time === 0) {
            this.startX = this.target.scale.x;
            this.startY = this.target.scale.y;
        }
        this.time += delta;
        const factor = this.easedTimeDistance;
        this.target.scale.set(this.startX + this.x * factor, this.startY + this.y * factor);
        return this.timeDistance >= 1;
    }
}
//# sourceMappingURL=ScaleByAction.js.map