/* eslint-disable @typescript-eslint/no-namespace */
import { Action } from './ActionClass';
import {
  AnimateAction,
  AnimateOptions,
  AnimateSpritesheetOptions,
  CustomAction,
  DelayAction,
  FadeAlphaToAction,
  FadeByAction,
  FadeInAction,
  FadeOutAction,
  FollowPathAction,
  GroupAction,
  MoveByAction,
  MoveToAction,
  RepeatAction,
  RepeatForeverAction,
  RotateByAction,
  RotateToAction,
  RunBlockAction,
  RunOnChildAction,
  ScaleByAction,
  ScaleToAction,
  ScaleToSizeAction,
  SequenceAction,
  SetVisibleAction,
  SkewByAction,
  SkewToAction,
  SpeedByAction,
  SpeedToAction,
  TintToAction,
} from './actions';


declare module './ActionClass' {

  export namespace Action {

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

    //
    // ----------------- Delaying Actions: -----------------
    //

    /**
     * Creates an action that idles for a specified period of time.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function waitForDuration(duration: TimeInterval, thenRun?: Action): Action;

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
    function waitForDurationWithRange(average: TimeInterval, rangeSize: TimeInterval, thenRun?: Action): Action;

    //
    // ----------------- Linear Path Actions: -----------------
    //

    /**
     * Creates an action that moves a node relative to its current position.
     *
     * This action is reversible.
     */
    function moveBy(dx: number, dy: number, duration: TimeInterval): Action;
    function moveBy(delta: VectorLike, duration: TimeInterval): Action;

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
    function moveTo(x: number, y: number, duration: TimeInterval): Action;
    function moveTo(position: IPoint, duration: TimeInterval): Action;

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
     * @param asOffset (Default: true) When true, the path is relative to the node's current position.
     * @param orientToPath (Default: true) When true, the node’s rotation turns to follow the path.
     * @param fixedSpeed (Default: true) When true, the node's speed is consistent for each segment.
     */
    function follow(
      path: IPath | IPoint[],
      duration: number,
      asOffset?: boolean,
      orientToPath?: boolean,
      fixedSpeed?: boolean,
    ): Action;

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
    function followAtSpeed(
      path: IPath | IPoint[],
      speed: number,
      asOffset?: boolean,
      orientToPath?: boolean,
    ): Action;

    //
    // ----------------- Rotation Actions: -----------------
    //

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

    //
    // ----------------- Speed Actions: -----------------
    //

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

    //
    // ----------------- Scale Actions: -----------------
    //

    /**
     * Creates an action that changes the scale of a node by a relative value.
     *
     * This action is reversible.
     */
    function scaleBy(scale: number, duration: TimeInterval): Action;
    function scaleBy(delta: IPoint, duration: TimeInterval): Action;
    function scaleBy(dx: number, dy: number, duration: TimeInterval): Action;

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
    function scaleTo(x: number, y: number, duration: TimeInterval): Action;
    function scaleTo(scale: number, duration: TimeInterval): Action;
    /**
     * Creates an action that changes the x and y scale values of a node.
     *
     * Note: Action target must have width and height.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function scaleTo(size: ISize, duration: TimeInterval): Action;
    function scaleTo(scale: VectorLike, duration: TimeInterval): Action;

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
     * Creates an action that changes the x and y scale values of a node to achieve
     * a target size (width, height).
     *
     * Note: Action target must have width and height.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function scaleToSize(width: number, height: number, duration: TimeInterval): Action;
    function scaleToSize(size: number, duration: TimeInterval): Action;
    function scaleToSize(size: ISize, duration: TimeInterval): Action;

    //
    // ----------------- Skew Actions: -----------------
    //

    /**
     * Creates an action that changes the skew of a node by a relative value.
     *
     * This action is reversible.
     */
    function skewBy(skew: number, duration: TimeInterval): Action;
    function skewBy(vector: VectorLike, duration: TimeInterval): Action;
    function skewBy(dx: number, dy: number, duration: TimeInterval): Action;

    /**
     * Creates an action that changes the x skew of a node by a relative value.
     *
     * This action is reversible.
     */
    function skewByX(x: number, duration: TimeInterval): Action;

    /**
     * Creates an action that changes the y skew of a node by a relative value.
     *
     * This action is reversible.
     */
    function skewByY(y: number, duration: TimeInterval): Action;

    /**
     * Creates an action that changes the x and y skew values of a node.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function skewTo(skew: number, duration: TimeInterval): Action;
    function skewTo(vector: VectorLike, duration: TimeInterval): Action;
    function skewTo(x: number, y: number, duration: TimeInterval): Action;

    /**
     * Creates an action that changes the y skew values of a node.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function skewToX(x: number, duration: TimeInterval): Action;

    /**
     * Creates an action that changes the x skew values of a node.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function skewToY(y: number, duration: TimeInterval): Action;

    //
    // ----------------- Transparency Actions: -----------------
    //

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

    //
    // ----------------- Tint Actions: -----------------
    //

    /**
     * Creates an action that changes the tint value of the node.
     *
     * Note: Action target must have a tint property.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function tintTo(tint: HexColor, duration: TimeInterval): Action;

    //
    // ----------------- Sprite Texture Actions: -----------------
    //

    /**
     * Creates an action that changes a node's texture.
     *
     * Note: Action target must be a PIXI.Sprite.
     *
     * This action is reversible.
     */
    function animate(withFrames: PixiTexture[], options?: AnimateOptions): Action;
    function animate(withFrames: { frames: PixiTexture[] } & AnimateOptions): Action;

    /**
     * Creates an action that changes a node's texture, using textures from a spritesheet.
     *
     * Note: Action target must be a PIXI.Sprite.
     *
     * This action is reversible.
     */
    function animate(withSpritesheet: PixiSpritesheet, options?: AnimateSpritesheetOptions): Action;
    function animate(withSpritesheet: { spritesheet: PixiSpritesheet } & AnimateSpritesheetOptions): Action;

    //
    // ----------------- Container Actions: -----------------
    //

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
    function destroy(options?: Parameters<Target["destroy"]>[0]): Action;

    /**
     * Creates an action that removes the node from its parent.
     *
     * This action has an instantaneous duration.
     *
     * This action is not reversible; the reverse of this action is the same action.
     */
    function removeFromParent(): Action;

    //
    // ----------------- Children Actions: -----------------
    //

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

    //
    // ----------------- Custom Actions: -----------------
    //

    /**
     * Creates an action that executes a block.
     *
     * This action takes place instantaneously.
     *
     * This action is not reversible; the reverse action executes the same block function.
     */
    function run(blockFn: (target: Target) => void): Action;

    /**
     * Creates an action that executes a stepping function over its duration.
     *
     * The function will be triggered on every redraw until the action completes, and is passed
     * the target and the elasped time as a scalar between 0 and 1 (which is passed through the timing
     * mode function).
     *
     * This action is not reversible; the reverse action executes the same stepping function.
     */
    function custom(
      duration: number,
      stepFn: (target: Target, t: number, dt: number) => void
    ): Action;

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
    function customAction(
      duration: number,
      stepFn: (target: Target, t: number, dt: number) => void
    ): Action;
  }
}

//
// ----------------- Constants: -----------------
//

const DEG_TO_RAD = Math.PI / 180;

//
// ----------------- Implmentation: -----------------
//

Action.group = function(actions: Action[]): Action {
  return new GroupAction(actions);
};

Action.sequence = function(actions: Action[]): Action {
  return new SequenceAction(actions);
};

Action.repeat = function(action: Action, repeats: number): Action {
  return new RepeatAction(action, repeats);
};

Action.repeatForever = function(action: Action): Action {
  return new RepeatForeverAction(action);
};

Action.waitForDuration = function(duration: TimeInterval, action?: Action): Action {
  return action
    ? Action.sequence([ new DelayAction(duration), action ])
    : new DelayAction(duration);
};

Action.waitForDurationWithRange = function(average: TimeInterval, rangeSize: TimeInterval, action?: Action): Action {
  const duration = average + (rangeSize * Math.random() - rangeSize * 0.5);
  return Action.waitForDuration(duration, action);
};

Action.moveBy = function(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === 'number'
    ? new MoveByAction(a, b, c)
    : new MoveByAction(a.x, a.y, b);
};

Action.moveByX = function(x: number, duration: TimeInterval): Action {
  return Action.moveBy(x, 0, duration);
};

Action.moveByY = function(y: number, duration: TimeInterval): Action {
  return Action.moveBy(0, y, duration);
};

Action.moveTo = function(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === "number"
    ? new MoveToAction(a, b, c)
    : new MoveToAction(a.x, a.y, b);
};

Action.moveToX = function(x: number, duration: TimeInterval): Action {
  return new MoveToAction(x, null, duration);
};

Action.moveToY = function(y: number, duration: TimeInterval): Action {
  return new MoveToAction(null, y, duration);
};

Action.follow = function(
  path: IPath | VectorLike[],
  duration: number,
  asOffset: boolean = true,
  orientToPath: boolean = true,
  fixedSpeed: boolean = true,
): Action {
  return new FollowPathAction(path, duration, asOffset, orientToPath, fixedSpeed);
};

Action.followAtSpeed = function(
  path: IPath | VectorLike[],
  speed: number,
  asOffset: boolean = true,
  orientToPath: boolean = true,
): Action {
  path = Array.isArray(path) ? path : path.points;
  const length = FollowPathAction.getLength(path);
  return new FollowPathAction(path, length/speed, asOffset, orientToPath, true);
};

Action.rotateBy = function(rotation: number, duration: TimeInterval): Action {
  return new RotateByAction(rotation, duration);
};

Action.rotateByDegrees = function(degrees: number, duration: TimeInterval): Action {
  return Action.rotateBy(degrees * DEG_TO_RAD, duration);
};

Action.rotateTo = function(rotation: number, duration: TimeInterval): Action {
  return new RotateToAction(rotation, duration);
};

Action.rotateToDegrees = function(degrees: number, duration: TimeInterval): Action {
  return Action.rotateTo(degrees * DEG_TO_RAD, duration);
};

Action.speedBy = function(speed: number, duration: TimeInterval): Action {
  return new SpeedByAction(speed, duration);
};

Action.speedTo = function(speed: number, duration: TimeInterval): Action {
  return new SpeedToAction(speed, duration);
};

Action.scaleBy = function(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === 'number'
    ? c == null
      ? new ScaleByAction(a, a, b)
      : new ScaleByAction(a, b, c)
    : new ScaleByAction(a.x, a.y, b);
};

Action.scaleByX = function(x: number, duration: TimeInterval): Action {
  return Action.scaleBy(x, 1, duration);
};

Action.scaleByY = function(y: number, duration: TimeInterval): Action {
  return Action.scaleBy(1, y, duration);
};

Action.scaleTo = function(a: number | ISize | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === 'number'
    ? c == null
      ? new ScaleToAction(a, a, b)
      : new ScaleToAction(a, b, c)
    : 'width' in a
      ? new ScaleToSizeAction(a.width, a.height, b)
      : new ScaleToAction(a.x, a.y, b);
};

Action.scaleToSize = function(a: number | ISize, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === 'number'
    ? c == null
      ? new ScaleToSizeAction(a, a, b)
      : new ScaleToSizeAction(a, b, c)
    : new ScaleToSizeAction(a.width, a.height, b);
};

Action.scaleToX = function(x: number, duration: TimeInterval): Action {
  return new ScaleToAction(x, null, duration);
};

Action.scaleToY = function(y: number, duration: TimeInterval): Action {
  return new ScaleToAction(null, y, duration);
};

Action.skewBy = function(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === 'number'
    ? c == null
      ? new SkewByAction(a, a, b)
      : new SkewByAction(a, b, c)
    : new SkewByAction(a.x, a.y, b);
};

Action.skewByX = function(x: number, duration: TimeInterval): Action {
  return Action.skewBy(x, 1, duration);
};

Action.skewByY = function(y: number, duration: TimeInterval): Action {
  return Action.skewBy(1, y, duration);
};

Action.skewTo = function(a: number | VectorLike, b: number | TimeInterval, c?: TimeInterval): Action {
  return typeof a === 'number'
    ? c == null
      ? new SkewToAction(a, a, b)
      : new SkewToAction(a, b, c)
    : new SkewToAction(a.x, a.y, b);
};

Action.skewToX = function(x: number, duration: TimeInterval): Action {
  return new SkewToAction(x, null, duration);
};

Action.skewToY = function(y: number, duration: TimeInterval): Action {
  return new SkewToAction(null, y, duration);
};

Action.fadeIn = function(duration: TimeInterval): Action {
  return new FadeInAction(duration);
};

Action.fadeOut = function(duration: TimeInterval): Action {
  return new FadeOutAction(duration);
};

Action.fadeAlphaTo = function(alpha: number, duration: TimeInterval): Action {
  return new FadeAlphaToAction(alpha, duration);
};

Action.fadeAlphaBy = function(alpha: number, duration: TimeInterval): Action {
  return new FadeByAction(alpha, duration);
};

Action.tintTo = function(tint: HexColor, duration: TimeInterval): Action {
  return new TintToAction(tint, duration);
};

Action.animate = function(
  a: PixiTexture[]
    | PixiSpritesheet
    | { frames: PixiTexture[] } & AnimateOptions
    | { spritesheet: PixiSpritesheet; } & AnimateSpritesheetOptions,
  b?: AnimateOptions
): Action {
  if (Array.isArray(a)) return new AnimateAction(a, b);
  if ('textures' in a) return AnimateAction.fromSpritesheet(a, b);

  return ('spritesheet' in a)
    ? AnimateAction.fromSpritesheet(a.spritesheet, a)
    : new AnimateAction(a.frames, a);
};

Action.hide = function(): Action {
  return new SetVisibleAction(false);
};

Action.unhide = function(): Action {
  return new SetVisibleAction(true);
};

Action.destroy = function(options) {
  return Action.run((target) => target.destroy(options));
};

Action.removeFromParent = function(): Action {
  return Action.run((target) => target.parent?.removeChild(target));
};

Action.runOnChild = function(childLabel: string, action: Action): Action {
  return new RunOnChildAction(action, childLabel);
};

Action.run = function(blockFn: (target: Target) => void): Action {
  return new RunBlockAction(blockFn);
};

Action.custom = function(
  duration: number,
  stepFn: (target: Target, t: number, dt: number) => void
): Action {
  return new CustomAction(duration, stepFn);
};

Action.customAction = Action.custom;
