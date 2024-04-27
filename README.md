# 🎬 pixijs-actions &nbsp;[![NPM version](https://img.shields.io/npm/v/pixijs-actions.svg?style=flat-square)](https://www.npmjs.com/package/pixijs-actions) [![test ci/cd status badge](https://github.com/reececomo/pixijs-actions/actions/workflows/test.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/test.yml) [![lint ci/cd status badge](https://github.com/reececomo/pixijs-actions/actions/workflows/lint.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/lint.yml)

**PixiJS Actions** allows developers to easily configure complex, high-performance animations in [PixiJS](https://pixijs.com/).

- 🚀 35+ [built-in actions](#action-initializers), 30+ [smoothing options](#timing-modes)
- 🔀 Reuseable, chainable & reversible actions
- ⌚ Comprehensive speed and pausing support
- ✨ Support for PixiJS v8, v7 and v6.3+
- 🎬 Inspired by actions in [Cocos2d-x](https://docs.cocos2d-x.org/cocos2d-x/v3/en/actions/getting_started.html), [LibGDX](https://libgdx.com/wiki/graphics/2d/scene2d/scene2d#actions), [SpriteKit](https://developer.apple.com/documentation/spritekit/getting_started_with_actions) & many more

## Sample Usage

*Create, configure, and run animations & actions.*

```ts
// Define an action
const spinAndRemove = Action.sequence([
  Action.rotateByDegrees(360, 0.2).easeInOut(),
  Action.fadeOut(0.2).easeIn(),
  Action.removeFromParent(),
  Action.run(() => console.info('✨ done!'))
]);

// Run an action
mySprite.run(spinAndRemove);
```


## Getting Started with PixiJS Actions

*Everything you need to quickly build beautiful animations.*

**PixiJS Actions** is based off the idiomatic and expressive [**SKActions API**](https://developer.apple.com/documentation/spritekit/getting_started_with_actions), extending `Container` to add first-class support for running and managing actions.

The core concepts are:

1. **Nodes:** _Any container (e.g. `Container`, `Sprite`, `Graphics`)_
2. **Actions:** _Stateless, reusable recipes_ (e.g. animations, triggers, and more)
3. **TimingMode & speed:** _Controls for the speed & smoothness of actions and animations_

> _See [Timing Modes](#timing-modes) and [Manipulating Action Speed](#manipulating-action-speed) for more information._

## Installation

*Quick start guide.*

**1.** Install the latest `pixijs-actions` package:

```sh
# npm
npm install pixijs-actions -D

# yarn
yarn add pixijs-actions --dev
```

**2.** Register the mixin & ticker:

```ts
import * as PIXI from 'pixi.js';
import { Action, registerPixiJSActionsMixin } from 'pixijs-actions';

// Register mixin for containers.
registerPixiJSActionsMixin(PIXI.Container);

// Register `Action.tick(...)` with shared ticker
Ticker.shared.add(ticker => Action.tick(ticker.elapsedMS));
```

**For PixiJS v6.3+ / v7+, that might look like:**

```ts
Ticker.shared.add((dt) => Action.tick(dt / 60));
// or
Ticker.shared.add(() => Action.tick(Ticker.shared.elapsedMS));
```

> _If not using the PIXI shared ticker, then put `Action.tick(elapsedMs)` in the appropriate equivalent place (i.e. your `requestAnimationFrame()` render loop)._

**3.** Done!

✨ You are now ready to run your first action!

## Running Actions

*Running actions in your canvas.*

```ts
// Hide me instantly!
mySprite.run(Action.hide(), () => {
  console.log('where did I go?');
});
```

Nodes are extended with a few new methods and properties to make it easy to interact with actions.

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

### Running Identifiable Actions

```ts
// Repeat an action forever!
const spin = Action.repeatForever(Action.rotateBy(5, 1.0));
mySprite.runWithKey(spin, 'spinForever');

// Or remove it later.
mySprite.removeAction('spinForever');
```

### Pausing All Actions

```ts
mySprite.isPaused = true;
// All actions will stop running.
```

### Manipulating Action Speed

Speed can be manipulated on both actions and nodes.

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
// The entire action should now take ~2.5 seconds.

mySprite.parent!.speed = 1 / 4;
// Now we've slowed down mySprite's parent.
// The entire action will now take ~10 seconds.
```

> Note: Since actions are designed to be stateless, the `speed` property is captured when the action runs. Any changes to `speed` or `timingMode` on the action object will not affect actions that have already been run.

## Action Initializers

*Combine these initializers to create expressive animations and behaviors.*

Most actions implement specific predefined animations that are ready to use. If your animation needs fall outside of the suite provided here, then you should implement a custom action (see [Creating Custom Actions](#creating-custom-actions)).

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
| `Action.moveTo(position, duration)` | Move a node to a specified position `{ x, y }` (e.g. `PIXI.Point`, `PIXI.Container`). |  _*No_ |
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
| `Action.scaleTo(size, duration)` | Scale a node to achieve a specified size `{ width, height }` (e.g. `PIXI.ISize`, `PIXI.Container`). |  _*No_ |
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
| `Action.runOnChild(nameOrLabel, action)` | Add an action to a child node. | Yes |
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

### Action Chaining

Many actions can be joined together using `Action.sequence()`, `Action.group()`, `Action.repeat()` and `Action.repeatForever()` to quickly create complex animations:

```ts
import { Action } from 'pixijs-actions';

// Expand and contract smoothly over 2 seconds
const pulsate = Action.sequence([
  Action.scaleTo(1.5, 1.0).easeOut(),
  Action.scaleTo(1, 1.0).easeIn()
]);

// Follow a complex path (e.g. a bezier curve)
const path = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 200, y: 200 }
];
const followPath = Action.follow(path, 5.0);

// Create a 10 second loop that goes back and forth
const moveBackAndForthWhilePulsating = Action.group([
  Action.repeat(pulsate, 5),
  Action.sequence([followPath, followPath.reversed()]),
]);

// ✨ Animate continuously
mySprite.run(Action.repeatForever(moveBackAndForthWhilePulsating));
```

## Timing Modes

Every action has a `timingMode` which controls the timing curve of its execution.

The default timingMode for all actions is `TimingMode.linear`, which causes an animation to occur evenly over its duration.

You can customize the speed curve of actions in many ways:

```ts
// Set default easings:
Action.fadeIn(0.3).easeIn();
Action.fadeIn(0.3).easeOut();
Action.fadeIn(0.3).easeInOut();

// Set a specific TimingMode:
Action.fadeIn(0.3).setTimingMode(TimingMode.easeInOutCubic);

// Set a custom timing function:
Action.fadeIn(0.3).setTimingMode(x => x * x);
```

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

### Default Timing Modes

The `.easeIn()`, `.easeOut()`, `.easeInOut()`, and `.linear()` methods on `Action` instances will set the timing mode of that action to the global default timing mode for that curve type.

| Global setting | Default value | Helper |
| :--- | :--- | :--- |
| `Action.DefaultTimingModeEaseIn` | `TimingMode.easeInSine` | `action.easeIn()` |
| `Action.DefaultTimingModeEaseOut` | `TimingMode.easeOutSine` | `action.easeOut()` |
| `Action.DefaultTimingModeEaseInOut` | `TimingMode.easeInOutSine` | `action.easeInOut()` |
| _(n/a)_ | `TimingMode.linear` | `action.linear()` |

Custom default timing modes can be set like so:

```ts
// Configure defaults:
Action.DefaultTimingModeEaseIn = TimingMode.easeInQuad;
Action.DefaultTimingModeEaseOut = TimingMode.easeOutCirc;
Action.DefaultTimingModeEaseInOut = TimingMode.easeInOutExpo;

// Use defaults:
myNode.run(myAction.easeIn()); // myAction.timingMode === TimingMode.easeInQuad
```

## Creating Custom Actions

Beyond combining chaining actions like `sequence()`, `group()`, `repeat()` and `repeatForever()`, you can provide code that implements your own action.

### Composite Actions

Actions are stateless and reusable, so you can create complex animations once, and then run them on many nodes.

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

### Custom Action (Basic)

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
> - `target` = The node the aciton is runnning against.
> - `t` = Progress of time from 0 to 1, which has been passed through the `timingMode` function.
> - `dt` = delta/change in `t` since last step. Use for relative actions.
>
> _Note: `t` can be outside of 0 and 1 in timing mode functions which overshoot, such as `TimingMode.easeInOutBack`._

This function will be called as many times as the renderer asks over the course of its duration.

### Custom Action (with State)

Here is a practical example:

```ts
// Create a custom action that relies on
// state (radius, inital target position).
const makeOrbitAction = (
  radius: number,
  duration: number
): Action => {
  let startPos: PIXI.IPointData;

  return Action.customAction(duration, (target, t, td) => {
    if (!startPos) {
      // Capture on first run
      startPos = { x: target.x, y: target.y };
    }

    const angle = Math.PI * 2 * t;

    target.position.set(
      startPos.x + radius * Math.cos(angle),
      startPos.y + radius * Math.sin(angle)
    );
  });
};

// Run the custom action
mySprite.run(
  Action.repeatForever(makeOrbitAction(10, 15.0))
);
```

### Contributions

**PixiJS Actions** was originally forked from [srpatel](https://github.com/srpatel)'s awesome [pixi-actions](https://github.com/srpatel/pixi-actions) library, but became a hard fork when we changed approach.
