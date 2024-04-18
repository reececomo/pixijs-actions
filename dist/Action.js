import { TimingMode } from './TimingMode';
/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently (i.e. UI and Game World).
 */
export class Action {
    //
    // ----------------- INSTANCE METHODS -----------------
    //
    constructor(duration, timingMode = Action.DefaultTimingMode, categoryMask = Action.DefaultCategoryMask) {
        this.duration = duration;
        this.timingMode = timingMode;
        this.categoryMask = categoryMask;
        this.speed = 1.0;
        this.time = 0;
        this.isDone = false;
        this.queuedActions = [];
    }
    //
    // ----------------- BUILT-INS -----------------
    //
    /** Infers target from given actions. */
    static sequence(actions) {
        return new SequenceAction(actions);
    }
    /** Infers target from given actions. */
    static group(actions) {
        return new GroupAction(actions);
    }
    /** Infers target from given action. */
    static repeat(action, repeats) {
        return new RepeatAction(action, repeats);
    }
    /** Infers target from given action. */
    static repeatForever(action) {
        return new RepeatAction(action, -1);
    }
    static moveTo(x, y, duration, timingMode) {
        return new MoveToAction(x, y, duration, timingMode);
    }
    static moveBy(x, y, duration, timingMode) {
        return new MoveByAction(x, y, duration, timingMode);
    }
    static fadeTo(alpha, duration, timingMode) {
        return new FadeToAction(alpha, duration, timingMode);
    }
    static fadeOut(duration, timingMode) {
        return Action.fadeTo(0.0, duration, timingMode);
    }
    static fadeOutAndRemoveFromParent(duration, timingMode) {
        return Action.sequence([
            Action.fadeOut(duration, timingMode),
            Action.removeFromParent(),
        ]);
    }
    static fadeIn(duration, timingMode) {
        return this.fadeTo(1.0, duration, timingMode);
    }
    static removeFromParent() {
        return new RemoveFromParentAction();
    }
    static delay(duration) {
        return new DelayAction(duration);
    }
    static runBlock(fn) {
        return new RunBlockAction(fn);
    }
    static scaleTo(x, y, duration, timingMode) {
        return new ScaleToAction(x, y, duration, timingMode);
    }
    static scaleBy(x, y, duration, timingMode) {
        return new ScaleByAction(x, y, duration, timingMode);
    }
    static rotateTo(rotation, duration, timingMode) {
        return new RotateToAction(rotation, duration, timingMode);
    }
    static rotateBy(rotation, duration, timingMode) {
        return new RotateByAction(rotation, duration, timingMode);
    }
    //
    // ----------------- METHODS -----------------
    //
    /** Clear all actions with this target. */
    static removeActionsForTarget(target) {
        for (let i = Action.actions.length - 1; i >= 0; i--) {
            const action = this.actions[i];
            if (action.target === target) {
                Action.actions.splice(i, 1);
            }
        }
    }
    /** Clears all actions. */
    static removeAllActions() {
        Action.actions.splice(0, this.actions.length);
    }
    /** Play an action. */
    static playAction(action) {
        Action.actions.push(action);
        return action;
    }
    /** Stop an action. */
    static stopAction(action) {
        const index = Action.actions.indexOf(action);
        if (index >= 0) {
            Action.actions.splice(index, 1);
        }
        return action;
    }
    /** Tick all actions forward.
     *
     * @param dt Delta time
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static tick(dt, categoryMask = 0x1, onErrorHandler) {
        for (let i = Action.actions.length - 1; i >= 0; i--) {
            const action = Action.actions[i];
            if (categoryMask !== undefined && (categoryMask & action.categoryMask) === 0) {
                continue;
            }
            try {
                Action.tickAction(action, dt);
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
        if (action.target) {
            // If the action is targeted, but is no longer valid or on the stage
            // we garbage collect its actions.
            if (action.target == null
                || action.target.destroyed
                || action.target.parent === undefined) {
                const index = Action.actions.indexOf(action);
                if (index > -1) {
                    Action.actions.splice(index, 1);
                }
                return;
            }
        }
        // Tick the action
        const isDone = action.tick(delta * action.speed);
        if (isDone) {
            action.isDone = true;
            // Remove completed action.
            const index = Action.actions.indexOf(action);
            if (index > -1) {
                Action.actions.splice(index, 1);
            }
            // Check queued actions.
            for (let j = 0; j < action.queuedActions.length; j++) {
                this.playAction(action.queuedActions[j]);
            }
            action.queuedActions = [];
        }
    }
    /** Whether action is in progress */
    get isPlaying() {
        return !this.isDone;
    }
    get timeDistance() {
        return Math.min(1, this.time / this.duration);
    }
    get easedTimeDistance() {
        return this.timingMode(this.timeDistance);
    }
    /** Run an action on this target. */
    runOn(target) {
        this.setTarget(target);
        Action.playAction(this);
        return this;
    }
    queueAction(next) {
        this.queuedActions.push(next);
        return this;
    }
    reset() {
        this.isDone = false;
        this.time = 0;
        return this;
    }
    stop() {
        Action.stopAction(this);
        this.reset();
        return this;
    }
    setCategory(categoryMask) {
        this.categoryMask = categoryMask;
        return this;
    }
    setTarget(target) {
        if (this.target && target !== this.target) {
            console.warn('setTarget() called on Action that already has another target. Recycling actions is currently unsupported. Behavior may be unexpected.');
        }
        this.target = target;
        return this;
    }
}
//
// ----------------- Static -----------------
//
/** All currently running actions. */
Action.actions = [];
/** Set a global default timing mode. */
Action.DefaultTimingMode = TimingMode.linear;
/** Set the global default action category. */
Action.DefaultCategoryMask = 0x1 << 0;
//
// ----------------- BUILT-IN ACTION DEFINITIONS -----------------
//
/** Infers target from given actions. */
export class SequenceAction extends Action {
    constructor(actions) {
        super(
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
    setTarget(target) {
        this.actions.forEach(action => action.setTarget(target));
        return super.setTarget(target);
    }
}
export class ScaleToAction extends Action {
    constructor(x, y, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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
    constructor(x, y, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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
export class RemoveFromParentAction extends Action {
    constructor() {
        super(0);
    }
    tick(delta) {
        var _a, _b;
        if ((_a = this.target) === null || _a === void 0 ? void 0 : _a.parent) {
            (_b = this.target.parent) === null || _b === void 0 ? void 0 : _b.removeChild(this.target);
        }
        return true;
    }
}
export class RunBlockAction extends Action {
    constructor(block) {
        super(0);
        this.block = block;
    }
    tick(delta) {
        this.block.call(this);
        return true;
    }
}
export class RotateToAction extends Action {
    constructor(rotation, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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
    constructor(rotation, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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
        super(
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
    setTarget(target) {
        this.action.setTarget(target);
        return super.setTarget(target);
    }
}
export class MoveToAction extends Action {
    constructor(x, y, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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
    constructor(x, y, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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
/** Infers target from given actions. */
export class GroupAction extends Action {
    constructor(actions) {
        super(
        // Max duration:
        Math.max(...actions.map(action => action.duration)));
        this.index = 0;
        this.actions = actions;
    }
    tick(delta) {
        // Tick all elements!
        let allDone = true;
        for (const action of this.actions) {
            if (action.isDone) {
                continue;
            }
            if (action.tick(delta)) {
                action.isDone = true;
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
    setTarget(target) {
        this.actions.forEach(action => action.setTarget(target));
        return super.setTarget(target);
    }
}
export class FadeToAction extends Action {
    constructor(alpha, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
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