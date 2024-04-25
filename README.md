<div align="center">

# 🎬 PixiJS Actions

Powerful, lightweight animations in [PixiJS](https://pixijs.com/).

[![NPM version](https://img.shields.io/npm/v/pixijs-actions.svg?style=flat-square)](https://www.npmjs.com/package/pixijs-actions)
[![test](https://github.com/reececomo/pixijs-actions/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/test.yml)
[![lint](https://github.com/reececomo/pixijs-actions/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/lint.yml)

A PixiJS implementation of [Apple's SKActions](https://developer.apple.com/documentation/spritekit#2242743) (forked from [srpatel/pixi-actions](https://github.com/srpatel/pixi-actions)).

</div>

## Installation

```sh
# npm
npm install pixijs-actions

# yarn
yarn add pixijs-actions
```

## Getting started with Actions

*Create, configure, and run actions in PixiJS.*

You tell nodes to run an instace of `Action` when you want to animate contents of your canvas. When the canvas processes frames of animation, the actions are executed. Some actions are completed in a single frame of animation, while other actions apply changes over multiple frames of animation before completing. The most common use for actions is to animate changes to a node’s properties. For example, you can create actions that move a node, scale or rotate it, or fade its transparency. However, actions can also change the node tree or even execute custom code.

## Basic usage

*Create reusable animations &amp; actions, run them on display objects.*

```ts
const razzleDazzle = Action.sequence([
  Action.fadeIn(0.3),
  Action.rotateByDegrees(360, 0.3).easeInOut(),
]);

// ✨ Show mySprite with some flair!
mySprite.run(razzleDazzle);
```

## Setup

*Quick start guide for first time setup.*

1. First install the package. The library imports as an ES6 module, and includes TypeScript types.

```sh
# npm
npm install pixijs-actions

# yarn
yarn add pixijs-actions
```

2. Import `pixijs-actions` somewhere in your application. The global mixins and their types are automatically registered when you import the library.

3. Register the global ticker with your PixiJS app (or other render loop):

```ts
import { Action } from 'pixijs-actions';

const myApp = new PIXI.Application({ ... });

// PixiJS v8:
myApp.ticker.add(ticker => Action.tick(ticker.deltaTime));

// or PixiJS v6 + v7:
myApp.ticker.add(dt => Action.tick(dt));
```

Now you are ready to start using actions!

## Action Initializers

*Combine these initializers to create complex animations.*

Most actions implement specific predefined animations that are ready to use. If your animation needs fall outside of the suite provided here, then you should implement a custom action. See **Creating Custom Actions** below.

```ts
import { Action } from 'pixijs-actions';

// ✨ Expand and contract smoothly over 2 seconds.
const pulsate = Action.sequence([
  Action.scaleTo(1.5, 1.0).easeOut(),
  Action.scaleTo(1, 1.0).easeIn()
]);

// ✨ Follow a complex path (e.g. a bezier curve).
const path = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 200, y: 200 }
];
const followPath = Action.follow(path, 5.0);

// ✨ Create a 10 second loop.
const moveBackAndForthWhilePulsating = Action.group([
  Action.repeat(pulsate, 5),
  Action.sequence([followPath, followPath.reversed()]),
]);

// ✨ Animate continuously.
mySprite.run(Action.repeatForever(moveBackAndForthWhilePulsating));
```

| Action | Description | Reversible? |
| :----- | :---------- | :---------- |
|***Chaining Actions***|||
| `Action.group(actions)` | Run multiple actions in parallel. | Yes |
| `Action.sequence(actions)` | Run multiple actions sequentially. | Yes |
| `Action.repeat(action, count)` | Repeat an action a specified number of times. | Yes |
| `Action.repeatForever(action)` | Repeat an action indefinitely. | Yes |
|***Animating a Node's Position in a Linear Path***|||
| `Action.moveBy(vector, duration)` | Move a node by a relative vector `{ x, y }` (e.g. `PIXI.Point`). | Yes |
| `Action.moveBy(dx, dy, duration)` | Move a node by relative values. | Yes |
| `Action.moveByX(dx, duration)` | Move a node horizontally by a relative value. | Yes |
| `Action.moveByY(dy, duration)` | Move a node vertically by a relative value. | Yes |
| `Action.moveTo(position, duration)` | Move a node to a specified position `{ x, y }` (e.g. `PIXI.Point`, `PIXI.DisplayObject`). |  _*No_ |
| `Action.moveTo(x, y, duration)` | Move a node to a specified position. |  _*No_ |
| `Action.moveToX(x, duration)` | Move a node to a specified horizontal position. |  _*No_ |
| `Action.moveToY(y, duration)` | Move a node to a specified vertical position. |  _*No_ |
|***Animating a Node's Position Along a Custom Path***|||
| `Action.follow(path, duration)` | Move a node along a path, optionally orienting the node to the path. |  Yes | Yes |
| `Action.followAtSpeed(path, speed)` | Move a node along a path at a specified speed, optionally orienting the node to the path. |  Yes |
|***Animating the Rotation of a Node***|||
| `Action.rotateBy(delta, duration)` | Rotate a node by a relative value (in radians). | Yes |
| `Action.rotateByDegrees(delta, duration)` | Rotate a node by a relative value (in degrees). | Yes |
| `Action.rotateTo(radians, duration)` | Rotate a node to a specified value (in radians). |  _*No_ |
| `Action.rotateToDegrees(degrees, duration)` | Rotate a node to a specified value (in degrees). | _*No_ |
|***Animating the Scaling of a Node***|||
| `Action.scaleBy(vector, duration)` | Scale a node by a relative vector `{ x, y }` (e.g. `PIXI.Point`). | Yes |
| `Action.scaleBy(scale, duration)` | Scale a node by a relative value. | Yes |
| `Action.scaleBy(dx, dy, duration)` | Scale a node in each axis by relative values. | Yes |
| `Action.scaleByX(dx, duration)` | Scale a node horizontally by a relative value. | Yes |
| `Action.scaleByY(dy, duration)` | Scale a node vertically by a relative value. | Yes |
| `Action.scaleTo(size, duration)` | Scale a node to achieve a specified size `{ width, height }` (e.g. `PIXI.ISize`, `PIXI.DisplayObject`). |  _*No_ |
| `Action.scaleTo(scale, duration)` | Scale a node to a specified value. |  _*No_ |
| `Action.scaleTo(x, y, duration)` | Scale a node in each axis to specified values. |  _*No_ |
| `Action.scaleToX(x, duration)` | Scale a node horizontally to a specified value. |  _*No_ |
| `Action.scaleToY(y, duration)` | Scale a node vertically to a specified value. |  _*No_ |
|***Animating the Transparency of a Node***|||
| `Action.fadeIn(duration)` | Fade the alpha to `1.0`. | Yes |
| `Action.fadeOut(duration)` | Fade the alpha to `0.0`. | Yes |
| `Action.fadeAlphaBy(delta, duration)` | Fade the alpha by a relative value. | Yes |
| `Action.fadeAlphaTo(alpha, duration)` | Fade the alpha to a specified value. |  _*No_ |
|***Controlling a Node's Visibility***|||
| `Action.unhide()` | Set a node's `visible` property to `true`. | Yes |
| `Action.hide()` | Set a node's `visible` property to `false`. | Yes |
|***Removing a Node from the Canvas***|||
| `Action.removeFromParent()` | Remove a node from its parent. | _†Identical_ |
|***Running Actions on Children***|||
| `Action.runOnChildWithName(action, childName)` | Run an action on a named child node. | Yes |
|***Delaying Actions***|||
| `Action.waitForDuration(duration)` | Idle for a specified period of time. | _†Identical_ |
| `Action.waitForDurationWithRange(duration, range)` | Idle for a randomized period of time. | _†Identical_ |
|***Triggers and Custom Actions***|||
| `Action.run(callback)` | Execute a block (i.e. trigger another action). | _†Identical_ |
| `Action.customAction(duration, stepHandler)` | Execute a custom stepping function over the action duration. | _†Identical_ |
|***Manipulating the Action Speed of a Node***|||
| `Action.speedBy(delta, duration)` | Change how fast a node executes its actions by a relative value. | Yes |
| `Action.speedTo(speed, duration)` | Set how fast a node executes actions to a specified value. |  _*No_ |

### About Reversing Actions
All actions have a `.reversed()` method which will return an action with the reverse action on it. Some actions are **not reversible**, and these cases are noted in the table above:
- _**†Identical:**_ The reversed action will be identical to the original action.
- _**\*No:**_ The reversed action will only idle for the equivalent duration.

## Timing Modes

All actions have a `timingMode` which controls the speed curve of its execution.

The default timingMode for all actions is `TimingMode.linear`, which causes an animation to occur evenly over its duration.

You can customize the speed curve of actions like so:

```ts
// Use the defaults
Action.fadeIn(0.3).easeIn();
Action.fadeIn(0.3).easeOut();
Action.fadeIn(0.3).easeInOut();

// Set a TimingMode
Action.fadeIn(0.3).setTimingMode(TimingMode.easeInOutCubic);

// Provide a custom function
Action.fadeIn(0.3).setTimingMode(x => x * x);
```

### Global Defaults

The `.easeInOut()`, `.easeIn()`, and `.easeOut()` methods set the timing mode of the action to the global default timing for that curve type.

You can set any global defaults for these by updating `Action.DefaultTimingModeEaseInOut`, `Action.DefaultTimingModeEaseIn`, and `Action.DefaultTimingModeEaseOut`. The default timing modes for these easings are `TimingMode.easeInOutSine`, `TimingMode.easeInSine`, and `TimingMode.easeOutSine` respectively.

### Built-in TimingMode Options

See the following table for default `TimingMode` options.

| Pattern | Ease In, Ease Out | Ease In | Ease Out | Description |
| --------------- | ----- | -- | --- | ----------- |
| **Linear**      | `linear` | - | - | Constant motion with no acceleration or deceleration. |
| **Sine**        | `easeInOutSine` | `easeInSine` | `easeOutSine` | Gentle start and end, with accelerated motion in the middle. |
| **Circular**        | `easeInOutCirc` | `easeInCirc` | `easeOutCirc` | Smooth start and end, faster acceleration in the middle, circular motion. |
| **Cubic**       | `easeInOutCubic` | `easeInCubic` | `easeOutCubic` | Gradual acceleration and deceleration, smooth motion throughout. |
| **Quadratic**        | `easeInOutQuad` | `easeInQuad` | `easeOutQuad` | Smooth acceleration and deceleration, starts and ends slowly, faster in the middle. |
| **Quartic**     | `easeInOutQuart` | `easeInQuart` | `easeOutQuart` | Slower start and end, increased acceleration in the middle. |
| **Quintic**     | `easeInOutQuint` | `easeInQuint` | `easeOutQuint` | Very gradual start and end, smoother acceleration in the middle. |
| **Exponential**        | `easeInOutExpo` | `easeInExpo` | `easeOutExpo` | Very slow start, exponential acceleration, slow end. |
| **Back**        | `easeInOutBack` | `easeInBack` | `easeOutBack` | Starts slowly, overshoots slightly, settles into final position. |
| **Bounce**      | `easeInOutBounce` | `easeInBounce` | `easeOutBounce` | Bouncy effect at the start or end, with multiple rebounds. |
| **Elastic**     | `easeInOutElastic` | `easeInElastic` | `easeOutElastic` | Stretchy motion with overshoot and multiple oscillations. |

### Custom Actions

Actions are stateless and reusable, so you can create complex animations once, and then run them on many display objects.

```ts
/** A nice gentle rock back and forth. */
const rockBackAndForth = Action.repeatForever(
  Action.group([
    Action.sequence([
      Action.moveByX(5, 0.33).easeOut(),
      Action.moveByX(-10, 0.34).easeInOut(),
      Action.moveByX(5, 0.33).easeIn(),
    ]),
    Action.sequence([
      Action.rotateByDegrees(-2, 0.33).easeOut(),
      Action.rotateByDegrees(4, 0.34).easeInOut(),
      Action.rotateByDegrees(-2, 0.33).easeIn(),
    ]),
  ])
);

// Run it over here
someSprite.run(rockBackAndForth);

// Run it somewhere else
someOtherContainer.run(rockBackAndForth);
```

You can combine these with dynamic actions for more variety:

```ts
const MyActions = {
  squash: (amount: number, duration: number = 0.3) => Action.sequence([
    Action.scaleTo(amount, 1 / amount, duration / 2).easeOut(),
    Action.scaleTo(1, duration / 2).easeIn()
  ]),
  stretch: (amount: number, duration: number = 0.3) => Action.sequence([
    Action.scaleTo(1 / amount, amount, duration / 2).easeOut(),
    Action.scaleTo(1, duration / 2).easeIn()
  ]),
  squashAndStretch: (amount: number, duration: number = 0.3) => Action.sequence([
    MyActions.squash(amount, duration / 2),
    MyActions.stretch(amount, duration / 2),
  ]),
};

// Small squish!
mySprite.run(MyActions.squashAndStretch(1.25));

// Big squish!
mySprite.run(MyActions.squashAndStretch(2.0));
```

## Running Actions on DisplayObjects

*Running actions in your canvas.*

```ts
// Hide me instantly!
mySprite.run(Action.hide(), () => {
  console.log('where did I go?');
});
```

Display objects are extended with a few new methods and properties to make it easy to interact with actions.

| Property | Description |
| :----- | :------ |
| `speed` | A speed modifier applied to all actions executed by the node and its descendants. Defaults to `1.0`. |
| `isPaused` | A boolean value that determines whether actions on the node and its descendants are processed. Defaults to `false`. |

| Method | Description |
| :----- | :------ |
| `run(action)` | Run an action. |
| `run(action, completion)` | Run an action with a completion handler. |
| `runWithKey(action, withKey)` | Run an action, and store it so it can be retrieved later. |
| `runAsPromise(action): Promise<void>` | Run an action as a promise. |
| `action(forKey): Action \| undefined` | Return an action associated with a specified key. |
| `hasActions(): boolean` | Return a boolean indicating whether the node is executing actions. |
| `removeAllActions(): void` | End and removes all actions from the node. |
| `removeAction(forKey): void` | Remove an action associated with a specified key. |

### Running actions

```ts
// Repeat an action forever!
const spin = Action.repeatForever(Action.rotateBy(5, 1.0));
mySprite.runWithKey(spin, 'spinForever');

// Or remove it later.
mySprite.removeAction('spinForever');
```

### Pausing

```ts
mySprite.isPaused = true;
// All actions will stop running.
```

### Manipulating speed

Speed can be manipulated on both display objects, and actions themselves.

```ts
const moveAction = Action.moveByX(10, 4.0);
moveAction.speed = 2.0;
// moveAction will now take only 2 seconds instead of 4.

const repeatAction = Action.repeat(moveAction, 5);
repeatAction.speed = 2.0;
// Each moveAction will only take 1 second, for a total of 5 seconds.

mySprite.run(moveAction);
mySprite.speed = 2.0;
// mySprite is running at 2x speed!
// The entire action should now take 2.5 seconds.

mySprite.parent.speed = 1 / 4;
// Now we've slowed down mySprite's parent.
// The entire action should now take 10 seconds.
```

> Note: Since actions are designed to be stateless, the `speed` property is captured when the action runs. Any changes to `speed` or `timingMode` will not affect animations that have already been run.

## Creating Custom Actions

Beyond combining chaining actions like `sequence()`, `group()`, `repeat()` and `repeatForever()`, you can provide code that implements your own action.

### Action.customAction()

You can use the built-in `Action.customAction(duration, stepHandler)` to provide custom actions:

```ts
const rainbowColors = Action.customAction(5.0, (target, t, dt) => {
  // Calculate color based on time "t".
  const colorR = Math.sin(0.3 * t + 0) * 127 + 128;
  const colorG = Math.sin(0.3 * t + 2) * 127 + 128;
  const colorB = Math.sin(0.3 * t + 4) * 127 + 128;

  // Apply random color with time-based variation.
  target.tint = (colorR << 16) + (colorG << 8) + colorB;
});

// Start rainbow effect
mySprite.runWithKey(Action.repeatForever(rainbowColors), 'rainbow');

// Stop rainbow effect
mySprite.removeAction('rainbow');
```

> **Step functions:**
> - `target` = The display object.
> - `t` = Progress of time from 0 to 1, which has been passed through the `timingMode` function.
> - `dt` = delta/change in `t` since last step. Use for relative actions.
>
> _Note: `t` can be outside of 0 and 1 in timing mode functions which overshoot, such as `TimingMode.easeInOutBack`._

This function will be called as many times as the renderer asks over the course of its duration.
