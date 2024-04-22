import * as PIXI from 'pixi.js';
import { TimingModeFn } from './TimingMode';
/** Time measured in seconds. */
type TimeInterval = number;
/** Targeted display node. */
type TargetNode = PIXI.DisplayObject;
/** Any two dimensional vector. */
interface VectorLike {
    x: number;
    y: number;
}
/** Any object containing an array of points. */
interface PathLike {
    points: VectorLike[];
}
/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently
 * (i.e. UI and Game World).
 */
export declare abstract class Action {
    readonly duration: TimeInterval;
    speed: number;
    timingMode: TimingModeFn;
    categoryMask: number;
    /** All currently running actions. */
    protected static readonly _actions: Action[];
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
    static group(actions: Action[]): Action;
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
    static sequence(actions: Action[]): Action;
    /**
     * Creates an action that repeats another action a specified number of times.
     *
     * When the action executes, the associated action runs to completion and then repeats, until the
     * count is reached.
     *
     * This action is reversible; it creates a new action that is the reverse of the specified action
     * and then repeats it the same number of times.
     */
    static repeat(action: Action, repeats: number): Action;
    /**
     * Creates an action that repeats another action forever.
     *
     * When the action executes, the associated action runs to completion and then repeats.
     *
     * This action is reversible; it creates a new action that is the reverse of the specified action
     * and then repeats it forever.
     */
    static repeatForever(action: Action): Action;
    /**
     * Creates an action that idles for a specified period of time.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    static waitForDuration(duration: TimeInterval): Action;
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
    static waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval): Action;
    /**
     * Creates an action that moves a node relative to its current position.
     *
     * This action is reversible.
     */
    static moveBy(x: number, y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node relative to its current position.
     *
     * This action is reversible.
     */
    static moveByVector(vec: VectorLike, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node horizontally relative to its current position.
     *
     * This action is reversible.
     */
    static moveByX(x: number, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node vertically relative to its current position.
     *
     * This action is reversible.
     */
    static moveByY(y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node to a new position.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveTo(x: number, y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node to a new position.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveToPoint(point: VectorLike, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node horizontally.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveToX(x: number, duration: TimeInterval): Action;
    /**
     * Creates an action that moves a node vertically.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * move the node.
     */
    static moveToY(y: number, duration: TimeInterval): Action;
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
    static followPath(path: VectorLike[] | PathLike, duration: number, asOffset?: boolean, orientToPath?: boolean, fixedSpeed?: boolean): Action;
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
    static followPathAtSpeed(path: VectorLike[] | PathLike, speed: number, asOffset?: boolean, orientToPath?: boolean): Action;
    /**
     * Creates an action that rotates the node by a relative value (in radians).
     *
     * This action is reversible.
     */
    static rotateBy(rotation: number, duration: TimeInterval): Action;
    /**
     * Creates an action that rotates the node by a relative value (in degrees).
     *
     * This action is reversible.
     */
    static rotateByDegrees(degrees: number, duration: TimeInterval): Action;
    /**
     * Creates an action that rotates the node to an absolute value (in radians).
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static rotateTo(rotation: number, duration: TimeInterval): Action;
    /**
     * Creates an action that rotates the node to an absolute value (in degrees).
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static rotateToDegrees(degrees: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes how fast the node executes actions by a relative value.
     *
     * This action is reversible.
     */
    static speedBy(speed: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes how fast the node executes actions.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static speedTo(speed: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the scale of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleBy(value: number, duration: TimeInterval): Action;
    static scaleBy(x: number, y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the x and y scale values of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleByVector(vector: VectorLike, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the x scale of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleXBy(x: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the y scale of a node by a relative value.
     *
     * This action is reversible.
     */
    static scaleYBy(y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the x and y scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleTo(value: number, duration: TimeInterval): Action;
    static scaleTo(x: number, y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the x and y scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleToSize(size: VectorLike, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the y scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleXTo(x: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the x scale values of a node.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static scaleYTo(y: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the alpha value of the node to 1.0.
     *
     * This action is reversible. The reverse is equivalent to fadeOut(duration).
     */
    static fadeIn(duration: TimeInterval): Action;
    /**
     * Creates an action that changes the alpha value of the node to 0.0.
     *
     * This action is reversible. The reverse is equivalent to fadeIn(duration).
     */
    static fadeOut(duration: TimeInterval): Action;
    /**
     * Creates an action that adjusts the alpha value of a node to a new value.
     *
     * This action is not reversible; the reverse of this action has the same duration but does not
     * change anything.
     */
    static fadeAlphaTo(alpha: number, duration: TimeInterval): Action;
    /**
     * Creates an action that adjusts the alpha value of a node by a relative value.
     *
     * This action is reversible.
     */
    static fadeAlphaBy(alpha: number, duration: TimeInterval): Action;
    /**
     * Creates an action that hides a node.
     *
     * This action has an instantaneous duration. When the action executes, the node’s visible
     * property is set to true.
     *
     * This action is reversible. The reversed action is equivalent to show().
     */
    static hide(): Action;
    /**
     * Creates an action that makes a node visible.
     *
     * This action has an instantaneous duration. When the action executes, the node’s visible
     * property is set to false.
     *
     * This action is reversible. The reversed action is equivalent to hide().
     */
    static unhide(): Action;
    /**
     * Creates an action that removes the node from its parent.
     *
     * This action has an instantaneous duration.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    static removeFromParent(): Action;
    /**
     * Creates an action that executes a block.
     *
     * This action takes place instantaneously.
     *
     * This action is not reversible; the reverse action executes the same block.
     */
    static run(fn: () => void): Action;
    /**
     * Creates an action that executes a stepping function over its duration.
     *
     * The function will be triggered on every redraw until the action completes, and is passed
     * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
     * mode function).
     *
     * This action is not reversible; the reverse action executes the same block.
     */
    static customAction(duration: number, stepFn: (target: TargetNode, x: number) => void): Action;
    /**
     * Tick all actions forward.
     *
     * @param deltaTimeMs Delta time in milliseconds.
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static tick(deltaTimeMs: number, categoryMask?: number | undefined, onErrorHandler?: (error: any) => void): void;
    constructor(duration: TimeInterval, speed?: number, timingMode?: TimingModeFn, categoryMask?: number);
    /**
     * Update function for the action.
     *
     * @param target The affected display object.
     * @param progress The elapsed progress of the action, with the timing mode function applied. Generally a scalar number between 0.0 and 1.0.
     * @param progressDelta Relative change in progress since the previous animation change. Use this for relative actions.
     * @param actionTicker The actual ticker running this update.
     * @param deltaTime The amount of time elapsed in this tick. This number is scaled by both speed of target and any parent actions.
     */
    abstract updateAction(target: TargetNode, progress: number, progressDelta: number, actionTicker: ActionTicker, deltaTime: number): void;
    /** Duration of the action after the speed scalar is applied. */
    get scaledDuration(): number;
    /**
     * Creates an action that reverses the behavior of another action.
     *
     * This method always returns an action object; however, not all actions are reversible.
     * When reversed, some actions return an object that either does nothing or that performs the same action as the original action.
     */
    abstract reversed(): Action;
    /**
     * Do first time setup here.
     *
     * Anything you return here will be available as `ticker.data`.
     */
    protected _setupTicker(target: TargetNode, ticker: ActionTicker): any;
    /** Set the action's speed scale. Defaults to 1.0. */
    setSpeed(speed: number): this;
    /** Set a timing mode function for this action. Defaults to TimingMode.linear. */
    setTimingMode(timingMode: TimingModeFn): this;
    /**
     * Set a category mask for this action.
     *
     * Use this to tick different categories of actions separately (e.g. separate different UI).
     *
     * @deprecated use speed instead
     */
    setCategory(categoryMask: number): this;
}
export declare class FollowPathAction extends Action {
    protected readonly asOffset: boolean;
    protected readonly orientToPath: boolean;
    protected readonly fixedSpeed: boolean;
    protected readonly path: VectorLike[];
    protected readonly segmentLengths: number[];
    protected readonly segmentWeights: number[];
    protected lastIndex: number;
    static getPath(path: VectorLike[] | PathLike): VectorLike[];
    static getLength(path: VectorLike[]): [length: number, segmentLengths: number[]];
    constructor(path: VectorLike[], duration: number, asOffset: boolean, orientToPath: boolean, fixedSpeed: boolean);
    updateAction(target: any, progress: number, progressDelta: number, ticker: any): void;
    reversed(): Action;
    protected _setupTicker(target: TargetNode): any;
    protected _reversePath(): VectorLike[];
    protected _getDynamicSpeedProgress(progress: number): [index: number, t: number];
    protected _getFixedSpeedProgress(progress: number): [index: number, t: number];
}
declare class ActionTicker {
    key: string | undefined;
    target: TargetNode;
    action: Action;
    protected static _running: ActionTicker[];
    static runAction(key: string | undefined, target: TargetNode, action: Action): void;
    static removeAction(actionTicker: ActionTicker): ActionTicker;
    static hasTargetActions(target: TargetNode): boolean;
    static getTargetActionTickerForKey(target: TargetNode, key: string): ActionTicker | undefined;
    static getTargetActionForKey(target: TargetNode, key: string): Action | undefined;
    static removeTargetActionForKey(target: TargetNode, key: string): void;
    static removeAllTargetActions(target: TargetNode): void;
    /**
     * Tick all actions forward.
     *
     * @param deltaTimeMs Delta time given in milliseconds.
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static stepAllActionsForward(deltaTimeMs: number, categoryMask?: number | undefined, onErrorHandler?: (error: any) => void): void;
    /** Any instance data that will live for the duration of the ticker. */
    data: any;
    /** Time elapsed in the action. */
    elapsed: number;
    /** Whether the action ticker has been setup. This is triggered on the first iteration. */
    isSetup: boolean;
    /** Whether the action has completed. */
    isDone: boolean;
    /** Whether the action ticker will mark the action as done when time elapsed >= duration. */
    autoComplete: boolean;
    /**
     * Relative speed of the action ticker.
     *
     * Defaults to the action's speed and is capture at creation time, and updated on
     * the setup tick.
     */
    speed: number;
    /**
     * Expected duration of the action ticker.
     *
     * Defaults to the action's scaled duration and is capture at creation time, and updated on
     * the setup tick.
     */
    duration: number;
    constructor(key: string | undefined, target: TargetNode, action: Action);
    /** Whether action is in progress (or has not yet started). */
    get isPlaying(): boolean;
    /** The relative time elapsed between 0 and 1. */
    get timeDistance(): number;
    /**
     * The relative time elapsed between 0 and 1, eased by the timing mode function.
     *
     * Can be a value beyond 0 or 1 depending on the timing mode function.
     */
    protected get easedTimeDistance(): number;
    /** @returns Any unused time delta. Negative value means action is still in progress. */
    stepActionForward(timeDelta: number): number;
}
/**
 * Register the global mixins for PIXI.DisplayObject.
 *
 * @param displayObject A reference to `PIXI.DisplayObject`.
 */
export declare function registerGlobalMixin(displayObject: any): void;
export {};
