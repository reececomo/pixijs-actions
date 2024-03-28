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
    target: PIXI.DisplayObject | undefined;
    duration: number;
    timingMode: TimingModeFn;
    categoryMask: number;
    /** All currently running actions. */
    static readonly actions: Action[];
    /** Optionally check a boolean property with this name on display objects. */
    static PausedProperty?: string;
    /** Set a global default timing mode. */
    static DefaultTimingMode: TimingModeFn;
    /** Set the global default action category. */
    static DefaultActionCategoryMask: number;
    static sequence(actions: Action[]): Action;
    static group(actions: Action[]): Action;
    static repeat(action: Action, repeats: number): Action;
    static repeatForever(action: Action): Action;
    static moveTo(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static moveBy(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static fadeTo(target: PIXI.DisplayObject, alpha: number, duration: number, timingMode?: TimingModeFn): Action;
    static fadeOut(target: PIXI.DisplayObject, duration: number, timingMode?: TimingModeFn): Action;
    static fadeOutAndRemove(target: PIXI.DisplayObject, duration: number, timingMode?: TimingModeFn): Action;
    static fadeIn(target: PIXI.DisplayObject, duration: number, timingMode?: TimingModeFn): Action;
    static remove(target: PIXI.DisplayObject): Action;
    static delay(duration: number): Action;
    static runBlock(fn: () => void): Action;
    static scaleTo(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static scaleBy(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn): Action;
    static rotateTo(target: PIXI.DisplayObject, rotation: number, duration: number, timingMode?: TimingModeFn): Action;
    static rotateBy(target: PIXI.DisplayObject, rotation: number, duration: number, timingMode?: TimingModeFn): Action;
    /** Clear all actions with this target. */
    static clearTargetActions(target: PIXI.DisplayObject | undefined): void;
    /** Clear all actions. */
    static clearAllActions(): void;
    /** Play an action. */
    protected static play(action: Action): Action;
    /** Pause an action. */
    protected static pause(action: Action): Action;
    /** Tick all actions forward.
     *
     * @param dt Delta time
     * @param categoryMask (Optional) Bitmask to filter which categories of actions to update.
     * @param onErrorHandler (Optional) Handler errors from each action's tick.
     */
    static tick(dt: number, categoryMask?: number, onErrorHandler?: (error: any) => void): void;
    private static tickAction;
    time: number;
    done: boolean;
    protected queued: Action[];
    /** Whether the action is intended to be targeted. */
    isTargeted: boolean;
    protected get timeDistance(): number;
    protected get easedTimeDistance(): number;
    constructor(target: PIXI.DisplayObject | undefined, duration: number, timingMode?: TimingModeFn, categoryMask?: number);
    /** Must be implmented by each class. */
    abstract tick(progress: number): boolean;
    play(): this;
    pause(): this;
    queue(next: Action): this;
    reset(): this;
    stop(): this;
}
export declare class SequenceAction extends Action {
    index: number;
    actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
}
export declare class ScaleToAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class ScaleByAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn);
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
    constructor(target: PIXI.DisplayObject, rotation: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class RotateByAction extends Action {
    protected startRotation: number;
    protected rotation: number;
    constructor(target: PIXI.DisplayObject, rotation: number, duration: number, timingMode?: TimingModeFn);
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
}
export declare class MoveToAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class MoveByAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class GroupAction extends Action {
    protected index: number;
    protected actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
}
export declare class FadeToAction extends Action {
    protected startAlpha: number;
    protected alpha: number;
    constructor(target: PIXI.DisplayObject, alpha: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
export declare class DelayAction extends Action {
    tick(delta: number): boolean;
}
