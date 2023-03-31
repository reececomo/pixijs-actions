import { Action } from '../Action';
export class FadeToAction extends Action {
    constructor(target, alpha, duration, timingMode = Action.DefaultTimingMode) {
        super(target, duration);
        this.timingMode = timingMode;
        this.alpha = alpha;
    }
    tick(delta) {
        if (this.time === 0) {
            this.startAlpha = this.target.alpha;
        }
        this.time += delta;
        const factor = this.timingMode(this.timeDistance);
        this.target.alpha = this.startAlpha + (this.alpha - this.startAlpha) * factor;
        return this.timeDistance >= 1;
    }
}
//# sourceMappingURL=FadeToAction.js.map