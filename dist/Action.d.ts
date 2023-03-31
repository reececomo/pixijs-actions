import * as PIXI from 'pixi.js';
import { TimingModeFn } from './ActionTimingMode';
export declare abstract class Action {
    /** Optionally check a boolean property with this name on display objects. */
    static PausedProperty: string | undefined;
    /** Set a global default timing mode. */
    static DefaultTimingMode: TimingModeFn;
    /** All currently running actions. */
    protected static actions: Action[];
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
    static clearTargetActions(target: PIXI.DisplayObject | undefined): void;
    static clearAllActions(): void;
    protected static play(action: Action): Action;
    protected static pause(action: Action): Action;
    /**
     * Tick all actions forward.
     */
    static tick(delta: number): void;
    time: number;
    duration: number;
    target?: PIXI.DisplayObject;
    done: boolean;
    timingMode: TimingModeFn;
    protected queued: Action[];
    protected get timeDistance(): number;
    protected get easedTimeDistance(): number;
    constructor(target: PIXI.DisplayObject | undefined, duration: number);
    /** Must be implmented by each class. */
    abstract tick(progress: number): boolean;
    play(): this;
    pause(): this;
    queue(next: Action): this;
    reset(): this;
    stop(): this;
}
