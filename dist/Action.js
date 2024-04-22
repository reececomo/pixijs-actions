import { TimingMode } from './TimingMode';
import { getIsPaused, getSpeed } from './util';
const EPSILON = 0.0000000001;
const EPSILON_ONE = 1 - EPSILON;
const DEG_TO_RAD = Math.PI / 180;
const HALF_PI = Math.PI / 2;
//
// ----- Action: -----
//
/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently
 * (i.e. UI and Game World).
 */
export class Action {
    //
    // ----------------- Chaining Actions: -----------------
    //
    /**
     * Creates an action that runs a collection of actions in parallel.
     *
     * When the action executes, the actions that comprise the group all start immediately and run in
     * parallel. The duration of the group action is the longest duration among the collection of
     * actions. If an action in the group has a duration less than the group’s duration, the action
     * completes, then idles until the group completes the remaining actions. This matters most when
     * creating a repeating action that repeats a group.
     *
     * This action is reversible; it creates a new group action that contains the reverse of each
     * action specified in the group.
     */
    static group(actions) {
        return new GroupAction(actions);
    }
    /**
     * Creates an action that runs a collection of actions sequentially.
     *
     * When the action executes, the first action in the sequence starts and runs to completion.
     * Subsequent actions in the sequence run in a similar fashion until all of the actions in the
     * sequence have executed. The duration of the sequence action is the sum of the durations of the
     * actions in the sequence.
     *
     * This action is reversible; it creates a new sequence action that reverses the order of the
     * actions. Each action in the reversed sequence is itself reversed. For example, if an action
     * sequence is {1,2,3}, the reversed sequence would be {3R,2R,1R}.
     */
    static sequence(actions) {
        return new SequenceAction(actions);
    }
    /**
     * Creates an action that repeats another action a specified number of times.
     *
     * When the action executes, the associated action runs to completion and then repeats, until the
     * count is reached.
     *
     * This action is reversible; it creates a new action that is the reverse of the specified action
     * and then repeats it the same number of times.
     */
    static repeat(action, repeats) {
        const length = Math.max(0, Math.round(repeats));
        return Action.sequence(Array.from({ length }, () => action));
    }
    /**
     * Creates an action that repeats another action forever.
     *
     * When the action executes, the associated action runs to completion and then repeats.
     *
     * This action is reversible; it creates a new action that is the reverse of the specified action
     * and then repeats it forever.
     */
    static repeatForever(action) {
        return new RepeatForeverAction(action);
    }
    //
    // ----------------- Delaying Actions: -----------------
    //
    /**
     * Creates an action that idles for a specified period of time.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    static waitForDuration(duration) {
        return new DelayAction(duration);
    }
    /**
     * Creates an action that idles for a randomized period of time.
     * The resulting action will wait for averageDuration ± (rangeSize / 2).
     *
     * @param average The average amount of time to wait.
     * @param rangeSize The range of possible values for the duration.
     *
     * @example Action.waitForDurationWithRange(10.0, 5.0) // duration will be 7.5 -> 12.5
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    static waitForDurationWithRange(average, rangeSize) {
        return new DelayAction(average + (rangeSize * Math.random() - rangeSize * 0.5));
    }
    //
    // ----------------- Linear Path Actions: -----------------
    //
    /**
     * Creates an action that moves a node relative to its current position.
     *
     * This action is reversible.
     */
    static moveBy(x, y, duration) {
        return new MoveByAction(x, y, duration);
    }
    /**
     * Creates an action that moves a node relative to its current position.
     *
     * This action is reversible.
     */
    static moveByVector(vec, duration) {
        return Action.moveBy(vec.x, vec.y, duration);
    }
    /**
     * Creates an action that moves a node horizontally relative to its current position.
     *
     * This action is reversible.
     */
    static moveByX(x, duration) {
        return Action.moveBy(x, 0, duration);
    }
    /**
     * Creates an action that moves a node vertically relative to its current position.
     *
     * This action is reversible.
     */
    static moveByY(y, duration) {
        return Action.moveBy(0, y, duration);
    }
    /**
     * Creates an action that moves a node to a new position.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveTo(x, y, duration) {
        return new MoveToAction(x, y, duration);
    }
    /**
     * Creates an action that moves a node to a new position.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveToPoint(point, duration) {
        return Action.moveTo(point.x, point.y, duration);
    }
    /**
     * Creates an action that moves a node horizontally.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveToX(x, duration) {
        return new MoveToAction(x, undefined, duration);
    }
    /**
     * Creates an action that moves a node vertically.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveToY(y, duration) {
        return new MoveToAction(undefined, y, duration);
    }
    //
    // ----------------- Custom Path Actions: -----------------
    //
    /**
     * Creates an action that moves the node along a path, optionally orienting the node to the path.
     *
     * This action is reversible; the resulting action creates a reversed path and then follows it,
     * with the same duration.
     *
     * @param path A path to follow, or an object containing an array of points called `points`.
     * @param duration The duration of the animation.
     * @param asOffset When true, the path is relative to the node's current position.
     * @param orientToPath When true, the node’s rotation turns to follow the path.
     * @param fixedSpeed When true, the node's speed is consistent across different length segments.
     */
    static followPath(path, duration, asOffset = true, orientToPath = true, fixedSpeed = true) {
        const _path = FollowPathAction.getPath(path);
        return new FollowPathAction(_path, duration, asOffset, orientToPath, fixedSpeed);
    }
    /**
     * Creates an action that moves the node along a path at a specified speed, optionally orienting
     * the node to the path.
     *
     * This action is reversible; the resulting action creates a reversed path and then follows it,
     * with the same speed.
     *
     * @param path A path to follow.
     * @param speed The velocity at which the node should move in world units per second.
     * @param asOffset When true, the path is relative to the node's current position.
     * @param orientToPath If true, the node’s rotation turns to follow the path.
     */
    static followPathAtSpeed(path, speed, asOffset = true, orientToPath = true) {
        const _path = FollowPathAction.getPath(path);
        const _length = FollowPathAction.getLength(_path);
        return new FollowPathAction(_path, _length[0] / speed, asOffset, orientToPath, true);
    }
    //
    // ----------------- Rotation Actions: -----------------
    //
    /**
     * Creates an action that rotates the node by a relative value (in radians).
     *
     * This action is reversible.
     */
    static rotateBy(rotation, duration) {
        return new RotateByAction(rotation, duration);
    }
    /**
     * Creates an action that rotates the node by a relative value (in degrees).
     *
     * This action is reversible.
     */
    static rotateByDegrees(degrees, duration) {
        return Action.rotateBy(degrees * DEG_TO_RAD, duration);
    }
    /**
     * Creates an action that rotates the node to an absolute value (in radians).
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static rotateTo(rotation, duration) {
        return new RotateToAction(rotation, duration);
    }
    /**
     * Creates an action that rotates the node to an absolute value (in degrees).
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static rotateToDegrees(degrees, duration) {
        return Action.rotateTo(degrees * DEG_TO_RAD, duration);
    }
    //
    // ----------------- Speed Actions: -----------------
    //
    /**
     * Creates an action that changes how fast the node executes actions by a relative value.
     *
     * This action is reversible.
     */
    static speedBy(speed, duration) {
        return new SpeedByAction(speed, duration);
    }
    /**
     * Creates an action that changes how fast the node executes actions.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static speedTo(speed, duration) {
        return new SpeedToAction(speed, duration);
    }
    static scaleBy(x, y, duration) {
        return duration === undefined
            ? new ScaleByAction(x, x, y)
            : new ScaleByAction(x, y, duration);
    }
    /**
     * Creates an action that changes the x and y scale values of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleByVector(vector, duration) {
        return Action.scaleBy(vector.x, vector.y, duration);
    }
    /**
     * Creates an action that changes the x scale of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleXBy(x, duration) {
        return Action.scaleBy(x, 0.0, duration);
    }
    /**
     * Creates an action that changes the y scale of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleYBy(y, duration) {
        return Action.scaleBy(0.0, y, duration);
    }
    static scaleTo(x, y, duration) {
        return duration === undefined
            ? new ScaleToAction(x, x, y)
            : new ScaleToAction(x, y, duration);
    }
    /**
     * Creates an action that changes the x and y scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleToSize(size, duration) {
        return Action.scaleTo(size.x, size.y, duration);
    }
    /**
     * Creates an action that changes the y scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleXTo(x, duration) {
        return new ScaleToAction(x, undefined, duration);
    }
    /**
     * Creates an action that changes the x scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleYTo(y, duration) {
        return new ScaleToAction(undefined, y, duration);
    }
    //
    // ----------------- Transparency Actions: -----------------
    //
    /**
     * Creates an action that changes the alpha value of the node to 1.0.
     *
     * This action is reversible. The reverse is equivalent to fadeOut(duration).
     */
    static fadeIn(duration) {
        return new FadeInAction(duration);
    }
    /**
     * Creates an action that changes the alpha value of the node to 0.0.
     *
     * This action is reversible. The reverse is equivalent to fadeIn(duration).
     */
    static fadeOut(duration) {
        return new FadeOutAction(duration);
    }
    /**
     * Creates an action that adjusts the alpha value of a node to a new value.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static fadeAlphaTo(alpha, duration) {
        return new FadeToAction(alpha, duration);
    }
    /**
     * Creates an action that adjusts the alpha value of a node by a relative value.
     *
     * This action is reversible.
     */
    static fadeAlphaBy(alpha, duration) {
        return new FadeByAction(alpha, duration);
    }
    //
    // ----------------- Display Object Actions: -----------------
    //
    /**
     * Creates an action that hides a node.
     *
     * This action has an instantaneous duration. When the action executes, the node’s visible
     * property is set to true.
     *
     * This action is reversible. The reversed action is equivalent to show().
     */
    static hide() {
        return new SetVisibleAction(false);
    }
    /**
     * Creates an action that makes a node visible.
     *
     * This action has an instantaneous duration. When the action executes, the node’s visible
     * property is set to false.
     *
     * This action is reversible. The reversed action is equivalent to hide().
     */
    static unhide() {
        return new SetVisibleAction(true);
    }
    /**
     * Creates an action that removes the node from its parent.
     *
     * This action has an instantaneous duration.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    static removeFromParent() {
        return new RemoveFromParentAction();
    }
    //
    // ----------------- Transparency Actions: -----------------
    //
    /**
     * Creates an action that executes a block.
     *
     * This action takes place instantaneously.
     *
     * This action is not reversible; the reverse action executes the same block.
     */
    static run(fn) {
        return new RunBlockAction(fn);
    }
    /**
     * Creates an action that executes a stepping function over its duration.
     *
     * The function will be triggered on every redraw until the action completes, and is passed
     * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
     * mode function).
     *
     * This action is not reversible; the reverse action executes the same block.
     */
    static customAction(duration, stepFn) {
        return new CustomAction(duration, stepFn);
    }
    //
    // ----------------- Global Methods: -----------------
    //
    /**
     * Tick all actions forward.
     *
     * @param deltaTimeMs Delta time in milliseconds.
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static tick(deltaTimeMs, categoryMask = undefined, onErrorHandler) {
        ActionTicker.stepAllActionsForward(deltaTimeMs, categoryMask, onErrorHandler);
    }
    constructor(duration, speed = 1.0, timingMode = TimingMode.linear, categoryMask = 0x1) {
        this.duration = duration;
        this.speed = speed;
        this.timingMode = timingMode;
        this.categoryMask = categoryMask;
    }
    /** Duration of the action after the speed scalar is applied. */
    get scaledDuration() {
        return this.duration / this.speed;
    }
    /**
     * Do first time setup here.
     *
     * Anything you return here will be available as `ticker.data`.
     */
    _setupTicker(target, ticker) {
        return undefined;
    }
    /** Set the action's speed scale. Defaults to 1.0. */
    setSpeed(speed) {
        this.speed = speed;
        return this;
    }
    /** Set a timing mode function for this action. Defaults to TimingMode.linear. */
    setTimingMode(timingMode) {
        this.timingMode = timingMode;
        return this;
    }
    /**
     * Set a category mask for this action.
     *
     * Use this to tick different categories of actions separately (e.g. separate different UI).
     *
     * @deprecated use speed instead
     */
    setCategory(categoryMask) {
        this.categoryMask = categoryMask;
        return this;
    }
}
//
// ----------------- Global Settings: -----------------
//
/** All currently running actions. */
Action._actions = [];
//
// ----------------- Built-in Actions: -----------------
//
class GroupAction extends Action {
    constructor(actions) {
        super(
        // Max duration:
        Math.max(...actions.map(action => action.scaledDuration)));
        this.index = 0;
        this.actions = actions;
    }
    _setupTicker(target, ticker) {
        ticker.autoComplete = false;
        return {
            childTickers: this.actions.map(action => new ActionTicker(undefined, target, action))
        };
    }
    updateAction(target, progress, progressDelta, ticker, timeDelta) {
        const relativeTimeDelta = timeDelta * this.speed;
        let allDone = true;
        for (const childTicker of ticker.data.childTickers) {
            if (!childTicker.isDone) {
                allDone = false;
                childTicker.stepActionForward(relativeTimeDelta);
            }
        }
        if (allDone) {
            ticker.isDone = true;
        }
    }
    reversed() {
        return new GroupAction(this.actions.map(action => action.reversed()));
    }
}
class SequenceAction extends Action {
    constructor(actions) {
        super(
        // Total duration:
        actions.reduce((total, action) => total + action.scaledDuration, 0));
        this.actions = actions;
    }
    _setupTicker(target, ticker) {
        ticker.autoComplete = false;
        return {
            childTickers: this.actions.map(action => new ActionTicker(undefined, target, action))
        };
    }
    updateAction(target, progress, progressDelta, ticker, timeDelta) {
        let allDone = true;
        let remainingTimeDelta = timeDelta * this.speed;
        for (const childTicker of ticker.data.childTickers) {
            if (!childTicker.isDone) {
                if (remainingTimeDelta > 0 || childTicker.duration === 0) {
                    remainingTimeDelta = childTicker.stepActionForward(remainingTimeDelta);
                }
                else {
                    allDone = false;
                    break;
                }
                if (remainingTimeDelta < 0) {
                    allDone = false;
                    break;
                }
            }
        }
        if (allDone) {
            ticker.isDone = true;
        }
    }
    reversed() {
        const reversedSequence = [...this.actions].reverse().map(action => action.reversed());
        return new SequenceAction(reversedSequence);
    }
}
class RepeatForeverAction extends Action {
    constructor(action) {
        super(Infinity);
        this.action = action;
        if (action.duration <= 0) {
            throw new Error('The action to be repeated must have a non-instantaneous duration.');
        }
    }
    reversed() {
        return new RepeatForeverAction(this.action.reversed());
    }
    _setupTicker(target, ticker) {
        return {
            childTicker: new ActionTicker(undefined, target, this.action)
        };
    }
    updateAction(target, progress, progressDelta, ticker, timeDelta) {
        let childTicker = ticker.data.childTicker;
        let remainingTimeDelta = timeDelta * this.speed;
        remainingTimeDelta = childTicker.stepActionForward(remainingTimeDelta);
        if (remainingTimeDelta > 0) {
            childTicker.elapsed = 0.0; // reset
            childTicker.stepActionForward(remainingTimeDelta);
        }
    }
}
class ScaleToAction extends Action {
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    _setupTicker(target, ticker) {
        return {
            startX: target.scale.x,
            startY: target.scale.y
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.scale.set(this.x === undefined ? target.scale.x : ticker.data.startX + (this.x - ticker.data.startX) * progress, this.y === undefined ? target.scale.y : ticker.data.startY + (this.y - ticker.data.startY) * progress);
    }
    reversed() {
        return new DelayAction(this.scaledDuration);
    }
}
class ScaleByAction extends Action {
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    _setupTicker(target, ticker) {
        return {
            dx: target.scale.x * this.x - target.scale.x,
            dy: target.scale.y * this.y - target.scale.y
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.scale.set(target.scale.x + ticker.data.dx * progressDelta, target.scale.y + ticker.data.dy * progressDelta);
    }
    reversed() {
        return new ScaleByAction(-this.x, -this.y, this.duration)
            .setSpeed(this.speed)
            .setTimingMode(this.timingMode);
    }
}
class SetVisibleAction extends Action {
    constructor(visible) {
        super(0);
        this.visible = visible;
    }
    updateAction(target) {
        target.visible = this.visible;
    }
    reversed() {
        return new SetVisibleAction(!this.visible);
    }
}
class RemoveFromParentAction extends Action {
    constructor() {
        super(0);
    }
    updateAction(target) {
        var _a;
        (_a = target.parent) === null || _a === void 0 ? void 0 : _a.removeChild(target);
    }
    reversed() {
        return this;
    }
}
class CustomAction extends Action {
    constructor(duration, stepFn) {
        super(duration);
        this.stepFn = stepFn;
    }
    updateAction(target, progress, progressDelta) {
        this.stepFn(target, progress, progressDelta);
    }
    reversed() {
        return this;
    }
}
class RunBlockAction extends Action {
    constructor(block) {
        super(0);
        this.block = block;
    }
    updateAction(target, progress, progressDelta) {
        this.block();
    }
    reversed() {
        return this;
    }
}
class SpeedToAction extends Action {
    constructor(_speed, duration) {
        super(duration);
        this._speed = _speed;
    }
    _setupTicker(target, ticker) {
        return {
            startSpeed: target.speed
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.rotation = ticker.data.startRotation + (this._speed - ticker.data.startSpeed) * progress;
    }
    reversed() {
        return new DelayAction(this.scaledDuration);
    }
}
class SpeedByAction extends Action {
    constructor(_speed, duration) {
        super(duration);
        this._speed = _speed;
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.rotation += this._speed * progressDelta;
    }
    reversed() {
        return new SpeedByAction(-this._speed, this.duration);
    }
}
class FollowPathAction extends Action {
    constructor(path, duration, asOffset, orientToPath, fixedSpeed) {
        super(duration);
        this.asOffset = asOffset;
        this.orientToPath = orientToPath;
        this.fixedSpeed = fixedSpeed;
        this.path = path;
        this.lastIndex = path.length - 1;
        // Precalculate segment lengths, if needed.
        if (orientToPath || fixedSpeed) {
            const [totalDist, segmentLengths] = FollowPathAction.getLength(path);
            this.segmentLengths = segmentLengths;
            if (fixedSpeed) {
                this.segmentWeights = segmentLengths.map(v => v / (totalDist || 1));
            }
        }
    }
    // ----- Static helpers: -----
    static getPath(path) {
        return Array.isArray(path) ? [...path] : [...path.points];
    }
    static getLength(path) {
        let totalLength = 0;
        const segmentLengths = [];
        for (let i = 0; i < path.length - 1; i++) {
            const directionX = path[i + 1].x - path[i].x;
            const directionY = path[i + 1].y - path[i].y;
            const length = Math.sqrt(directionX * directionX + directionY * directionY);
            segmentLengths.push(length);
            totalLength += length;
        }
        return [totalLength, segmentLengths];
    }
    // ----- Methods: -----
    updateAction(target, progress, progressDelta, ticker) {
        var _a;
        if (this.lastIndex < 0) {
            return; // Empty path.
        }
        const [index, t] = this.fixedSpeed
            ? this._getFixedSpeedProgress(progress)
            : this._getDynamicSpeedProgress(progress);
        const startPoint = this.path[index];
        const endPoint = (_a = this.path[index + 1]) !== null && _a !== void 0 ? _a : startPoint;
        target.position.set(ticker.data.x + startPoint.x + (endPoint.x - startPoint.x) * t, ticker.data.y + startPoint.y + (endPoint.y - startPoint.y) * t);
        if (this.orientToPath) {
            const length = this.segmentLengths[index] || 1;
            const ndx = (endPoint.x - startPoint.x) / length;
            const ndy = (endPoint.y - startPoint.y) / length;
            const rotation = HALF_PI + Math.atan2(ndy, ndx);
            target.rotation = rotation;
        }
    }
    reversed() {
        return new FollowPathAction(this._reversePath(), this.duration, this.asOffset, this.orientToPath, this.fixedSpeed)
            .setTimingMode(this.timingMode)
            .setSpeed(this.speed);
    }
    _setupTicker(target) {
        return {
            x: this.asOffset ? target.x : 0,
            y: this.asOffset ? target.y : 0,
        };
    }
    _reversePath() {
        if (this.asOffset && this.path.length > 0) {
            // Calculate the relative delta offset when first and last are flipped.
            const first = this.path[0], last = this.path[this.path.length - 1];
            const dx = last.x + first.x, dy = last.y + first.y;
            return this.path.map(({ x, y }) => ({ x: x - dx, y: y - dy })).reverse();
        }
        // Absolute path is the path backwards.
        return [...this.path].reverse();
    }
    _getDynamicSpeedProgress(progress) {
        const index = Math.max(Math.min(Math.floor(progress * this.lastIndex), this.lastIndex - 1), 0);
        const lastIndexNonZero = this.lastIndex || 1;
        const t = (progress - index / lastIndexNonZero) * lastIndexNonZero;
        return [index, t];
    }
    _getFixedSpeedProgress(progress) {
        let remainingProgress = progress;
        let index = 0;
        let t = 0;
        for (let i = 0; i < this.lastIndex; i++) {
            const segmentWeight = this.segmentWeights[i];
            if (segmentWeight > remainingProgress || i === this.lastIndex - 1) {
                t = remainingProgress / segmentWeight || 1;
                break;
            }
            remainingProgress -= segmentWeight;
            index++;
        }
        return [index, t];
    }
}
class RotateToAction extends Action {
    constructor(rotation, duration) {
        super(duration);
        this.rotation = rotation;
    }
    _setupTicker(target, ticker) {
        return {
            startRotation: target.rotation
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.rotation = ticker.data.startRotation + (this.rotation - ticker.data.startRotation) * progress;
    }
    reversed() {
        return new DelayAction(this.scaledDuration);
    }
}
class RotateByAction extends Action {
    constructor(rotation, duration) {
        super(duration);
        this.rotation = rotation;
    }
    updateAction(target, progress, progressDelta) {
        target.rotation += this.rotation * progressDelta;
    }
    reversed() {
        return new RotateByAction(-this.rotation, this.duration)
            .setSpeed(this.speed)
            .setTimingMode(this.timingMode);
    }
}
class MoveToAction extends Action {
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    _setupTicker(target, ticker) {
        return {
            startX: target.x,
            startY: target.y
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.position.set(this.x === undefined ? target.position.x : ticker.data.startX + (this.x - ticker.data.startX) * progress, this.y === undefined ? target.position.y : ticker.data.startY + (this.y - ticker.data.startY) * progress);
    }
    reversed() {
        return new DelayAction(this.scaledDuration);
    }
}
class MoveByAction extends Action {
    constructor(x, y, duration) {
        super(duration);
        this.x = x;
        this.y = y;
    }
    updateAction(target, progress, progressDelta) {
        target.position.x += this.x * progressDelta;
        target.position.y += this.y * progressDelta;
    }
    reversed() {
        return new MoveByAction(-this.x, -this.y, this.duration)
            .setSpeed(this.speed)
            .setTimingMode(this.timingMode);
    }
}
class FadeToAction extends Action {
    constructor(alpha, duration) {
        super(duration);
        this.alpha = alpha;
    }
    _setupTicker(target, ticker) {
        return {
            startAlpha: target.alpha
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.alpha = ticker.data.startAlpha + (this.alpha - ticker.data.startAlpha) * progress;
    }
    reversed() {
        return new DelayAction(this.scaledDuration);
    }
}
class FadeInAction extends Action {
    _setupTicker(target, ticker) {
        return {
            startAlpha: target.alpha
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.alpha = ticker.data.startAlpha + (1.0 - ticker.data.startAlpha) * progress;
    }
    reversed() {
        return new FadeOutAction(this.duration)
            .setSpeed(this.speed)
            .setTimingMode(this.timingMode);
    }
}
class FadeOutAction extends Action {
    _setupTicker(target, ticker) {
        return {
            startAlpha: target.alpha
        };
    }
    updateAction(target, progress, progressDelta, ticker) {
        target.alpha = ticker.data.startAlpha + (0.0 - ticker.data.startAlpha) * progress;
    }
    reversed() {
        return new FadeInAction(this.duration)
            .setSpeed(this.speed)
            .setTimingMode(this.timingMode);
    }
}
class FadeByAction extends Action {
    constructor(alpha, duration) {
        super(duration);
        this.alpha = alpha;
    }
    updateAction(target, progress, progressDelta) {
        target.alpha += this.alpha * progressDelta;
    }
    reversed() {
        return new FadeByAction(-this.alpha, this.duration)
            .setSpeed(this.speed)
            .setTimingMode(this.timingMode);
    }
}
class DelayAction extends Action {
    updateAction() {
        // Idle
    }
    reversed() {
        return this;
    }
}
//
// ----- Action Ticker: -----
//
class ActionTicker {
    static runAction(key, target, action) {
        if (key !== undefined) {
            const existingAction = this._running
                .find(a => a.target === target && a.key === key);
            if (existingAction !== undefined) {
                ActionTicker.removeAction(existingAction);
            }
        }
        this._running.push(new ActionTicker(key, target, action));
    }
    static removeAction(actionTicker) {
        const index = ActionTicker._running.indexOf(actionTicker);
        if (index >= 0) {
            ActionTicker._running.splice(index, 1);
        }
        return actionTicker;
    }
    static hasTargetActions(target) {
        return ActionTicker._running.find(at => at.target === target) !== undefined;
    }
    static getTargetActionTickerForKey(target, key) {
        return ActionTicker._running.find(at => at.target === target && at.key === key);
    }
    static getTargetActionForKey(target, key) {
        var _a;
        return (_a = this.getTargetActionTickerForKey(target, key)) === null || _a === void 0 ? void 0 : _a.action;
    }
    static removeTargetActionForKey(target, key) {
        const actionTicker = this.getTargetActionTickerForKey(target, key);
        if (!actionTicker) {
            return;
        }
        ActionTicker.removeAction(actionTicker);
    }
    static removeAllTargetActions(target) {
        for (let i = ActionTicker._running.length - 1; i >= 0; i--) {
            const actionTicker = ActionTicker._running[i];
            if (actionTicker.target === target) {
                ActionTicker.removeAction(actionTicker);
            }
        }
    }
    /**
     * Tick all actions forward.
     *
     * @param deltaTimeMs Delta time given in milliseconds.
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static stepAllActionsForward(deltaTimeMs, categoryMask = undefined, onErrorHandler) {
        const deltaTime = deltaTimeMs * 0.001;
        for (let i = ActionTicker._running.length - 1; i >= 0; i--) {
            const actionTicker = ActionTicker._running[i];
            if (categoryMask !== undefined && (categoryMask & actionTicker.action.categoryMask) === 0) {
                continue;
            }
            if (getIsPaused(actionTicker.target)) {
                continue;
            }
            try {
                actionTicker.stepActionForward(deltaTime * getSpeed(actionTicker.target));
            }
            catch (error) {
                // Isolate individual action errors.
                if (onErrorHandler === undefined) {
                    console.error('Action failed with error: ', error);
                }
                else {
                    onErrorHandler(error);
                }
                // Remove offending ticker.
                ActionTicker.removeAction(actionTicker);
            }
        }
    }
    constructor(key, target, action) {
        this.key = key;
        this.target = target;
        this.action = action;
        /** Time elapsed in the action. */
        this.elapsed = 0.0;
        /** Whether the action ticker has been setup. This is triggered on the first iteration. */
        this.isSetup = false;
        /** Whether the action has completed. */
        this.isDone = false;
        /** Whether the action ticker will mark the action as done when time elapsed >= duration. */
        this.autoComplete = true;
        this.speed = action.speed;
        this.duration = action.scaledDuration;
    }
    /** Whether action is in progress (or has not yet started). */
    get isPlaying() {
        return this.isDone === false;
    }
    /** The relative time elapsed between 0 and 1. */
    get timeDistance() {
        return this.duration === 0 ? 1 : Math.min(1, this.elapsed / this.action.scaledDuration);
    }
    /**
     * The relative time elapsed between 0 and 1, eased by the timing mode function.
     *
     * Can be a value beyond 0 or 1 depending on the timing mode function.
     */
    get easedTimeDistance() {
        return this.action.timingMode(this.timeDistance);
    }
    /** @returns Any unused time delta. Negative value means action is still in progress. */
    stepActionForward(timeDelta) {
        if (!this.isSetup) {
            this.speed = this.action.speed;
            this.duration = this.action.duration;
            this.data = this.action._setupTicker(this.target, this);
            this.isSetup = true;
        }
        const target = this.target;
        const action = this.action;
        // If action no longer valid, or target not on the stage
        // we garbage collect its actions.
        if (target == null
            || target.destroyed
            || target.parent === undefined) {
            ActionTicker.removeAction(this);
            return;
        }
        const scaledTimeDelta = timeDelta * this.speed /* target speed is applied at the root */;
        if (this.duration === 0) {
            // Instantaneous action.
            action.updateAction(this.target, 1.0, 1.0, this, scaledTimeDelta);
            this.isDone = true;
            // Remove completed action.
            ActionTicker.removeAction(this);
            return timeDelta; // relinquish the full time.
        }
        if (timeDelta === 0) {
            return -1; // Early exit, no progress.
        }
        const beforeProgress = this.easedTimeDistance;
        this.elapsed += scaledTimeDelta;
        const progress = this.easedTimeDistance;
        const progressDelta = progress - beforeProgress;
        action.updateAction(this.target, progress, progressDelta, this, scaledTimeDelta);
        if (this.isDone || (this.autoComplete && this.timeDistance >= EPSILON_ONE)) {
            this.isDone = true;
            // Remove completed action.
            ActionTicker.removeAction(this);
            return this.elapsed > this.duration ? this.elapsed - this.duration : 0;
        }
        return -1; // relinquish no time
    }
}
ActionTicker._running = [];
//
// ----- Global Mixin: -----
//
/**
 * Register the global mixins for PIXI.DisplayObject.
 *
 * @param displayObject A reference to `PIXI.DisplayObject`.
 */
export function registerGlobalMixin(displayObject) {
    const _prototype = displayObject.prototype;
    // - Properties:
    _prototype.speed = 1.0;
    _prototype.isPaused = false;
    // - Methods:
    _prototype.run = function (_action, completion) {
        const action = completion ? Action.sequence([_action, Action.run(completion)]) : _action;
        ActionTicker.runAction(undefined, this, action);
    };
    _prototype.runWithKey = function (action, key) {
        ActionTicker.runAction(key, this, action);
    };
    _prototype.runAsPromise = function (action, timeoutBufferMs = 100) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const node = this;
        return new Promise(function (resolve, reject) {
            const timeLimitMs = timeoutBufferMs + (node.speed * action.duration * 1000);
            const timeoutCheck = setTimeout(() => reject('Took too long to complete.'), timeLimitMs);
            node.run(action, () => {
                clearTimeout(timeoutCheck);
                resolve();
            });
        });
    };
    _prototype.action = function (forKey) {
        return ActionTicker.getTargetActionForKey(this, forKey);
    };
    _prototype.hasActions = function () {
        return ActionTicker.hasTargetActions(this);
    };
    _prototype.removeAllActions = function () {
        ActionTicker.removeAllTargetActions(this);
    };
    _prototype.removeAction = function (forKey) {
        ActionTicker.removeTargetActionForKey(this, forKey);
    };
}
//# sourceMappingURL=Action.js.map