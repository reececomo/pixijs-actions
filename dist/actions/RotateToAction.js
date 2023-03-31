import { Action } from '../Action';
export class RotateToAction extends Action {
    constructor(target, rotation, duration, timingMode = Action.DefaultTimingMode) {
        super(target, duration);
        this.timingMode = timingMode;
        this.rotation = rotation;
    }
    tick(delta) {
        if (this.time === 0) {
            this.startRotation = this.target.rotation;
        }
        this.time += delta;
        const factor = this.easedTimeDistance;
        this.target.rotation = this.startRotation + (this.rotation - this.startRotation) * factor;
        return this.timeDistance >= 1;
    }
}
//# sourceMappingURL=RotateToAction.js.map