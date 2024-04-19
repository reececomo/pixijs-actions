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
    // ----------------- Action Instance Methods: -----------------
    //
    constructor(duration, timingMode = Action.DefaultTimingMode, categoryMask = Action.DefaultCategoryMask) {
        this.duration = duration;
        this.timingMode = timingMode;
        this.categoryMask = categoryMask;
        /** A speed factor that modifies how fast an action runs. */
        this.speed = 1.0;
        /** Time elapsed in the action. */
        this.elapsed = 0.0;
        /** Whether the action has completed. Set by `Action. */
        this.isDone = false;
        /** Actions that will be triggered when this action completes. */
        this.queuedActions = [];
    }
    //
    // ----------------- Chaining Actions: -----------------
    //
    /** Creates an action that runs a collection of actions sequentially. */
    static sequence(actions) {
        return new SequenceAction(actions);
    }
    /** Creates an action that runs a collection of actions in parallel. */
    static group(actions) {
        return new GroupAction(actions);
    }
    /** Creates an action that repeats another action a specified number of times. */
    static repeat(action, repeats) {
        return new RepeatAction(action, repeats);
    }
    /** Creates an action that repeats another action forever. */
    static repeatForever(action) {
        return new RepeatAction(action, -1);
    }
    //
    // ----------------- Delaying Actions: -----------------
    //
    /** Creates an action that idles for a specified period of time. */
    static waitForDuration(duration) {
        return new DelayAction(duration);
    }
    /**
     * Creates an action that idles for a randomized period of time.
     * The resulting action will wait for averageDuration ± (rangeSize / 2).
     *
     * @param average The average amount of time to wait.
     * @param rangeSize The range of possible values for the duration.
     * @param randomSeed (Optional) A scalar between 0 and 1. Defaults to `Math.random()`.
     *
     * @example Action.waitForDurationWithRange(10.0, 5.0) // duration will be 7.5 -> 12.5
     */
    static waitForDurationWithRange(average, rangeSize, randomSeed) {
        const randomComponent = rangeSize * (randomSeed !== null && randomSeed !== void 0 ? randomSeed : Math.random()) - rangeSize * 0.5;
        return new DelayAction(average + randomComponent);
    }
    //
    // ----------------- Linear Path Actions: -----------------
    //
    /** Creates an action that moves a node relative to its current position. */
    static moveBy(x, y, duration) {
        return new MoveByAction(x, y, duration);
    }
    /** Creates an action that moves a node relative to its current position. */
    static moveByVector(vec, duration) {
        return Action.moveBy(vec.x, vec.y, duration);
    }
    /** Creates an action that moves a node horizontally relative to its current position. */
    static moveByX(x, duration) {
        return Action.moveBy(x, 0, duration);
    }
    /** Creates an action that moves a node vertically relative to its current position. */
    static moveByY(y, duration) {
        return Action.moveBy(0, y, duration);
    }
    /** Creates an action that moves a node to a new position. */
    static moveTo(x, y, duration) {
        return new MoveToAction(x, y, duration);
    }
    /** Creates an action that moves a node to a new position. */
    static moveToPoint(point, duration) {
        return Action.moveTo(point.x, point.y, duration);
    }
    /** Creates an action that moves a node horizontally. */
    static moveToX(x, duration) {
        return new MoveToAction(x, undefined, duration);
    }
    /** Creates an action that moves a node vertically. */
    static moveToY(y, duration) {
        return new MoveToAction(undefined, y, duration);
    }
    //
    // ----------------- Rotation Actions: -----------------
    //
    /** Creates an action that rotates the node by a relative value. */
    static rotateBy(rotation, duration) {
        return new RotateByAction(rotation, duration);
    }
    /** Creates an action that rotates the node to an absolute value. */
    static rotateTo(rotation, duration) {
        return new RotateToAction(rotation, duration);
    }
    //
    // ----------------- Scale Actions: -----------------
    //
    /** Creates an action that changes the x and y scale values of a node by a relative value. */
    static scaleBy(x, y, duration) {
        return new ScaleByAction(x, y, duration);
    }
    /** Creates an action that changes the x and y scale values of a node by a relative value. */
    static scaleBySize(size, duration) {
        return Action.scaleBy(size.x, size.y, duration);
    }
    /** Creates an action that changes the x scale of a node by a relative value. */
    static scaleXBy(x, duration) {
        return Action.scaleBy(x, 0, duration);
    }
    /** Creates an action that changes the y scale of a node by a relative value. */
    static scaleYBy(y, duration) {
        return Action.scaleBy(0, y, duration);
    }
    /** Creates an action that changes the x and y scale values of a node. */
    static scaleTo(x, y, duration) {
        return new ScaleToAction(x, y, duration);
    }
    /** Creates an action that changes the x and y scale values of a node. */
    static scaleToSize(size, duration) {
        return Action.scaleTo(size.x, size.y, duration);
    }
    /** Creates an action that changes the y scale values of a node. */
    static scaleXTo(x, duration) {
        return new ScaleToAction(x, undefined, duration);
    }
    /** Creates an action that changes the x scale values of a node. */
    static scaleYTo(y, duration) {
        return new ScaleToAction(undefined, y, duration);
    }
    //
    // ----------------- Transparency Actions: -----------------
    //
    /** Creates an action that changes the alpha value of the node to 1.0. */
    static fadeIn(duration) {
        return Action.fadeAlphaTo(1, duration);
    }
    /** Creates an action that changes the alpha value of the node to 0.0. */
    static fadeOut(duration) {
        return Action.fadeAlphaTo(0.0, duration);
    }
    /** Creates an action that adjusts the alpha value of a node to a new value. */
    static fadeAlphaTo(alpha, duration) {
        return new FadeToAction(alpha, duration);
    }
    /** Creates an action that adjusts the alpha value of a node by a relative value. */
    static fadeAlphaBy(alpha, duration) {
        return new FadeByAction(alpha, duration);
    }
    //
    // ----------------- Display Object Actions: -----------------
    //
    static removeFromParent() {
        return new RemoveFromParentAction();
    }
    //
    // ----------------- Transparency Actions: -----------------
    //
    /** Creates an action that executes a block. */
    static run(fn) {
        return new RunBlockAction(fn);
    }
    /**
     * Creates an action that executes a stepping function over its duration.
     *
     * The function will be triggered on every redraw until the action completes, and is passed
     * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing mode function).
     */
    static custom(duration, stepFn) {
        return new CustomAction(duration, stepFn);
    }
    //
    // ----------------- Global Methods: -----------------
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
        if (!action.target) {
            console.warn('Action was unexpectedly missing target display object when running!');
        }
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
    /** Whether action is in progress (or has not yet started). */
    get isPlaying() {
        return this.isDone === false;
    }
    /** The relative time elapsed between 0 and 1. */
    get timeDistance() {
        return Math.min(1, this.elapsed / this.duration);
    }
    /**
     * The relative time elapsed between 0 and 1, eased by the timing mode function.
     *
     * Can be a value beyond 0 or 1 depending on the timing mode function.
     */
    get easedTimeDistance() {
        return this.timingMode(this.timeDistance);
    }
    /** Run an action on this target. */
    runOn(target) {
        this.setTarget(target);
        Action.playAction(this);
        return this;
    }
    /** Set an action to run after this action. */
    queueAction(next) {
        this.queuedActions.push(next);
        return this;
    }
    /** Reset an action to the start. */
    reset() {
        this.isDone = false;
        this.elapsed = 0;
        return this;
    }
    /** Stop and reset an action. */
    stop() {
        Action.stopAction(this);
        this.reset();
        return this;
    }
    /** Set a timing mode function for this action. */
    withTimingMode(timingMode) {
        this.timingMode = timingMode;
        return this;
    }
    /** Set a category mask for this action. Used to group different actions together. */
    setCategory(categoryMask) {
        this.categoryMask = categoryMask;
        return this;
    }
    /** Set which display object should be targeted. Internal use only. */
    setTarget(target) {
        if (this.target && target !== this.target) {
            console.warn('setTarget() called on Action that already has another target. Recycling actions is currently unsupported. Behavior may be unexpected.');
        }
        this.target = target;
        return this;
    }
    // ----- Implementation: -----
    /**
     * For relative actions, increments time by delta, and returns the change in easedTimeDistance.
     *
     * @param delta change in time to apply
     * @returns the relative change in easedTimeDistance.
     */
    applyDelta(delta) {
        const before = this.easedTimeDistance;
        this.elapsed += delta;
        return this.easedTimeDistance - before;
    }
}
//
// ----------------- Global Settings: -----------------
//
/** All currently running actions. */
Action.actions = [];
//
// ----------------- Global Settings: -----------------
//
/** Set a global default timing mode. */
Action.DefaultTimingMode = TimingMode.linear;
/** Set the global default action category. */
Action.DefaultCategoryMask = 0x1 << 0;
//
// ----------------- Built-ins: -----------------
//
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
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    tick(delta) {
        if (this.elapsed === 0) {
            this.startX = this.target.scale.x;
            this.startY = this.target.scale.y;
        }
        this.elapsed += delta;
        const factor = this.easedTimeDistance;
        const newXScale = this.x === undefined ? this.target.scale.x : this.startX + (this.x - this.startX) * factor;
        const newYScale = this.y === undefined ? this.target.scale.y : this.startY + (this.y - this.startY) * factor;
        this.target.scale.set(newXScale, newYScale);
        return this.timeDistance >= 1;
    }
}
export class ScaleByAction extends Action {
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    tick(delta) {
        const factorDelta = this.applyDelta(delta);
        this.target.scale.set(this.target.scale.x + this.x * factorDelta, this.target.scale.y + this.y * factorDelta);
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
export class CustomAction extends Action {
    constructor(duration, stepFn) {
        super(duration);
        this.stepFn = stepFn;
    }
    tick(delta) {
        this.elapsed += delta;
        this.stepFn(this.target, this.easedTimeDistance);
        return this.timeDistance >= 1;
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
    constructor(rotation, duration) {
        super(duration);
        this.rotation = rotation;
    }
    tick(delta) {
        if (this.elapsed === 0) {
            this.startRotation = this.target.rotation;
        }
        this.elapsed += delta;
        const factor = this.easedTimeDistance;
        this.target.rotation = this.startRotation + (this.rotation - this.startRotation) * factor;
        return this.timeDistance >= 1;
    }
}
export class RotateByAction extends Action {
    constructor(rotation, duration) {
        super(duration);
        this.rotation = rotation;
    }
    tick(delta) {
        const factorDelta = this.applyDelta(delta);
        this.target.rotation += this.rotation * factorDelta;
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
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    tick(delta) {
        if (this.elapsed === 0) {
            this.startX = this.target.x;
            this.startY = this.target.y;
        }
        this.elapsed += delta;
        const factor = this.easedTimeDistance;
        const newX = this.x === undefined ? this.target.position.x : this.startX + (this.x - this.startX) * factor;
        const newY = this.y === undefined ? this.target.position.y : this.startY + (this.y - this.startY) * factor;
        this.target.position.set(newX, newY);
        return this.timeDistance >= 1;
    }
}
class MoveByAction extends Action {
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    tick(delta) {
        const factorDelta = this.applyDelta(delta);
        if (this.target) {
            this.target.position.x += this.x * factorDelta;
            this.target.position.y += this.y * factorDelta;
        }
        return this.timeDistance >= 1;
    }
}
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
    constructor(alpha, duration) {
        super(duration);
        this.alpha = alpha;
    }
    tick(delta) {
        if (this.elapsed === 0) {
            this.startAlpha = this.target.alpha;
        }
        this.elapsed += delta;
        const factor = this.timingMode(this.timeDistance);
        this.target.alpha = this.startAlpha + (this.alpha - this.startAlpha) * factor;
        return this.timeDistance >= 1;
    }
}
export class FadeByAction extends Action {
    constructor(alpha, duration, timingMode = Action.DefaultTimingMode) {
        super(duration);
        this.alpha = alpha;
    }
    tick(delta) {
        const factorDelta = this.applyDelta(delta);
        this.target.alpha += this.alpha * factorDelta;
        return this.timeDistance >= 1;
    }
}
export class DelayAction extends Action {
    tick(delta) {
        this.elapsed += delta;
        return this.elapsed >= this.duration;
    }
}
//# sourceMappingURL=Action.js.map