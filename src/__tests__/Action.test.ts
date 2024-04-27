import { Container, Sprite } from 'pixi.js';
import { Action, TimingMode, registerPixiJSActionsMixin } from '../index';

function simulateTime(seconds: number, steps: number = 100): Error[] {
  const errors: Error[] = [];
  const tickMs = seconds / steps * 1_000;

  // Simulate in multiple increments to mimic real world conditions.
  for (let i = 0; i < steps; i++) {
    Action.tick(tickMs, (error) => errors.push(error));
  }

  return errors;
}

/** Load the Container mixin first. */
beforeAll(() => registerPixiJSActionsMixin(Container));

describe('DefaultTimingMode static properties', () => {
  it('should reflect the DefaultTimingModeEaseInOut on the root Action type', () => {
    expect(Action.DefaultTimingModeEaseInOut).toBe(TimingMode.easeInOutSine);
    expect(Action.fadeIn(0.3).easeInOut().timingMode).toBe(TimingMode.easeInOutSine);
    expect(Action.fadeIn(0.3).easeInOut().timingMode).not.toBe(TimingMode.easeInCubic);

    // Update to any other function.
    Action.DefaultTimingModeEaseInOut = TimingMode.easeInCubic;

    expect(Action.DefaultTimingModeEaseInOut).toBe(TimingMode.easeInCubic);
    expect(Action.fadeIn(0.3).easeInOut().timingMode).toBe(TimingMode.easeInCubic);
    expect(Action.fadeIn(0.3).easeInOut().timingMode).not.toBe(TimingMode.easeInOutSine);
  });

  it('should reflect the DefaultTimingModeEaseIn on the root Action type', () => {
    expect(Action.DefaultTimingModeEaseIn).toBe(TimingMode.easeInSine);
    expect(Action.fadeIn(0.3).easeIn().timingMode).toBe(TimingMode.easeInSine);
    expect(Action.fadeIn(0.3).easeIn().timingMode).not.toBe(TimingMode.easeInCubic);

    // Update to any other function.
    Action.DefaultTimingModeEaseIn = TimingMode.easeInCubic;

    expect(Action.DefaultTimingModeEaseIn).toBe(TimingMode.easeInCubic);
    expect(Action.fadeIn(0.3).easeIn().timingMode).toBe(TimingMode.easeInCubic);
    expect(Action.fadeIn(0.3).easeIn().timingMode).not.toBe(TimingMode.easeInSine);
  });

  it('should reflect the DefaultTimingModeEaseOut on the root Action type', () => {
    expect(Action.DefaultTimingModeEaseOut).toBe(TimingMode.easeOutSine);
    expect(Action.fadeIn(0.3).easeOut().timingMode).toBe(TimingMode.easeOutSine);
    expect(Action.fadeIn(0.3).easeOut().timingMode).not.toBe(TimingMode.easeInCubic);

    // Update to any other function.
    Action.DefaultTimingModeEaseOut = TimingMode.easeInCubic;

    expect(Action.DefaultTimingModeEaseOut).toBe(TimingMode.easeInCubic);
    expect(Action.fadeIn(0.3).easeOut().timingMode).toBe(TimingMode.easeInCubic);
    expect(Action.fadeIn(0.3).easeOut().timingMode).not.toBe(TimingMode.easeInSine);
  });
});

describe('keyed actions', () => {
  it('allows actions to be checked/retrieved', () => {
    const action = Action.sequence([
      Action.moveByX(5, 5.0),
      Action.moveByX(-5, 5.0),
    ]);

    const node = new Container();
    node.runWithKey(action, 'myKey');

    simulateTime(5.0);
    expect(node.position.x).toBeCloseTo(5.0);

    expect(node.action('myKey')).toBe(action);
    expect(node.hasActions()).toBe(true);

    simulateTime(5.0);
    expect(node.position.x).toBeCloseTo(0.0);

    expect(node.action('myKey')).toBeUndefined();
    expect(node.hasActions()).toBe(false);
  });

  it('replaces identical keyed actions on run()', () => {
    const action = Action.sequence([
      Action.moveByX(5, 5.0),
      Action.moveByX(-5, 5.0),
    ]);

    const node = new Container();
    node.runWithKey(action, 'myKey');

    simulateTime(5.0);
    expect(node.position.x).toBeCloseTo(5.0);

    expect(node.action('myKey')).toBe(action);
    expect(node.hasActions()).toBe(true);

    // Run again
    node.runWithKey(action, 'myKey');

    simulateTime(5.0);
    expect(node.position.x).toBeCloseTo(10.0);

    expect(node.action('myKey')).toBe(action);
    expect(node.hasActions()).toBe(true);

    simulateTime(5.0);
    expect(node.position.x).toBeCloseTo(5.0);

    expect(node.action('myKey')).toBeUndefined();
    expect(node.hasActions()).toBe(false);
  });

  it('does not replace non-identical actions on run()', () => {
    const action = Action.sequence([
      Action.moveByX(5, 5.0),
      Action.moveByX(-5, 5.0),
    ]);

    const node = new Container();
    node.runWithKey(action, 'myKey');
    node.runWithKey(action, 'myKey');
    node.run(action);
    node.run(action);

    simulateTime(5.0);
    expect(node.position.x).toBeCloseTo(15.0); // 3/4 should run.

    node.removeAllActions();
  });
});

describe('Action Chaining', () => {
  describe('sequence()', () => {
    it('complete all steps in order', () => {
      const action = Action.sequence([
        Action.moveByX(5, 5.0),
        Action.moveByX(5, 0.0),
        Action.waitForDuration(1.0),
        Action.moveByX(-10, 2.0),
        Action.moveByX(-5, 0.0),
      ]);

      expect(action.duration).toBeCloseTo(8.0);
      expect(action.scaledDuration).toBeCloseTo(8.0);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(5.0);
      expect(node.position.x).toBeCloseTo(10.0);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(10.0);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(5.0);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(-5.0);

      // Sanity check: We've stopped.
      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(-5.0);
      expect(node.hasActions()).toBe(false);
    });

    it('successfully completes nested sequences', () => {
      // this test secretly makes sure squashing works
      const action = Action.sequence([
        Action.sequence([
          Action.sequence([
            Action.moveByX(5, 1.0),
            Action.moveByX(-5, 1.0)
          ]),
          Action.sequence([
            Action.sequence([
              Action.moveByX(5, 1.0),
              Action.moveByX(5, 1.0),
            ]),
            Action.sequence([ // Runs with custom timing mode
              Action.rotateBy(Math.PI, 0.5),
              Action.rotateBy(Math.PI, 0.5),
            ]).easeInOut(),
          ]),
          Action.group([ // Also has 'actions' but not a SequenceAction
            Action.fadeOut(0.5),
            Action.scaleTo({ width: 2, height: 2 }, 1.0),
          ]),
        ]),
        Action.sequence([
          Action.sequence([
            Action.moveByY(-5, 1.0),
            Action.moveByY(5, 1.0),
          ]),
          Action.sequence([
            Action.sequence([
              Action.moveByY(5, 1.0),
              Action.moveByY(5, 1.0),
            ]),
            Action.sequence([ // Runs at half speed
              Action.fadeAlphaTo(0.25, 1.0),
              Action.fadeAlphaBy(0.5, 1.0),
            ]).setSpeed(2),
          ]),
        ]),
      ]);

      expect(action.duration).toBeCloseTo(11.0);
      expect(action.scaledDuration).toBeCloseTo(11.0);

      const node = new Container();
      node.run(action);

      simulateTime(11.0);
      expect(node.position.x).toBeCloseTo(10);
      expect(node.position.y).toBeCloseTo(10);
      expect(node.rotation).toBeCloseTo(Math.PI * 2);
      expect(node.alpha).toBeCloseTo(0.75);

      // Sanity check: We completed.
      expect(node.hasActions()).toBe(false);

      // Ignore that this tests the underlying implementation.
      // Just a lazy hack to make sure it's working nicely.
      expect((action as any).actions.length).toBe(2);
      expect((action as any)._squashedActions().length).toBe(11);
    });

    it('completes regression case', () => {
      const otherNodeA = new Container();
      const otherNodeB = new Container();

      let myRunCompleted = false;

      const action = Action.sequence([
        Action.group([
          Action.waitForDuration(0.25),
          Action.run(() => otherNodeA.run(Action.moveByX(2, 1.0))),
          Action.run(() => otherNodeB.run(Action.moveByX(2, 1.0))),
        ]),
        Action.run(() => myRunCompleted = true),
      ]);

      const myNode = new Container();
      myNode.run(action);

      simulateTime(0.28);

      expect(myNode.hasActions()).toBe(false);
      expect(myRunCompleted).toBe(true);
    });
  });

  describe('group()', () => {
    it('should run all groups simultaneously', () => {
      const action = Action.group([
        Action.moveByX(10, 10.0),
        Action.moveByX(5, 0.0),
        Action.moveByX(-20, 2.0),
      ]);

      expect(action.duration).toBeCloseTo(10.0);
      expect(action.scaledDuration).toBeCloseTo(10.0);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(2.00);
      expect(node.position.x).toBeCloseTo(-13);

      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(-5);

      // Sanity check: We've stopped.
      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(-5);
      expect(node.hasActions()).toBe(false);
    });

    it('should work with repeatForever()', () => {
      const myCustomAction = Action.customAction(5.0, (target, t) => {
        target.position.x = 5.0 * t;
      });

      const myNode = new Container();
      myNode.run(Action.group([Action.repeatForever(myCustomAction)]));

      simulateTime(7.5);

      expect(myNode.hasActions()).toBe(true);
      expect(myNode.x).toBeCloseTo(2.5);

      myNode.removeAllActions();
    });

    it('should work with waitForDuration()', () => {
      const otherNodeA = new Container();
      const otherNodeB = new Container();

      const action = Action.group([
        Action.waitForDuration(0.25),
        Action.run(() => otherNodeA.run(Action.moveByX(2, 1.0))),
        Action.run(() => otherNodeB.run(Action.moveByX(2, 1.0))),
      ]);

      expect(action.duration).toBeCloseTo(0.25);
      expect(action.scaledDuration).toBeCloseTo(0.25);

      const myNode = new Container();
      myNode.runWithKey(action, 'myTriggerAction');

      simulateTime(0.3);

      expect(myNode.action('myTriggerAction')).toBeUndefined();
      expect(myNode.hasActions()).toBe(false);
    });
  });

  describe('repeat()', () => {
    it('should loop accurately', () => {
      const action = Action.repeat(Action.moveByX(2, 1.0), 11);

      expect(action.duration).toBeCloseTo(11.0);
      expect(action.scaledDuration).toBeCloseTo(11.0);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(20);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(22);

      // Sanity check: We've stopped.
      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(22);
      expect(node.hasActions()).toBe(false);
    });

    it('should loop over a group', () => {
      const group = Action.group([
        Action.moveByX(5, 1.0),
        Action.moveByX(5, 0.0),
        Action.waitForDuration(1.0),
      ]);
      const action = Action.repeat(group, 3);

      expect(action.duration).toBeCloseTo(3.0);
      expect(action.scaledDuration).toBeCloseTo(3.0);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(10);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(20);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(30);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(30);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(30);

      // Sanity check: We've stopped.
      expect(node.hasActions()).toBe(false);
    });
  });

  describe('repeatForever()', () => {
    it('should loop accurately', () => {
      const action = Action.repeatForever(Action.moveByX(5, 5.0));

      expect(action.duration).toBe(Infinity);
      expect(action.scaledDuration).toBe(Infinity);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(5.0);
      expect(node.position.x).toBeCloseTo(5);

      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(15);

      simulateTime(10.0);
      expect(node.position.x).toBeCloseTo(25);

      // Sanity check: We're still going.
      expect(node.hasActions()).toBe(true);

      // Cleanup.
      node.removeAllActions();
    });

    it('should loop over a group', () => {
      const group = Action.group([
        Action.moveByX(5, 1.0),
        Action.moveByX(5, 0.0),
        Action.waitForDuration(1.0),
      ]);
      const action = Action.repeatForever(group);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(0.5);
      expect(node.position.x).toBeCloseTo(7.5);

      simulateTime(0.5);
      expect(node.position.x).toBeCloseTo(10);

      simulateTime(0.5);
      expect(node.position.x).toBeCloseTo(17.5);

      simulateTime(0.499999);
      expect(node.position.x).toBeCloseTo(20);

      // Sanity check: We're still going.
      expect(node.hasActions()).toBe(true);

      // Cleanup.
      node.removeAllActions();
    });

    it('should loop over a sequence', () => {
      const group = Action.sequence([
        Action.moveByX(5, 1.0),
        Action.moveByY(5, 1.0),
        Action.waitForDuration(1.0),
      ]);
      const action = Action.repeatForever(group);

      const node = new Container();
      node.run(action);

      simulateTime(3.0);
      expect(node.position.x).toBeCloseTo(5);

      simulateTime(3.0);
      expect(node.position.x).toBeCloseTo(10);

      simulateTime(3.0);
      expect(node.position.x).toBeCloseTo(15);

      // Sanity check: We're still going.
      expect(node.hasActions()).toBe(true);

      // Cleanup.
      node.removeAllActions();
    });
  });
});

describe('Action', () => {
  describe('scaleTo()', () => {
    it('can be initialized with (x, y, duration)', () => {
      const node = new Container();
      expect(node.scale.x).toBe(1); // Sanity check.
      expect(node.scale.y).toBe(1);

      node.run(Action.scaleTo(2, 1.5, 1.0));
      simulateTime(1.0);
      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(1.5);
    });

    it('can be initialized with (scale, duration)', () => {
      const node = new Container();
      expect(node.scale.x).toBe(1); // Sanity check.
      expect(node.scale.y).toBe(1);

      node.run(Action.scaleTo(2, 1.0));
      simulateTime(1.0);
      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(2);
    });

    it('can be initialized with ({ width, height }, duration)', () => {
      const node = new Sprite();
      expect(node.scale.x).toBe(1); // Sanity check.
      expect(node.scale.y).toBe(1);

      node.run(Action.scaleTo({ width: 2, height: 1.5 }, 1.0));
      simulateTime(1.0);
      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(1.5);

      const otherNode = new Sprite();
      otherNode.width = 50;
      otherNode.height = 120;

      node.run(Action.scaleTo(otherNode, 1.0));
      simulateTime(1.0);
      expect(node.width).toBeCloseTo(50);
      expect(node.height).toBeCloseTo(120);
      expect(node.scale.x).toBeCloseTo(50);
      expect(node.scale.y).toBeCloseTo(120);
    });
  });

  describe('scaleBy()', () => {
    it('can be initialized with (x, y, duration)', () => {
      const node = new Container();
      expect(node.scale.x).toBe(1); // Sanity check.
      expect(node.scale.y).toBe(1);

      node.run(Action.scaleTo(2, 1.5, 1.0));
      simulateTime(1.0);
      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(1.5);
    });

    it('can be initialized with (delta, duration)', () => {
      const node = new Container();
      expect(node.scale.x).toBe(1); // Sanity check.
      expect(node.scale.y).toBe(1);

      node.run(Action.scaleBy(2, 1.0));
      simulateTime(1.0);
      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(2);
    });

    it('can be initialized with ({ x, y }, duration)', () => {
      const node = new Container();
      expect(node.scale.x).toBe(1); // Sanity check.
      expect(node.scale.y).toBe(1);

      node.run(Action.scaleBy({ x: 2, y: 1.5 }, 1.0));
      simulateTime(1.0);
      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(1.5);
    });
  });

  describe('runOnChild()', () => {
    it('passes the action to the named child with PixiJS v8 label', () => {
      const childNode: any = new Container();
      childNode.label = 'myChildNode';

      const parentNode = new Container();
      parentNode.addChild(childNode as any);

      parentNode.run(
        Action.runOnChild('myChildNode', Action.rotateBy(Math.PI, 1.0))
      );

      simulateTime(0.5);

      expect(parentNode.hasActions()).toBe(false);
      expect(childNode.hasActions()).toBe(true);

      simulateTime(1.0);

      expect(childNode.rotation).toBeCloseTo(Math.PI);
      expect(childNode.hasActions()).toBe(false);
    });

    it('passes the action to the named child with PixiJS v6/v7 name', () => {
      const childNode = new Container();
      childNode.name = 'myChildNode';

      const parentNode = new Container();
      parentNode.addChild(childNode as any);

      parentNode.run(
        Action.runOnChild('myChildNode', Action.rotateBy(Math.PI, 1.0))
      );

      simulateTime(0.5);

      expect(parentNode.hasActions()).toBe(false);
      expect(childNode.hasActions()).toBe(true);

      simulateTime(1.0);

      expect(childNode.rotation).toBeCloseTo(Math.PI);
      expect(childNode.hasActions()).toBe(false);
    });

    it('errors with ReferenceError when child node does not exist', () => {
      const childNode = new Container();
      childNode.name = 'otherChildNode';

      const parentNode = new Container();
      parentNode.addChild(childNode as any);

      parentNode.run(
        Action.runOnChild('myChildNode', Action.rotateBy(Math.PI, 1.0))
      );

      const errors = simulateTime(0.5);
      expect(errors.length).toBe(1);
      expect(errors[0]).toBeInstanceOf(ReferenceError);

      expect(parentNode.hasActions()).toBe(false);
      expect(childNode.hasActions()).toBe(false);
    });

    it('errors with TypeError when target cannot have children', () => {
      const parentNode = new Container();
      (parentNode as any).children = undefined; // Simulate PixiJS v8

      parentNode.run(
        Action.runOnChild('myChildNode', Action.rotateBy(Math.PI, 1.0))
      );

      const errors = simulateTime(0.5);
      expect(errors.length).toBe(1);
      expect(errors[0]).toBeInstanceOf(TypeError);

      expect(parentNode.hasActions()).toBe(false);
    });
  });

  describe('speedTo()', () => {
    it('changes the nodes action speed', () => {
      const myNode = new Container();

      myNode.run(Action.speedTo(2, 0));

      simulateTime(0.01, 1);

      expect(myNode.speed).toBeCloseTo(2);
    });

    it('changes the nodes action speed over time', () => {
      const myNode = new Container();

      myNode.run(Action.speedTo(2, 10.0));

      simulateTime(8.0);

      // Completes early because speed changes
      expect(myNode.speed).toBeCloseTo(2);
      expect(myNode.hasActions()).toBe(false);
    });
  });

  describe('speedBy()', () => {
    it('changes the nodes action speed', () => {
      const myNode = new Container();

      myNode.run(Action.speedBy(1, 0));

      simulateTime(0.01, 1);

      expect(myNode.speed).toBeCloseTo(2);
    });

    it('changes the nodes action speed over time', () => {
      const myNode = new Container();

      myNode.run(Action.speedBy(1, 10.0));

      simulateTime(8.0);

      // Completes early because speed changes
      expect(myNode.speed).toBeCloseTo(2);
      expect(myNode.hasActions()).toBe(false);
    });
  });

  describe('customAction()', () => {
    it('runs arbitrary code', () => {
      const myCustomAction = Action.customAction(5.0, (target, t, dt) => {
        target.position.x = 5.0 * t;
        target.position.y += 5.0 * dt;
      });

      const myNode = new Container();
      myNode.run(myCustomAction);

      simulateTime(2.5);

      expect(myNode.hasActions()).toBe(true);
      expect(myNode.x).toBeCloseTo(2.5);
      expect(myNode.y).toBeCloseTo(2.5);

      simulateTime(2.49999999);

      expect(myNode.x).toBeCloseTo(5);
      expect(myNode.y).toBeCloseTo(5);
    });
  });
});

describe('Action and nodes', () => {
  describe('speed', () => {
    it('works on nested actions', () => {
      const action = Action.sequence([
        Action.moveByX(5, 5.0),
        Action.moveByX(5, 0.0),
        Action.moveByX(5, 5.0).setSpeed(2.0),
        Action.moveByX(5, 0.0),
      ]);

      expect(action.duration).toBeCloseTo(7.5);
      expect(action.scaledDuration).toBeCloseTo(7.5);

      const node = new Container();
      node.speed = 2.0;
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(2.5);
      expect(node.position.x).toBeCloseTo(10);

      simulateTime(1.25);
      expect(node.position.x).toBeCloseTo(20);

      // Sanity check: We've stopped.
      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(20);
      expect(node.hasActions()).toBe(false);
    });

    it('works on parent values', () => {
      const action = Action.sequence([
        Action.moveByX(5, 4.0),
        Action.moveByX(5, 0.0),
        Action.moveByX(5, 4.0).setSpeed(2.0),
        Action.moveByX(5, 0.0),
      ]);

      expect(action.duration).toBeCloseTo(6.0);
      expect(action.scaledDuration).toBeCloseTo(6.0);

      const grandparent = new Container();
      const parent = new Container();
      const node = new Container();
      grandparent.addChild(parent as any);
      parent.addChild(node as any);

      grandparent.speed = 4.0;
      parent.speed = 0.5;

      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(2.0);
      expect(node.position.x).toBeCloseTo(10);

      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(20);

      // Sanity check: We've stopped.
      simulateTime(1.0);
      expect(node.position.x).toBeCloseTo(20);
      expect(node.hasActions()).toBe(false);
    });
  });

  describe('isPaused', () => {
    it('pauses current actions', () => {
      const action = Action.sequence([
        Action.moveByX(5, 5.0),
        Action.moveByX(5, 0.0),
        Action.moveByX(5, 5.0).setSpeed(2.0),
        Action.moveByX(5, 0.0),
      ]);

      expect(action.duration).toBeCloseTo(7.5);
      expect(action.scaledDuration).toBeCloseTo(7.5);

      const node = new Container();
      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(5.0);
      expect(node.position.x).toBeCloseTo(10);

      node.isPaused = true;

      // Sanity check: We've paused.
      simulateTime(2.5);
      expect(node.position.x).toBeCloseTo(10);
      expect(node.hasActions()).toBe(true);
    });

    it('falls back to parent value', () => {
      const action = Action.sequence([
        Action.moveByX(5, 5.0),
        Action.moveByX(5, 0.0),
        Action.moveByX(5, 5.0).setSpeed(2.0),
        Action.moveByX(5, 0.0),
      ]);

      expect(action.duration).toBeCloseTo(7.5);
      expect(action.scaledDuration).toBeCloseTo(7.5);

      const grandparent = new Container();
      const parent = new Container();
      const node = new Container();
      grandparent.addChild(parent as any);
      parent.addChild(node as any);

      node.run(action);
      expect(node.hasActions()).toBe(true);

      simulateTime(5.0);
      expect(node.position.x).toBeCloseTo(10);

      grandparent.isPaused = true;

      // Sanity check: We've paused.
      simulateTime(12.5);
      expect(node.position.x).toBeCloseTo(10);
      expect(node.hasActions()).toBe(true);
    });
  });
});
