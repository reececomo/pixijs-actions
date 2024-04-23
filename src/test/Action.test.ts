import { Container, Sprite } from 'pixi.js';
import { Action } from '../index';

function simulateTime(seconds: number, steps: number = 100): void {
  const tickMs = seconds / steps * 1_000;

  // Simulate in multiple increments to mimic real world conditions.
  for (let i = 0; i < steps; i++) {
    Action.tick(tickMs);
  }
}

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

      // Sanity check: We're still going.
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
      grandparent.addChild(parent);
      parent.addChild(node);

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
      grandparent.addChild(parent);
      parent.addChild(node);

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
