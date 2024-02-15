import { TimingMode } from './TimingMode';
/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(deltaTime)} to update actions.
 */
export class Action {
    //
    // ----------------- INSTANCE METHODS -----------------
    //
    constructor(target, duration) {
        //
        // ----------------- INSTANCE PROPERTIES -----------------
        //
        this.time = 0;
        this.done = false;
        this.timingMode = Action.DefaultTimingMode;
        this.queued = [];
        this.target = target;
        this.duration = duration;
        this.isTargeted = target !== undefined;
    }
    //
    // ----------------- BUILT-INS -----------------
    //
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
            if (target.parent) {
                target.parent.removeChild(target);
            }
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
    //
    // ----------------- METHODS -----------------
    //
    /** Clear all actions with this target. */
    static clearTargetActions(target) {
        for (let i = this.actions.length - 1; i >= 0; i--) {
            const action = this.actions[i];
            if (action.target === target) {
                this.actions.splice(i, 1);
            }
        }
    }
    /** Clear all actions. */
    static clearAllActions() {
        this.actions.splice(0, this.actions.length);
    }
    /** Play an action. */
    static play(action) {
        this.actions.push(action);
        return action;
    }
    /** Pause an action. */
    static pause(action) {
        const index = this.actions.indexOf(action);
        if (index >= 0) {
            this.actions.splice(index, 1);
        }
        return action;
    }
    /** Tick all actions forward. */
    static tick(delta, onErrorHandler) {
        for (let i = this.actions.length - 1; i >= 0; i--) {
            const action = this.actions[i];
            try {
                this.tickAction(action, delta);
            }
            catch (error) {
                // Isolate individual action errors.
                if (onErrorHandler !== undefined) {
                    onErrorHandler(error);
                }
            }
        }
    }
    static tickAction(action, delta) {
        if (action.isTargeted || action.target) {
            // If the action is targeted, but is no longer valid or on the stage
            // we garbage collect its actions.
            if (action.target == null
                || action.target.destroyed
                || action.target.parent === undefined) {
                const index = this.actions.indexOf(action);
                if (index > -1) {
                    this.actions.splice(index, 1);
                }
                return;
            }
            if (Action.PausedProperty !== undefined && isTargetPaused(action.target)) {
                // Display object is paused. Skip tick.
                return;
            }
        }
        // Otherwise, we tick the action
        const done = action.tick(delta);
        if (done) {
            action.done = true;
            // Remove this action.
            const index = this.actions.indexOf(action);
            if (index > -1) {
                this.actions.splice(index, 1);
            }
            // Are there any queued events?
            for (let j = 0; j < action.queued.length; j++) {
                this.play(action.queued[j]);
            }
            action.queued = [];
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
//
// ----------------- Static -----------------
//
/** All currently running actions. */
Action.actions = [];
/** Optionally check a boolean property with this name on display objects. */
Action.PausedProperty = 'paused';
/** Set a global default timing mode. */
Action.DefaultTimingMode = TimingMode.linear;
/** Helper method to check if a target is paused. */
function isTargetPaused(target) {
    var _a;
    let next = target;
    // Check each parent.
    while (next) {
        if (Action.PausedProperty !== undefined && ((_a = next[Action.PausedProperty]) !== null && _a !== void 0 ? _a : false) === true) {
            return true;
        }
        next = next.parent;
    }
    return false;
}
//
// ----------------- BUILT-IN ACTION DEFINITIONS -----------------
//
export class SequenceAction extends Action {
    constructor(actions) {
        super(undefined, 
        // Total duration:
        actions.reduce((total, action) => total + action.duration, 0));
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
        return false;
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
export class ScaleToAction extends Action {
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
        this.target.scale.set(this.startX + (this.x - this.startX) * factor, this.startY + (this.y - this.startY) * factor);
        return this.timeDistance >= 1;
    }
}
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
export class RotateByAction extends Action {
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
        this.target.rotation = this.startRotation + this.rotation * factor;
        return this.timeDistance >= 1;
    }
}
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
export class MoveToAction extends Action {
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
        this.target.position.set(this.startX + (this.x - this.startX) * factor, this.startY + (this.y - this.startY) * factor);
        return this.timeDistance >= 1;
    }
}
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
export class GroupAction extends Action {
    constructor(actions) {
        super(undefined, 
        // Max duration:
        Math.max(...actions.map(action => action.duration)));
        this.index = 0;
        this.actions = actions;
    }
    tick(delta) {
        // Tick all elements!
        let allDone = true;
        for (const action of this.actions) {
            if (action.done) {
                continue;
            }
            if (action.tick(delta)) {
                action.done = true;
            }
            else {
                allDone = false;
            }
        }
        return allDone;
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
export class DelayAction extends Action {
    tick(delta) {
        this.time += delta;
        return this.time >= this.duration;
    }
}
//# sourceMappingURL=Action.js.map