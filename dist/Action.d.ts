import * as PIXI from 'pixi.js';
import { TimingModeFn } from './TimingMode';
/**
 * Action is an animation that is executed by a display object in the scene.
 * Actions are used to change a display object in some way (like move its position over time).
 *
 * Trigger @see {Action.tick(...)} to update actions.
 *
 * Optionally set Action.categoryMask to allow different action categories to run independently (i.e. UI and Game World).
 */
export declare abstract class Action {
    readonly duration: number;
    timingMode: TimingModeFn;
    categoryMask: number;
    /** All currently running actions. */
    static readonly actions: Action[];
    /** Set a global default timing mode. */
    static DefaultTimingMode: TimingModeFn;
    /** Set the global default action category. */
    static DefaultCategoryMask: number;
    /** Infers target from given actions. */
    static sequence(actions: Action[]): Action;
    /** Infers target from given actions. */
    static group(actions: Action[]): Action;
    /** Infers target from given action. */
    static repeat(action: Action, repeats: number): Action;
    /** Infers target from given action. */
    static repeatForever(action: Action): Action;
    static moveTo(x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static moveBy(x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static fadeTo(alpha: number, duration: number, timingMode?: TimingModeFn): Action;
    static fadeOut(duration: number, timingMode?: TimingModeFn): Action;
    static fadeOutAndRemoveFromParent(duration: number, timingMode?: TimingModeFn): Action;
    static fadeIn(duration: number, timingMode?: TimingModeFn): Action;
    static removeFromParent(): Action;
    static delay(duration: number): Action;
    static runBlock(fn: () => void): Action;
    static scaleTo(x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static scaleBy(x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static rotateTo(rotation: number, duration: number, timingMode?: TimingModeFn): Action;
    static rotateBy(rotation: number, duration: number, timingMode?: TimingModeFn): Action;
    /** Clear all actions with this target. */
    static removeActionsForTarget(target: PIXI.DisplayObject | undefined): void;
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
    private static tickAction;
    target: PIXI.DisplayObject | undefined;
    speed: number;
    time: number;
    isDone: boolean;
    protected queuedActions: Action[];
    /** Whether action is in progress */
    get isPlaying(): boolean;
    protected get timeDistance(): number;
    protected get easedTimeDistance(): number;
    constructor(duration: number, timingMode?: TimingModeFn, categoryMask?: number);
    /** Must be implmented by each class. */
    abstract tick(progress: number): boolean;
    /** Run an action on this target. */
    runOn(target: PIXI.DisplayObject): this;
    queueAction(next: Action): this;
    reset(): this;
    stop(): this;
    setCategory(categoryMask: number): this;
    setTarget(target: PIXI.DisplayObject): this;
}
/** Infers target from given actions. */
export declare class SequenceAction extends Action {
    index: number;
    actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
    setTarget(target: PIXI.DisplayObject): this;
}
export declare class ScaleToAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class ScaleByAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class RemoveFromParentAction extends Action {
    constructor();
    tick(delta: number): boolean;
}
export declare class RunBlockAction extends Action {
    protected block: () => any;
    constructor(block: () => void);
    tick(delta: number): boolean;
}
export declare class RotateToAction extends Action {
    protected startRotation: number;
    protected rotation: number;
    constructor(rotation: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class RotateByAction extends Action {
    protected startRotation: number;
    protected rotation: number;
    constructor(rotation: number, duration: number, timingMode?: TimingModeFn);
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
    setTarget(target: PIXI.DisplayObject): this;
}
export declare class MoveToAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class MoveByAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
/** Infers target from given actions. */
export declare class GroupAction extends Action {
    protected index: number;
    protected actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
    setTarget(target: PIXI.DisplayObject): this;
}
export declare class FadeToAction extends Action {
    protected startAlpha: number;
    protected alpha: number;
    constructor(alpha: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class DelayAction extends Action {
    tick(delta: number): boolean;
}
