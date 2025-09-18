# 🎬 pixijs-actions &nbsp;[![NPM version](https://img.shields.io/npm/v/pixijs-actions.svg)](https://www.npmjs.com/package/pixijs-actions) [![Minzipped](https://badgen.net/bundlephobia/minzip/pixijs-actions@latest)](https://bundlephobia.com/package/pixijs-actions) [![NPM Downloads](https://img.shields.io/npm/dt/pixijs-actions.svg)](https://www.npmjs.com/package/pixijs-actions) [![Tests](https://github.com/reececomo/pixijs-actions/actions/workflows/tests.yml/badge.svg)](https://github.com/reececomo/pixijs-actions/actions/workflows/tests.yml) [![License](https://badgen.net/npm/license/pixijs-actions)](https://github.com/reececomo/pixijs-actions/blob/main/LICENSE)

⚡ Powerful, high-performance animations for PixiJS

| | |
| ------ | ------ |
| 🔮 Simple, declarative API | 🎬 Based on [Cocos2d](https://docs.cocos2d-x.org/cocos2d-x/v3/en/actions/getting_started.html)/[SKActions](https://developer.apple.com/documentation/spritekit/getting_started_with_actions) |
| 🚀 35+ [built-in actions](#action-initializers), 30+ [timing modes](#timing-modes) | 🔀 Reuseable, chainable & reversible |
| 🍃 No dependencies & tree-shakeable | ⌚ Full speed/pausing control |
| 🤏 <5kB minzipped | ✨ Supports PixiJS 8+, 7+, 6.3+ |


## Sample Usage

*Create, configure, and run animations & actions.*

```ts
// Define an action
const spinAndRemoveAction = Action.sequence([
  Action.group([
    Action.fadeOut(0.2),
    Action.scaleTo(0, 0.2).easeInOut(),
    Action.rotateByDegrees(-360, 0.2).easeIn(),
  ]),
  Action.run(() => console.info('✨ done!')),
  Action.destroy(false),
]);

// Run an action
myContainer.run(spinAndRemoveAction);
```

## Getting Started with PixiJS Actions

*Everything you need to quickly build beautiful animations.*

**PixiJS Actions** is based off the idiomatic and expressive [**SKActions API**](https://developer.apple.com/documentation/spritekit/getting_started_with_actions), extending `Container` to add first-class support for running and managing actions.

The core concepts are:

1. **Nodes:** _Any container (e.g. `Container`, `Sprite`, `Graphics`)_
2. **Actions:** _Stateless, reusable recipes_ (e.g. animations, triggers, and more)
3. **Timing & speed:** _Controls for the speed & smoothness of actions and animations_

> [!NOTE]
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

// register container mixin
registerPixiJSActionsMixin(PIXI.Container);

// register `Action.tick(...)` with shared ticker
Ticker.shared.add((ticker) => Action.tick(ticker.elapsedMS));
```

> [!TIP]
> **PixiJS 7 / 6.3+:**
> 
> ```ts
> Ticker.shared.add(() => Action.tick(Ticker.shared.elapsedMS));
> // or
> Ticker.shared.add((dt) => Action.tick(dt));
> ```

> [!NOTE]
> _If not using a PixiJS ticker, then just put `Action.tick(elapsedMs)` in the appropriate equivalent place (i.e. your `requestAnimationFrame()` render loop)._

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
| `runWithKey(key, action)` | Run an action, and store it so it can be retrieved later. |
| `runAsPromise(action): Promise<void>` | Run an action as a promise. |
| `action(forKey): Action \| undefined` | Return an action associated with a specified key. |
| `hasActions(): boolean` | Return a boolean indicating whether the node is executing actions. |
| `removeAllActions(): void` | End and removes all actions from the node. |
| `removeAction(forKey): void` | Remove an action associated with a specified key. |

### Running Identifiable Actions

```ts
// Repeat an action forever!
const spin = Action.repeatForever(Action.rotateBy(5, 1.0));
mySprite.runWithKey("spinForever", spin);

// Or remove it later.
mySprite.removeAction("spinForever");

// Or destroy a node to clear all of its actions.
mySprite.destroy(false);
```

### Pausing All Actions

```ts
mySprite.isPaused = true;
// All actions will stop running.
```

### Manipulating Action Speed

Speed can be manipulated on both actions and nodes to create complex interactions.

```ts
const myMoveAction = Action.moveByX(10, 4.0);
const myRepeatAction = Action.repeat(myMoveAction, 5);
// myRepeatAction will complete in 20.0 seconds

myMoveAction.setSpeed(2);
myRepeatAction.setSpeed(2);
// myRepeatAction will now complete in 5.0 seconds.

myContainer.speed = 2;
myContainer.runAction(myRepeatAction);
// myContainer will complete myRepeatAction in 2.5 seconds.

myContainer.parent.speed = 0.25;
// myContainer will now complete myRepeatAction in 10.0 seconds.
```

> [!NOTE]
> Changes to nodes' `speed` will take effect immediately, however changes to an `Action` initializer's `speed` or `timing` will not affect any actions that have already started.

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
|***Animating a Sprite by Changing its Texture***|||
| `Action.animate({ frames, timePerFrame?, resize?, restore? })` | Animate a sprite by changing its texture. See options. | Yes |
| `Action.animate({ spritesheet, timePerFrame?, resize?, restore?, sortKeys? })` | Animate a sprite by changing its texture an entire spritesheet as frames. See options. | Yes |
|***Controlling a Node's Visibility***|||
| `Action.hide()` | Set `visible` to `false`. | Yes |
| `Action.unhide()` | Set `visible` to `true`. | Yes |
|***Removing a Node from the Canvas***|||
| `Action.destroy(options?)` | Remove and destroy a node and its actions. |  _†Identical_ |
| `Action.removeFromParent()` | Remove a node from its parent. | _†Identical_ |
|***Running Actions on Children***|||
| `Action.runOnChild(childLabel, action)` | Add an action to a child node. | Yes |
|***Delaying Actions***|||
| `Action.waitForDuration(duration)` | Idle for a specified period of time. | _†Identical_ |
| `Action.waitForDurationWithRange(duration, range)` | Idle for a randomized period of time. | _†Identical_ |
|***Triggers and Custom Actions***|||
| `Action.run(callback)` | Execute a custom function. | _†Identical_ |
| `Action.custom(duration, callback)` | Execute a custom stepping function over the action duration. | _†Identical_ |
|***Manipulating the Action Speed of a Node***|||
| `Action.speedBy(delta, duration)` | Change how fast a node executes its actions by a relative value. | Yes |
| `Action.speedTo(speed, duration)` | Set how fast a node executes actions to a specified value. |  _*No_ |

> [!IMPORTANT]
> #### Reversing Actions
> Every action initializer has a `.reversed()` method which will return a new action. Some actions are **not reversible**, and these cases are noted in the table above:
> - _**†Identical**_ &mdash; The reversed action is identical to the original action.
> - _**\*No**_ &mdash; The reversed action will idle for the equivalent duration.

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

Every action has a `timing` function which controls the timing curve of its execution.

The default timing mode for all actions is `Timing.linear`, which causes an animation to occur evenly over its duration.

You can customize the speed curve of actions in many ways:

```ts
// Default easings:
Action.fadeIn(1.0).easeIn();
Action.fadeIn(1.0).easeOut();
Action.fadeIn(1.0).easeInOut();

// Set a specific timing:
Action.fadeIn(1.0).setTiming(Timing.easeInOutCubic);

// You may also use timing function names:
Action.fadeIn(1.0).setTiming("easeInOutCubic");

// Or provide a custom function:
Action.fadeIn(1.0).setTiming((x) => x * x);
```

> [!IMPORTANT]
> **Timing Mutators:** The `.easeIn()`, `.easeOut()`, `.easeInOut()`, `setTiming(…)`, `setSpeed(…)` methods mutate the underlying action.

### Built-in Timing Functions

See the following table for the built-in `Timing` modes:

| Pattern | Ease In, Ease Out | Ease In | Ease Out | Description |
| --------------- | ----- | -- | --- | ----------- |
| **Linear** | `linear` | - | - | Constant motion with no acceleration or deceleration. |
| **Sine** | `easeInOutSine` | `easeInSine` | `easeOutSine` | Gentle start and end, with accelerated motion in the middle. |
| **Circular** | `easeInOutCirc` | `easeInCirc` | `easeOutCirc` | Smooth start and end, faster acceleration in the middle, circular motion. |
| **Cubic** | `easeInOutCubic` | `easeInCubic` | `easeOutCubic` | Gradual acceleration and deceleration, smooth motion throughout. |
| **Quadratic** | `easeInOutQuad` | `easeInQuad` | `easeOutQuad` | Smooth acceleration and deceleration, starts and ends slowly, faster in the middle. |
| **Quartic** | `easeInOutQuart` | `easeInQuart` | `easeOutQuart` | Slower start and end, increased acceleration in the middle. |
| **Quintic** | `easeInOutQuint` | `easeInQuint` | `easeOutQuint` | Very gradual start and end, smoother acceleration in the middle. |
| **Exponential** | `easeInOutExpo` | `easeInExpo` | `easeOutExpo` | Very slow start, exponential acceleration, slow end. |
| **Back** | `easeInOutBack` | `easeInBack` | `easeOutBack` | Starts slowly, overshoots slightly, settles into final position. |
| **Bounce** | `easeInOutBounce` | `easeInBounce` | `easeOutBounce` | Bouncy effect at the start or end, with multiple rebounds. |
| **Elastic** | `easeInOutElastic` | `easeInElastic` | `easeOutElastic` | Stretchy motion with overshoot and multiple oscillations. |

### Default Timing Modes

The `.easeIn()`, `.easeOut()`, and `.easeInOut()` mutator methods on `Action` instances will set the timing mode of that action to the default curve mode for that timing type.

| Mutator | Global setting | Default value |
| :--- | :--- | :--- |
| `action.easeIn()` | `Action.DefaultTimingEaseIn` | `easeInSine` |
| `action.easeOut()` | `Action.DefaultTimingEaseOut` | `easeOutSine` |
| `action.easeInOut()` | `Action.DefaultTimingEaseInOut` | `easeInOutSine` |
| `action.linear()` | _(n/a)_ | `linear` |

Global default timing modes can be set like so:

```ts
// set default
Action.DefaultTimingEaseIn = Timing.easeInQuad;

// apply
myNode.run(myAction.easeIn());

myAction.timing
// Timing.easeInQuad
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

You can use the built-in `Action.custom(duration, stepFunction)` to provide custom actions:

```ts
const rainbowColors = Action.custom(5.0, (target, t, dt) => {
  // Calculate color based on time "t" (0 -> 1).
  const colorR = Math.sin(0.3 * t + 0) * 127 + 128;
  const colorG = Math.sin(0.3 * t + 2) * 127 + 128;
  const colorB = Math.sin(0.3 * t + 4) * 127 + 128;

  // Apply random color with time-based variation.
  target.tint = (colorR << 16) + (colorG << 8) + colorB;
});

// Start rainbow effect
mySprite.runWithKey("rainbow", Action.repeatForever(rainbowColors));

// Stop rainbow effect
mySprite.removeAction("rainbow");
```

> **Step functions:**
> - `target` = The node the aciton is runnning against.
> - `t` = Progress of time from 0 to 1, which has been passed through the `timing` function.
> - `dt` = delta/change in `t` since last step. Use for relative actions.
>
> _Note: `t` can be outside of 0 and 1 in timing mode functions which overshoot, such as `Timing.easeInOutBack`._

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

  return Action.custom(duration, (target, t, td) => {
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

## Container Lifecycle

As soon as a node is destroyed, all actions on the node are canceled (including chained actions like `Action.group()` and `Action.sequence()`).

### Destructive Actions

The **destroy(…)** action will remove a node from the scene graph, canceling any other remaining or in-progress animations.

```ts
const killAndRemoveAnimation = Action.sequence([
  Action.group([
    Action.rotateByDegrees( 360, 1.0 ).easeIn(),
    Action.fadeOut( 1.0 )
  ]),
  Action.destroy(true),
  Action.run(() => console.info('✨ done!')) // 🚨 Unreachable!
]);

mySprite.run( killAndRemoveAnimation );
```

### Contributions

**PixiJS Actions** was originally based on [srpatel](https://github.com/srpatel)'s awesome [pixi-actions](https://github.com/srpatel/pixi-actions) library.
