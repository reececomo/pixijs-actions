import { Container } from 'pixi.js';


export {};

//
// ----------------- Global Type Aliases -----------------
//

declare global {

  /** Time measured in seconds. */
  type TimeInterval = number;

  /** Targeted display node. */
  type TargetNode = Container;

  type ContainerDestroyOptions = Parameters<TargetNode["destroy"]>[0];

  /** Targeted display node with a width and height. */
  type SizedTargetNode = TargetNode & SizeLike;

  /** Any vector-like object (e.g. PIXI.Point, or any node). */
  interface VectorLike {
    x: number;
    y: number;
  }

  /** Any object with a width and height (e.g. PIXI.Sprite). */
  interface SizeLike {
    width: number;
    height: number;
  }

  /** Any object containing an array of points (e.g. PIXI.SimpleRope). */
  interface PathObjectLike {
    points: VectorLike[];
  }

}

//
// ----------------- PixiJS extension: -----------------
//

declare module 'pixi.js' {

  export interface Container {

    //
    // ----------------- Container Action Properties: -----------------
    //

    /**
     * A boolean value that determines whether actions on the node and its descendants are processed.
     */
    isPaused: boolean;

    /**
     * A speed modifier applied to all actions executed by a node and its descendants.
     */
    speed: number;

    //
    // ----------------- Container Action Methods: -----------------
    //

    /**
     * Adds an action to the list of actions executed by the node.
     *
     * The new action is processed the next time the canvas's animation loop is processed.
     *
     * After the action completes, your completion block is called, but only if the action runs to
     * completion. If the action is removed before it completes, the completion handler is never
     * called.
     *
     * @param action The action to perform.
     * @param completion (Optional) A completion block called when the action completes.
     */
    run(action: Action, completion?: () => void): void;

    /**
     * Adds an identifiable action to the list of actions executed by the node.
     *
     * The action is stored so that it can be retrieved later. If an action using the same key is
     * already running, it is removed before the new action is added.
     *
     * @param action The action to perform.
     * @param key A unique key used to identify the action.
     */
    runWithKey(key: string, action: Action): void;
    runWithKey(action: Action, key: string): void;

    /**
     * Adds an action to the list of actions executed by the node.
     *
     * The new action is processed the next time the canvas's animation loop is processed.
     *
     * Runs the action as a promise.
     *
     * @param action The action to perform.
     */
    runAsPromise(action: Action): Promise<void>;

    /**
     * Returns an action associated with a specific key.
     */
    action(forKey: string): Action | undefined;

    /**
     * Returns a boolean value that indicates whether the node is executing actions.
     */
    hasActions(): boolean;

    /**
     * Ends and removes all actions from the node.
     */
    removeAllActions(): void;

    /**
     * Removes an action associated with a specific key.
     */
    removeAction(forKey: string): void;
  }

}
import { Spritesheet, Texture } from 'pixi.js';

declare const Defaults: {
	/**
	 * Default `timePerFrame` in seconds for `Action.animate(…)`.
	 *
	 * @default 1 / 60
	 */
	animateTimePerFrame: number;
	/**
	 * Default timing mode used for ease-in pacing.
	 *
	 * Set this to update the default `easeIn()` timing mode.
	 *
	 * @default Timing.easeInSine
	 */
	timingEaseIn: (x: number) => number;
	/**
	 * Default timing mode used for ease-out pacing.
	 *
	 * Set this to update the default `easeOut()` timing mode.
	 *
	 * @default Timing.easeOutSine
	 */
	timingEaseOut: (x: number) => number;
	/**
	 * Default timing mode used for ease-in, ease-out pacing.
	 *
	 * Set this to update the default `easeInOut()` timing mode.
	 *
	 * @default Timing.easeInOutSine
	 */
	timingEaseInOut: (x: number) => number;
};
/**
 * Create, configure, and run actions in PixiJS.
 *
 * An action is an animation that is executed by a target node.
 *
 * ### Setup:
 * @example
 * Ticker.shared.add( Action.tick )
 */
export declare abstract class Action {
	/**
	 * @deprecated Use `Action.defaults.animateTimePerFrame` instead.
	 */
	static get DefaultAnimateTimePerFrame(): TimeInterval;
	static set DefaultAnimateTimePerFrame(value: TimeInterval);
	/**
	 * @deprecated Use `Action.defaults.timingEaseIn` instead.
	 */
	static get DefaultTimingEaseIn(): TimingFunction;
	static set DefaultTimingEaseIn(v: TimingFunction | TimingKey);
	/**
	 * @deprecated Use `Action.defaults.timingEaseOut` instead.
	 */
	static get DefaultTimingEaseOut(): TimingFunction;
	static set DefaultTimingEaseOut(v: TimingFunction | TimingKey);
	/**
	 * @deprecated Use `Action.defaults.timingEaseInOut` instead.
	 */
	static get DefaultTimingEaseInOut(): TimingFunction;
	static set DefaultTimingEaseInOut(v: TimingFunction | TimingKey);
	/**
	 * @deprecated Use `Action.defaults.timingEaseIn` instead.
	 */
	static get DefaultTimingModeEaseIn(): TimingFunction;
	static set DefaultTimingModeEaseIn(v: TimingFunction | TimingKey);
	/**
	 * @deprecated Use `Action.defaults.timingEaseOut` instead.
	 */
	static get DefaultTimingModeEaseOut(): TimingFunction;
	static set DefaultTimingModeEaseOut(v: TimingFunction | TimingKey);
	/**
	 * @deprecated Use `Action.defaults.timingEaseInOut` instead.
	 */
	static get DefaultTimingModeEaseInOut(): TimingFunction;
	static set DefaultTimingModeEaseInOut(v: TimingFunction | TimingKey);
	/**
	 * The duration required to complete an action.
	 */
	readonly duration: TimeInterval;
	/**
	 * Whether this action owns child actions.
	 */
	readonly hasChildren: boolean;
	/**
	 * A speed factor that modifies how fast an action runs.
	 */
	speed: number;
	/**
	 * A function that controls the speed curve of an action.
	 */
	timing: TimingFunction;
	protected constructor(duration: TimeInterval, hasChildren?: true | undefined);
	/**
	 * Adjust the timing curve of an animation.
	 *
	 * This function mutates the underlying action.
	 *
	 * @see {Timing}
	 */
	setTiming(timingMode: TimingFunction): this;
	setTiming(timingModeKey: TimingKey): this;
	/** @deprecated Use `setTiming()` instead. */
	setTimingMode: {
		(timingMode: TimingFunction): this;
		(timingModeKey: TimingKey): this;
	};
	/**
	 * Set the action's speed scale. Default: `1.0`.
	 *
	 * This function mutates the underlying action.
	 */
	setSpeed(speed: number): this;
	/**
	 * Default `timingMode`. Sets the speed curve of the action to linear pacing. Linear pacing causes
	 * an animation to occur evenly over its duration.
	 *
	 * This function mutates the underlying action.
	 *
	 * @see {Timing.linear}
	 */
	linear(): this;
	/**
	 * Sets the speed curve of the action to the default ease-in pacing. Ease-in pacing causes the
	 * animation to begin slowly and then speed up as it progresses.
	 *
	 * This function mutates the underlying action.
	 *
	 * @see {Action.DefaultTimingEaseIn}
	 */
	easeIn(): this;
	/**
	 * Sets the speed curve of the action to the default ease-out pacing. Ease-out pacing causes the
	 * animation to begin quickly and then slow as it completes.
	 *
	 * This function mutates the underlying action.
	 *
	 * @see {Action.DefaultTimingEaseOut}
	 */
	easeOut(): this;
	/**
	 * Sets the speed curve of the action to the default ease-in, ease-out pacing. Ease-in, ease-out
	 * pacing causes the animation to begin slowly, accelerate through the middle of its duration,
	 * and then slow again before completing.
	 *
	 * This function mutates the underlying action.
	 *
	 * @see {Action.DefaultTimingEaseInOut}
	 */
	easeInOut(): this;
	/**
	 * Creates an action that reverses the behavior of another action.
	 *
	 * This method always returns an action object; however, not all actions are reversible.
	 * When reversed, some actions return an object that either does nothing or that performs the same
	 * action as the original action.
	 */
	abstract reversed(): Action;
}
/** @deprecated Use `Action.defaults` instead. */
export declare const ActionSettings: {
	animateTimePerFrame: number;
	timingEaseIn: (x: number) => number;
	timingEaseOut: (x: number) => number;
	timingEaseInOut: (x: number) => number;
};
/**
 * Timing functions.
 *
 * @see https://easings.net/
 * @see https://raw.githubusercontent.com/ai/easings.net/master/src/easings/easingsFunctions.ts
 */
export declare const Timing: {
	readonly linear: (x: number) => number;
	readonly easeInQuad: (x: number) => number;
	readonly easeOutQuad: (x: number) => number;
	readonly easeInOutQuad: (x: number) => number;
	readonly easeInCubic: (x: number) => number;
	readonly easeOutCubic: (x: number) => number;
	readonly easeInOutCubic: (x: number) => number;
	readonly easeInQuart: (x: number) => number;
	readonly easeOutQuart: (x: number) => number;
	readonly easeInOutQuart: (x: number) => number;
	readonly easeInQuint: (x: number) => number;
	readonly easeOutQuint: (x: number) => number;
	readonly easeInOutQuint: (x: number) => number;
	readonly easeInSine: (x: number) => number;
	readonly easeOutSine: (x: number) => number;
	readonly easeInOutSine: (x: number) => number;
	readonly easeInExpo: (x: number) => number;
	readonly easeOutExpo: (x: number) => number;
	readonly easeInOutExpo: (x: number) => number;
	readonly easeInCirc: (x: number) => number;
	readonly easeOutCirc: (x: number) => number;
	readonly easeInOutCirc: (x: number) => number;
	readonly easeInBack: (x: number) => number;
	readonly easeOutBack: (x: number) => number;
	readonly easeInOutBack: (x: number) => number;
	readonly easeInElastic: (x: number) => number;
	readonly easeOutElastic: (x: number) => number;
	readonly easeInOutElastic: (x: number) => number;
	readonly easeInBounce: (x: number) => number;
	readonly easeOutBounce: (x: number) => number;
	readonly easeInOutBounce: (x: number) => number;
};
/** @deprecated Use `Timing` instead. */
export declare const TimingMode: {
	readonly linear: (x: number) => number;
	readonly easeInQuad: (x: number) => number;
	readonly easeOutQuad: (x: number) => number;
	readonly easeInOutQuad: (x: number) => number;
	readonly easeInCubic: (x: number) => number;
	readonly easeOutCubic: (x: number) => number;
	readonly easeInOutCubic: (x: number) => number;
	readonly easeInQuart: (x: number) => number;
	readonly easeOutQuart: (x: number) => number;
	readonly easeInOutQuart: (x: number) => number;
	readonly easeInQuint: (x: number) => number;
	readonly easeOutQuint: (x: number) => number;
	readonly easeInOutQuint: (x: number) => number;
	readonly easeInSine: (x: number) => number;
	readonly easeOutSine: (x: number) => number;
	readonly easeInOutSine: (x: number) => number;
	readonly easeInExpo: (x: number) => number;
	readonly easeOutExpo: (x: number) => number;
	readonly easeInOutExpo: (x: number) => number;
	readonly easeInCirc: (x: number) => number;
	readonly easeOutCirc: (x: number) => number;
	readonly easeInOutCirc: (x: number) => number;
	readonly easeInBack: (x: number) => number;
	readonly easeOutBack: (x: number) => number;
	readonly easeInOutBack: (x: number) => number;
	readonly easeInElastic: (x: number) => number;
	readonly easeOutElastic: (x: number) => number;
	readonly easeInOutElastic: (x: number) => number;
	readonly easeInBounce: (x: number) => number;
	readonly easeOutBounce: (x: number) => number;
	readonly easeInOutBounce: (x: number) => number;
};
/**
 * Register the mixin for PIXI.Container.
 *
 * @param containerType A reference to `PIXI.Container`.
 */
export declare function registerPixiJSActionsMixin(containerType: any): void;
export interface AnimateSpritesheetOptions extends BaseAnimateOptions {
	/**
	 * A spritesheet containing textures to animate.
	 */
	spritesheet: Spritesheet;
	/**
	 * Whether spritesheet frames are sorted on key.
	 *
	 * @default true
	 */
	sortKeys?: boolean;
}
export interface AnimateTextureOptions extends BaseAnimateOptions {
	/**
	 * Array of textures to animate.
	 */
	frames: Texture[];
}
export interface BaseAnimateOptions {
	/**
	 * Time to display each texture in seconds.
	 *
	 * @default Action.DefaultAnimateTimePerFrame
	 */
	timePerFrame?: number;
	/**
	 * Whether to resize the sprite width and height to match each texture.
	 *
	 * @default false
	 */
	resize?: boolean;
	/**
	 * When the action completes or is removed, whether to restore the sprite's
	 * texture to the texture it had before the action ran.
	 *
	 * @default false
	 */
	restore?: boolean;
}
export interface TickerLike {
	/**
	 * Scalar time elapsed in milliseconds from last frame to this frame.
	 */
	deltaMS: number;
}
export namespace Action {
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
	function group(actions: Action[]): Action;
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
	function sequence(actions: Action[]): Action;
	/**
	 * Creates an action that repeats another action a specified number of times.
	 *
	 * When the action executes, the associated action runs to completion and then repeats, until the
	 * count is reached.
	 *
	 * This action is reversible; it creates a new action that is the reverse of the specified action
	 * and then repeats it the same number of times.
	 */
	function repeat(action: Action, repeats: number): Action;
	/**
	 * Creates an action that repeats another action forever.
	 *
	 * When the action executes, the associated action runs to completion and then repeats.
	 *
	 * This action is reversible; it creates a new action that is the reverse of the specified action
	 * and then repeats it forever.
	 */
	function repeatForever(action: Action): Action;
	/**
	 * Creates an action that idles for a specified period of time.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function waitForDuration(duration: TimeInterval): Action;
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
	function waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval): Action;
	/**
	 * Creates an action that moves a node relative to its current position.
	 *
	 * This action is reversible.
	 */
	function moveBy(delta: VectorLike, duration: TimeInterval): Action;
	function moveBy(dx: number, dy: number, duration: TimeInterval): Action;
	function moveBy(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action;
	/**
	 * Creates an action that moves a node horizontally relative to its current position.
	 *
	 * This action is reversible.
	 */
	function moveByX(x: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that moves a node vertically relative to its current position.
	 *
	 * This action is reversible.
	 */
	function moveByY(y: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that moves a node to a new position.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function moveTo(position: VectorLike, duration: TimeInterval): Action;
	function moveTo(x: number, y: number, duration: TimeInterval): Action;
	function moveTo(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action;
	/**
	 * Creates an action that moves a node horizontally.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function moveToX(x: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that moves a node vertically.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function moveToY(y: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that moves the node along a path, optionally orienting the node to the path.
	 *
	 * This action is reversible; the resulting action creates a reversed path and then follows it,
	 * with the same duration.
	 *
	 * @param path A path to follow, or an object containing an array of points called `points`.
	 * @param duration The duration of the animation.
	 * @param asOffset (Default: true) When true, the path is relative to the node's current position.
	 * @param orientToPath (Default: true) When true, the node’s rotation turns to follow the path.
	 * @param fixedSpeed (Default: true) When true, the node's speed is consistent for each segment.
	 */
	function follow(path: PathObjectLike | VectorLike[], duration: number, asOffset?: boolean, orientToPath?: boolean, fixedSpeed?: boolean): Action;
	/**
	 * Creates an action that moves the node along a path at a specified speed, optionally orienting
	 * the node to the path.
	 *
	 * This action is reversible; the resulting action creates a reversed path and then follows it,
	 * with the same speed.
	 *
	 * @param path A path to follow.
	 * @param speed The velocity at which the node should move, in world units per second.
	 * @param asOffset (Default: true) When true, the path is relative to the node's current position.
	 * @param orientToPath (Default: true) When true, the node’s rotation turns to follow the path.
	 */
	function followAtSpeed(path: PathObjectLike | VectorLike[], speed: number, asOffset?: boolean, orientToPath?: boolean): Action;
	/**
	 * Creates an action that rotates the node by a relative value (in radians).
	 *
	 * This action is reversible.
	 */
	function rotateBy(rotation: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that rotates the node by a relative value (in degrees).
	 *
	 * This action is reversible.
	 */
	function rotateByDegrees(degrees: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that rotates the node to an absolute value (in radians).
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function rotateTo(rotation: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that rotates the node to an absolute value (in degrees).
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function rotateToDegrees(degrees: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes how fast the node executes actions by a relative value.
	 *
	 * This action is reversible.
	 */
	function speedBy(speed: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes how fast the node executes actions.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function speedTo(speed: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes the scale of a node by a relative value.
	 *
	 * This action is reversible.
	 */
	function scaleBy(scale: number, duration: TimeInterval): Action;
	function scaleBy(size: VectorLike, duration: TimeInterval): Action;
	function scaleBy(dx: number, dy: number, duration: TimeInterval): Action;
	function scaleBy(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action;
	/**
	 * Creates an action that changes the x scale of a node by a relative value.
	 *
	 * This action is reversible.
	 */
	function scaleByX(x: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes the y scale of a node by a relative value.
	 *
	 * This action is reversible.
	 */
	function scaleByY(y: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes the x and y scale values of a node.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function scaleTo(scale: number, duration: TimeInterval): Action;
	function scaleTo(size: SizeLike, duration: TimeInterval): Action;
	function scaleTo(x: number, y: number, duration: TimeInterval): Action;
	function scaleTo(a: number | SizeLike, b: number | TimeInterval, c?: TimeInterval): Action;
	/**
	 * Creates an action that changes the y scale values of a node.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function scaleToX(x: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes the x scale values of a node.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function scaleToY(y: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that changes the alpha value of the node to 1.0.
	 *
	 * This action is reversible. The reverse is equivalent to fadeOut(duration).
	 */
	function fadeIn(duration: TimeInterval): Action;
	/**
	 * Creates an action that changes the alpha value of the node to 0.0.
	 *
	 * This action is reversible. The reverse is equivalent to fadeIn(duration).
	 */
	function fadeOut(duration: TimeInterval): Action;
	/**
	 * Creates an action that adjusts the alpha value of a node to a new value.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function fadeAlphaTo(alpha: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that adjusts the alpha value of a node by a relative value.
	 *
	 * This action is reversible.
	 */
	function fadeAlphaBy(alpha: number, duration: TimeInterval): Action;
	/**
	 * Creates an action that animates changes to a sprite’s texture.
	 *
	 * Note: Target must be a Sprite.
	 *
	 * This action is reversible.
	 */
	function animate(options: AnimateOptions): Action;
	/**
	 * Creates an action that hides a node.
	 *
	 * This action has an instantaneous duration. When the action executes, the node’s visible
	 * property is set to true.
	 *
	 * This action is reversible. The reversed action is equivalent to show().
	 */
	function hide(): Action;
	/**
	 * Creates an action that makes a node visible.
	 *
	 * This action has an instantaneous duration. When the action executes, the node’s visible
	 * property is set to false.
	 *
	 * This action is reversible. The reversed action is equivalent to hide().
	 */
	function unhide(): Action;
	/**
	 * Creates an action that removes all internal references, listeners and actions,
	 * as well as removes children from the display list.
	 *
	 * This action has an instantaneous duration.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function destroy(options?: Parameters<TargetNode["destroy"]>[0]): Action;
	/**
	 * Creates an action that removes the node from its parent.
	 *
	 * This action has an instantaneous duration.
	 *
	 * This action is not reversible; the reverse of this action is the same action.
	 */
	function removeFromParent(): Action;
	/**
	 * Creates an action that runs an action on a named child object.
	 *
	 * This action has an instantaneous duration, although the action executed on the child may have
	 * a duration of its own. When the action executes, it looks up an appropriate child node and
	 * calls its `run(action)` method, passing in the action to execute.
	 *
	 * This action is reversible; it tells the child to execute the reverse of the action specified by
	 * the action parameter.
	 */
	function runOnChild(childLabel: string, action: Action): Action;
	/**
	 * Creates an action that executes a block.
	 *
	 * This action takes place instantaneously.
	 *
	 * This action is not reversible; the reverse action executes the same block function.
	 */
	function run(blockFn: (target: TargetNode) => void): Action;
	/**
	 * Creates an action that executes a stepping function over its duration.
	 *
	 * The function will be triggered on every redraw until the action completes, and is passed
	 * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
	 * mode function).
	 *
	 * This action is not reversible; the reverse action executes the same stepping function.
	 */
	function custom(duration: number, stepFn: (target: TargetNode, t: number, dt: number) => void): Action;
	/**
	 * @deprecated Use `Action.custom(duration, stepFn)`
	 *
	 * Creates an action that executes a stepping function over its duration.
	 *
	 * The function will be triggered on every redraw until the action completes, and is passed
	 * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
	 * mode function).
	 *
	 * This action is not reversible; the reverse action executes the same stepping function.
	 */
	function customAction(duration: number, stepFn: (target: TargetNode, t: number, dt: number) => void): Action;
}
export namespace Action {
	/**
	 * PixiJS Actions global default settings.
	 */
	const defaults: typeof Defaults;
}
export namespace Action {
	/**
	 * Tick all actions forward.
	 *
	 * @param ticker Ticker instance.
	 * @param onErrorHandler Error handler for individual action errors.
	 */
	function tick(ticker: TickerLike, onErrorHandler?: (error: any) => void): void;
	/**
	 * Tick all actions forward.
	 *
	 * @param deltaMS Delta time given in milliseconds.
	 * @param onErrorHandler Error handler for individual action errors.
	 */
	function tick(deltaMS: number, onErrorHandler?: (error: any) => void): void;
}
export type AnimateOptions = AnimateTextureOptions | AnimateSpritesheetOptions;
/**
 * Timing function.
 */
export type TimingFunction = (x: number) => number;
/**
 * Timing mode key.
 */
export type TimingKey = keyof typeof Timing;
/** @deprecated Use `TimingFunction` instead. */
export type TimingModeFn = TimingFunction;

export {};
