import * as PIXI from 'pixi.js';
import { TimingModeFn } from './TimingMode';
interface VectorLike {
    x: number;
    y: number;
}
/** Time / duration (in seconds) */
declare type TimeInterval = number;
/** Targeted display node. */
declare type TargetNode = PIXI.DisplayObject;
/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently (i.e. UI and Game World).
 */
export declare abstract class Action {
    readonly duration: TimeInterval;
    timingMode: TimingModeFn;
    categoryMask: number;
    /** All currently running actions. */
    static readonly actions: Action[];
    /** Set a global default timing mode. */
    static DefaultTimingMode: TimingModeFn;
    /** Set the global default action category. */
    static DefaultCategoryMask: number;
    /** Creates an action that runs a collection of actions sequentially. */
    static sequence(actions: Action[]): Action;
    /** Creates an action that runs a collection of actions in parallel. */
    static group(actions: Action[]): Action;
    /** Creates an action that repeats another action a specified number of times. */
    static repeat(action: Action, repeats: number): Action;
    /** Creates an action that repeats another action forever. */
    static repeatForever(action: Action): Action;
    /** Creates an action that idles for a specified period of time. */
    static waitForDuration(duration: TimeInterval): Action;
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
    static waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval, randomSeed?: number): Action;
    /** Creates an action that moves a node relative to its current position. */
    static moveBy(x: number, y: number, duration: TimeInterval): Action;
    /** Creates an action that moves a node relative to its current position. */
    static moveByVector(vec: VectorLike, duration: TimeInterval): Action;
    /** Creates an action that moves a node horizontally relative to its current position. */
    static moveByX(x: number, duration: TimeInterval): Action;
    /** Creates an action that moves a node vertically relative to its current position. */
    static moveByY(y: number, duration: TimeInterval): Action;
    /** Creates an action that moves a node to a new position. */
    static moveTo(x: number, y: number, duration: TimeInterval): Action;
    /** Creates an action that moves a node to a new position. */
    static moveToPoint(point: VectorLike, duration: TimeInterval): Action;
    /** Creates an action that moves a node horizontally. */
    static moveToX(x: number, duration: TimeInterval): Action;
    /** Creates an action that moves a node vertically. */
    static moveToY(y: number, duration: TimeInterval): Action;
    /** Creates an action that rotates the node by a relative value. */
    static rotateBy(rotation: number, duration: TimeInterval): Action;
    /** Creates an action that rotates the node to an absolute value. */
    static rotateTo(rotation: number, duration: TimeInterval): Action;
    /** Creates an action that changes the x and y scale values of a node by a relative value. */
    static scaleBy(x: number, y: number, duration: TimeInterval): Action;
    /** Creates an action that changes the x and y scale values of a node by a relative value. */
    static scaleBySize(size: VectorLike, duration: TimeInterval): Action;
    /** Creates an action that changes the x scale of a node by a relative value. */
    static scaleXBy(x: number, duration: TimeInterval): Action;
    /** Creates an action that changes the y scale of a node by a relative value. */
    static scaleYBy(y: number, duration: TimeInterval): Action;
    /** Creates an action that changes the x and y scale values of a node. */
    static scaleTo(x: number, y: number, duration: TimeInterval): Action;
    /** Creates an action that changes the x and y scale values of a node. */
    static scaleToSize(size: VectorLike, duration: TimeInterval): Action;
    /** Creates an action that changes the y scale values of a node. */
    static scaleXTo(x: number, duration: TimeInterval): Action;
    /** Creates an action that changes the x scale values of a node. */
    static scaleYTo(y: number, duration: TimeInterval): Action;
    /** Creates an action that changes the alpha value of the node to 1.0. */
    static fadeIn(duration: TimeInterval): Action;
    /** Creates an action that changes the alpha value of the node to 0.0. */
    static fadeOut(duration: TimeInterval): Action;
    /** Creates an action that adjusts the alpha value of a node to a new value. */
    static fadeAlphaTo(alpha: number, duration: TimeInterval): Action;
    /** Creates an action that adjusts the alpha value of a node by a relative value. */
    static fadeAlphaBy(alpha: number, duration: TimeInterval): Action;
    static removeFromParent(): Action;
    /** Creates an action that executes a block. */
    static run(fn: () => void): Action;
    /**
     * Creates an action that executes a stepping function over its duration.
     *
     * The function will be triggered on every redraw until the action completes, and is passed
     * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing mode function).
     */
    static custom(duration: number, stepFn: (target: TargetNode, x: number) => void): Action;
    /** Clear all actions with this target. */
    static removeActionsForTarget(target: TargetNode | undefined): void;
    /** Clears all actions. */
    static removeAllActions(): void;
    /** Play an action. */
    protected static playAction(action: Action): Action;
    /** Stop an action. */
    protected static stopAction(action: Action): Action;
    /** Tick all actions forward.
     *
     * @param dt Delta time
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static tick(dt: number, categoryMask?: number, onErrorHandler?: (error: any) => void): void;
    protected static tickAction(action: Action, delta: number): void;
    /** The display object the action is running against. Set during `runOn` and cannot be changed. */
    target: TargetNode;
    /** A speed factor that modifies how fast an action runs. */
    speed: number;
    /** Time elapsed in the action. */
    elapsed: number;
    /** Whether the action has completed. Set by `Action. */
    isDone: boolean;
    /** Actions that will be triggered when this action completes. */
    protected queuedActions: Action[];
    /** Whether action is in progress (or has not yet started). */
    get isPlaying(): boolean;
    /** The relative time elapsed between 0 and 1. */
    protected get timeDistance(): number;
    /**
     * The relative time elapsed between 0 and 1, eased by the timing mode function.
     *
     * Can be a value beyond 0 or 1 depending on the timing mode function.
     */
    protected get easedTimeDistance(): number;
    constructor(duration: TimeInterval, timingMode?: TimingModeFn, categoryMask?: number);
    /** Must be implmented by each class. */
    abstract tick(progress: number): boolean;
    /** Run an action on this target. */
    runOn(target: TargetNode): this;
    /** Set an action to run after this action. */
    queueAction(next: Action): this;
    /** Reset an action to the start. */
    reset(): this;
    /** Stop and reset an action. */
    stop(): this;
    /** Set a timing mode function for this action. */
    withTimingMode(timingMode: TimingModeFn): this;
    /** Set a category mask for this action. Used to group different actions together. */
    setCategory(categoryMask: number): this;
    /** Set which display object should be targeted. Internal use only. */
    setTarget(target: TargetNode): this;
    /**
     * For relative actions, increments time by delta, and returns the change in easedTimeDistance.
     *
     * @param delta change in time to apply
     * @returns the relative change in easedTimeDistance.
     */
    protected applyDelta(delta: number): number;
}
export declare class SequenceAction extends Action {
    index: number;
    actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
    setTarget(target: TargetNode): this;
}
export declare class ScaleToAction extends Action {
    protected readonly x: number | undefined;
    protected readonly y: number | undefined;
    protected startX: number;
    protected startY: number;
    constructor(x: number | undefined, y: number | undefined, duration: TimeInterval);
    tick(delta: number): boolean;
}
export declare class ScaleByAction extends Action {
    protected readonly x: number;
    protected readonly y: number;
    constructor(x: number, y: number, duration: TimeInterval);
    tick(delta: number): boolean;
}
export declare class RemoveFromParentAction extends Action {
    constructor();
    tick(delta: number): boolean;
}
export declare class CustomAction extends Action {
    protected stepFn: (target: TargetNode, x: number) => void;
    constructor(duration: TimeInterval, stepFn: (target: TargetNode, x: number) => void);
    tick(delta: number): boolean;
}
export declare class RunBlockAction extends Action {
    protected block: () => any;
    constructor(block: () => void);
    tick(delta: number): boolean;
}
export declare class RotateToAction extends Action {
    protected readonly rotation: number;
    protected startRotation: number;
    constructor(rotation: number, duration: TimeInterval);
    tick(delta: number): boolean;
}
export declare class RotateByAction extends Action {
    protected readonly rotation: number;
    constructor(rotation: number, duration: TimeInterval);
    tick(delta: number): boolean;
}
export declare class RepeatAction extends Action {
    protected action: Action;
    protected maxRepeats: number;
    protected n: number;
    /**
     * @param action Targeted action.
     * @param repeats A negative value indicates looping forever.
     */
    constructor(action: Action, repeats: number);
    tick(delta: number): boolean;
    reset(): this;
    setTarget(target: TargetNode): this;
}
export declare class MoveToAction extends Action {
    protected readonly x: number | undefined;
    protected readonly y: number | undefined;
    protected startX: number;
    protected startY: number;
    constructor(x: number | undefined, y: number | undefined, duration: TimeInterval);
    tick(delta: number): boolean;
}
export declare class GroupAction extends Action {
    protected index: number;
    protected actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
    setTarget(target: TargetNode): this;
}
export declare class FadeToAction extends Action {
    protected startAlpha: number;
    protected alpha: number;
    constructor(alpha: number, duration: TimeInterval);
    tick(delta: number): boolean;
}
export declare class FadeByAction extends Action {
    protected readonly alpha: number;
    constructor(alpha: number, duration: TimeInterval, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class DelayAction extends Action {
    tick(delta: number): boolean;
}
export {};
