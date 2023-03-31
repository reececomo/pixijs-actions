import { Action } from '../Action';
export class DelayAction extends Action {
    tick(delta) {
        this.time += delta;
        return this.time >= this.duration;
    }
}
//# sourceMappingURL=DelayAction.js.map