import { ActionTimingMode } from './ActionTimingMode';
import { DelayAction } from './actions/DelayAction';
import { FadeToAction } from './actions/FadeToAction';
import { GroupAction } from './actions/GroupAction';
import { MoveByAction } from './actions/MoveByAction';
import { MoveToAction } from './actions/MoveToAction';
import { RepeatAction } from './actions/RepeatAction';
import { RotateByAction } from './actions/RotateByAction';
import { RotateToAction } from './actions/RotateToAction';
import { RunBlockAction } from './actions/RunBlockAction';
import { ScaleByAction } from './actions/ScaleByAction';
import { ScaleToAction } from './actions/ScaleToAction';
import { SequenceAction } from './actions/SequenceAction';
export class Action {
    // Instance methods:
    constructor(target, duration) {
        // --------------------- INSTANCE:
        this.time = 0;
        this.done = false;
        this.timingMode = Action.DefaultTimingMode;
        this.queued = [];
        this.target = target;
        this.duration = duration;
    }
    // Shortcuts:
    static sequence(actions) {
        return new SequenceAction(actions);
    }
    static group(actions) {
        return new GroupAction(actions);
    }
    static repeat(action, repeats) {
        return new RepeatAction(action, repeats);
    }
    static repeatForever(action) {
        return new RepeatAction(action, -1);
    }
    static moveTo(target, x, y, duration, timingMode) {
        return new MoveToAction(target, x, y, duration, timingMode);
    }
    static moveBy(target, x, y, duration, timingMode) {
        return new MoveByAction(target, x, y, duration, timingMode);
    }
    static fadeTo(target, alpha, duration, timingMode) {
        return new FadeToAction(target, alpha, duration, timingMode);
    }
    static fadeOut(target, duration, timingMode) {
        return this.fadeTo(target, 0, duration, timingMode);
    }
    static fadeOutAndRemove(target, duration, timingMode) {
        return this.sequence([
            this.fadeOut(target, duration, timingMode),
            this.remove(target),
        ]);
    }
    static fadeIn(target, duration, timingMode) {
        return this.fadeTo(target, 1, duration, timingMode);
    }
    static remove(target) {
        return this.runBlock(() => {
            if (target.parent != null)
                target.parent.removeChild(target);
        });
    }
    static delay(duration) {
        return new DelayAction(undefined, duration);
    }
    static runBlock(fn) {
        return new RunBlockAction(fn);
    }
    static scaleTo(target, x, y, duration, timingMode) {
        return new ScaleToAction(target, x, y, duration, timingMode);
    }
    static scaleBy(target, x, y, duration, timingMode) {
        return new ScaleByAction(target, x, y, duration, timingMode);
    }
    static rotateTo(target, rotation, duration, timingMode) {
        return new RotateToAction(target, rotation, duration, timingMode);
    }
    static rotateBy(target, rotation, duration, timingMode) {
        return new RotateByAction(target, rotation, duration, timingMode);
    }
    static clearTargetActions(target) {
        for (let i = this.actions.length - 1; i >= 0; i--) {
            const action = this.actions[i];
            if (action.target === target) {
                this.actions.splice(i, 1);
            }
        }
    }
    static clearAllActions() {
        this.actions = [];
    }
    static play(action) {
        this.actions.push(action);
        return action;
    }
    static pause(action) {
        const index = this.actions.indexOf(action);
        if (index >= 0) {
            this.actions.splice(index, 1);
        }
        return action;
    }
    /**
     * Tick all actions forward.
     */
    static tick(delta) {
        for (let i = this.actions.length - 1; i >= 0; i--) {
            const action = this.actions[i];
            // If the action is targeted, but is no longer on the stage
            // we remove its actions.
            if (action.target !== undefined) {
                if (action.target.parent === undefined) {
                    this.actions.splice(i, 1);
                    continue;
                }
                if (Action.PausedProperty !== undefined && isTargetPaused(action.target)) {
                    // Display object is paused. Skip tick.
                    continue;
                }
            }
            // Otherwise, we tick the action
            const done = action.tick(delta);
            if (done) {
                action.done = true;
                this.actions.splice(i, 1);
                // Are there any queued events?
                for (let j = 0; j < action.queued.length; j++) {
                    this.play(action.queued[j]);
                }
                action.queued = [];
            }
        }
    }
    get timeDistance() {
        return Math.min(1, this.time / this.duration);
    }
    get easedTimeDistance() {
        return this.timingMode(this.timeDistance);
    }
    play() {
        Action.play(this);
        return this;
    }
    pause() {
        Action.pause(this);
        return this;
    }
    queue(next) {
        this.queued.push(next);
        return this;
    }
    reset() {
        this.done = false;
        this.time = 0;
        return this;
    }
    stop() {
        this.pause().reset();
        return this;
    }
}
/** Optionally check a boolean property with this name on display objects. */
Action.PausedProperty = 'paused';
/** Set a global default timing mode. */
Action.DefaultTimingMode = ActionTimingMode.linear;
/** All currently running actions. */
Action.actions = [];
function isTargetPaused(target) {
    var _a;
    let next = target;
    // Check each parent.
    while (next !== undefined) {
        if (((_a = next[Action.PausedProperty]) !== null && _a !== void 0 ? _a : false) === true) {
            return true;
        }
        next = next.parent;
    }
    return false;
}
//# sourceMappingURL=Action.js.map