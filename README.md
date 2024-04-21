<div align="center">

# PixiJS Actions

Powerful, lightweight animations in [PixiJS](https://pixijs.com/).

[![NPM version](https://img.shields.io/npm/v/pixijs-actions.svg?style=flat-square)](https://www.npmjs.com/package/pixijs-actions)
[![test](https://github.com/reececomo/pixijs-actions/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/test.yml)
[![lint](https://github.com/reececomo/pixijs-actions/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/lint.yml)

A PixiJS implementation of [Apple's SKActions](https://developer.apple.com/documentation/spritekit/skaction) (forked from [srpatel/pixi-actions](https://github.com/srpatel/pixi-actions)).

</div>

## Installation

`npm install pixijs-actions`

`yarn add pixijs-actions`

## Getting started with Actions

*Create, configure, and run actions in PixiJS.*

You tell nodes to run an instace of `Action` when you want to animate contents of your canvas. When the canvas processes frames of animation, the actions are executed. Some actions are completed in a single frame of animation, while other actions apply changes over multiple frames of animation before completing. The most common use for actions is to animate changes to a node’s properties. For example, you can create actions that move a node, scale or rotate it, or fade its transparency. However, actions can also change the node tree or even execute custom code.

## Basic usage

```ts
import { Action } from 'pixijs-actions';

const fadeOutAndRemove = Action.sequence([
  Action.fadeOut(1.0),
  Action.removeFromParent()
]);

sprite.run(fadeOutAndRemove);
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

*Use these functions to create actions.*

Most actions implement specific predefined animations that are ready to use. If your animation needs fall outside of the suite provided here, then you should implement a custom action. See **Creating Custom Actions** below.

```ts
const razzleDazzle = Action.sequence([
  Action.unhide(),
  Action.fadeIn(0.3),
  Action.scaleTo(2, 0.3).withTimingMode(TimingMode.easeInSine),
  Action.scaleTo(1, 0.3).withTimingMode(TimingMode.easeOutSine),
]);

// ✨ Show mySprite with some flair!
mySprite.run(razzleDazzle);
```

| Action | Description | Reversible? |
| :----- | :---------- | :---------- |
| `Action.group(actions)` | Run multiple actions in parallel. | Yes |
| `Action.sequence(actions)` | Run multiple actions sequentially. | Yes |
| `Action.repeat(action, count)` | Repeat an action a specified number of times. | Yes |
| `Action.repeatForever(action)` | Repeat an action indefinitely. | Yes |
| `Action.moveBy(dx, dy, duration)` | Move a node by a relative amount. | Yes |
| `Action.moveByVector(vector, duration)` | Move a node by a relative vector (e.g. `PIXI.Point`). | Yes |
| `Action.moveByX(dx, duration)` | Move a node horizontally by a relative amount. | Yes |
| `Action.moveByY(dy, duration)` | Move a node vertically by a relative amount. | Yes |
| `Action.moveTo(x, y, duration)` | Move a node to a specified position. |  _*No_ |
| `Action.moveToPoint(point, duration)` | Move a node to a specified position (e.g. `PIXI.Point`). |  _*No_ |
| `Action.moveToX(x, duration)` | Move a node to a specified horizontal position. |  _*No_ |
| `Action.moveToY(y, duration)` | Move a node to a specified vertical position. |  _*No_ |
| `Action.scaleBy(delta, duration)` | Scale a node by a relative amount. | Yes |
| `Action.scaleBy(dx, dy, duration)` | Scale a node by a relative amount. | Yes |
| `Action.scaleByVector(vector, duration)` | Scale a node by a given vector (e.g. `PIXI.Point`). | Yes |
| `Action.scaleXBy(dx, duration)` | Scale a node by a relative amount. | Yes |
| `Action.scaleYBy(dy, duration)` | Scale a node by a relative amount. | Yes |
| `Action.scaleTo(scale, duration)` | Scale a node to a specified value. |  _*No_ |
| `Action.scaleTo(x, y, duration)` | Scale a node to a specified value. |  _*No_ |
| `Action.scaleToSize(vector, duration)` | Scale a node to a specified size (e.g. `PIXI.Point`). |  _*No_ |
| `Action.scaleXTo(x, duration)` | Scale a node to a specified value in the X-axis. |  _*No_ |
| `Action.scaleYTo(y, duration)` | Scale a node to a specified value in the Y-axis. |  _*No_ |
| `Action.fadeIn(duration)` | Fade the alpha to `1.0`. | Yes |
| `Action.fadeOut(duration)` | Fade the alpha to `0.0`. | Yes |
| `Action.fadeAlphaBy(delta, duration)` | Fade the alpha by a relative value. | Yes |
| `Action.fadeAlphaTo(alpha, duration)` | Fade the alpha to a specified value. |  _*No_ |
| `Action.rotateBy(delta, duration)` | Rotate a node by a relative value (in radians). | Yes |
| `Action.rotateByDegrees(delta, duration)` | Rotate a node by a relative value (in degrees). | Yes |
| `Action.rotateTo(radians, duration)` | Rotate a node to a specified value (in radians). |  _*No_ |
| `Action.rotateToDegrees(degrees, duration)` | Rotate a node to a specified value (in degrees). | _*No_ |
| `Action.speedBy(delta, duration)` | Change how fast a node executes actions by a relative value. | Yes |
| `Action.speedTo(speed, duration)` | Set how fast a node executes actions. |  _*No_ |
| `Action.hide()` | Set a node's `visible` property to `false`. | Yes |
| `Action.unhide()` | Set a node's `visible` property to `true`. | Yes |
| `Action.removeFromParent()` | Remove a node from its parent. | _†Identical_ |
| `Action.waitForDuration(duration)` | Idle for a specified interval. | _†Identical_ |
| `Action.waitForDurationWithRange(duration, range)` | Idle for a randomized period of time. | _†Identical_ |
| `Action.run(block)` | Execute a block of code immediately. | _†Identical_ |
| `Action.customAction(duration, stepHandler)` | Execute a custom stepping function over the duration. | _†Identical_ |

#### Reversing Actions
All actions have a `.reversed()` method which will return an action with the reverse action on it. Some actions are **not reversible**, and these cases are noted in the table above:
- _**†Identical:**_ The reverse action will be identical to the action.
- _**\*No:**_ The reverse action will idle for the equivalent duration.

### TimingMode

The default timing mode for actions is `TimingMode.linear`.

You can set a custom `TimingMode` (see options below), or you can provide a custom timing mode function.

|  | InOut | In | Out | Description |
| --------------- | ----- | -- | --- | ----------- |
| **Linear**      | `linear` | - | - | Constant motion with no acceleration or deceleration. |
| **Sine**        | `easeInOutSine` | `easeInSine` | `easeOutSine` | Gentle start and end, with accelerated motion in the middle. |
| **Circ**        | `easeInOutCirc` | `easeInCirc` | `easeOutCirc` | Smooth start and end, faster acceleration in the middle, circular motion. |
| **Cubic**       | `easeInOutCubic` | `easeInCubic` | `easeOutCubic` | Gradual acceleration and deceleration, smooth motion throughout. |
| **Quad**        | `easeInOutQuad` | `easeInQuad` | `easeOutQuad` | Smooth acceleration and deceleration, starts and ends slowly, faster in the middle. |
| **Quartic**     | `easeInOutQuart` | `easeInQuart` | `easeOutQuart` | Slower start and end, increased acceleration in the middle. |
| **Quintic**     | `easeInOutQuint` | `easeInQuint` | `easeOutQuint` | Very gradual start and end, smoother acceleration in the middle. |
| **Expo**        | `easeInOutExpo` | `easeInExpo` | `easeOutExpo` | Very slow start, exponential acceleration, slow end. |
| **Back**        | `easeInOutBack` | `easeInBack` | `easeOutBack` | Starts slowly, overshoots slightly, settles into final position. |
| **Bounce**      | `easeInOutBounce` | `easeInBounce` | `easeOutBounce` | Bouncy effect at the start or end, with multiple rebounds. |
| **Elastic**     | `easeInOutElastic` | `easeInElastic` | `easeOutElastic` | Stretchy motion with overshoot and multiple oscillations. |


### Custom actions

Actions are reusable, so you can create complex animations once, and then run them on many display objects.

```ts
/** A nice gentle rock back and forth. */
const rockBackAndForth = Action.repeatForever(
  Action.sequence([
    Action.group([
      Action.moveXBy(5, 0.33),
      Action.rotateByDegrees(-2, 0.33),
    ]).setTimingMode(TimingMode.easeOutQuad),
    Action.group([
      Action.moveXBy(-10, 0.34),
      Action.rotateByDegrees(4, 0.34),
    ]).setTimingMode(TimingMode.easeInOutQuad),
    Action.group([
      Action.moveXBy(5, 0.33),
      Action.rotateByDegrees(-2, 0.33),
    ]).setTimingMode(TimingMode.easeInQuad),
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
    Action.scaleTo(amount, 1 / amount, duration / 2).setTimingMode(TimingMode.easeOutSine),
    Action.scaleTo(1, duration / 2).setTimingMode(TimingMode.easeInSine)
  ]),
  stretch: (amount: number, duration: number = 0.3) => Action.sequence([
    Action.scaleTo(1 / amount, amount, duration / 2).setTimingMode(TimingMode.easeOutSine),
    Action.scaleTo(1, duration / 2).setTimingMode(TimingMode.easeInSine)
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

## Using Actions with display objects

*Running actions in your canvas.*

```ts
// Hide me instantly.
mySprite.run(Action.hide(), () => {
  console.log('where did I go?');
});
```

Display objects are extended with a few new methods and properties.

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
| `action(forKey): Action \| undefined` | Return an action associated with a specific key. |
| `hasActions(): boolean` | Return a boolean indicating whether the node is executing actions. |
| `removeAllActions(): void` | End and removes all actions from the node. |
| `removeAction(forKey): void` | Remove an action associated with a specific key. |

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

> Note: Since actions are designed to be mostly immutable, the `speed` property is captured when the action runs for the first time.

## Creating Custom Actions

Beyond combining the built-ins with chaining actions like `sequence()`, `group()`, `repeat()` and `repeatForever()`, you can provide code that implements your own action.

### Basic - Custom Action

You can also use the built-in `Action.customAction(duration, stepHandler)` to provide a custom actions:

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

### Advanced - Custom Subclass Action

For more control, you can provide a custom subclass Action which can capture and manipulate state on the underlying action ticker.

```ts
class MyTintAction extends Action {
  constructor(
    protected readonly color: 'red' | 'blue',
    duration: number,
  ) {
    super(duration);
    this.timingMode = TimingMode.easeInOutSine;
  }

  /** (Optional) Setup any initial state here. */
  _setupTicker(target: PIXI.DisplayObject): any {
    // If your action has any target-specific state, it should go here.
    // Anything you return in this function will be availabler as `ticker.data`.
    return {
      startColor: new PIXI.Color(target.tint),
      endColor: new PIXI.Color(this.color === 'red' ? 0xFF0000 : 0x0000FF),
    };
  }

  /** Stepping function. Update the target here. */
  updateAction(
    target: PIXI.DisplayObject,
    progress: number,      // Progress from 0 to 1 after timing mode
    progressDelta: number, // Change in progress
    ticker: any,           // Use `ticker.data` to access any ticker state.
    deltaTime: number,     // The amount of time elapsed (scaled by `speed`).
  ): void {
    const start = ticker.data.startColor;
    const end = ticker.data.endColor;

    const color = new PIXI.Color().setValue([
      start.red + (end.red - start.red) * progress,
      start.green + (end.green - start.green) * progress,
      start.blue + (end.blue - start.blue) * progress
    ]);

    target.tint = color;
  }

  /** Provide a function that reverses the current action. */
  reversed(): Action {
    const oppositeColor = this.color === 'red' ? 'blue' : 'red';

    return new MyTintAction(oppositeColor, this.duration)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }
}
```
