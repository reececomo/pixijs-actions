import { Container } from "pixi.js";
import { Action } from "../index";
import { simulateTime } from "./testHelpers";

import "../globals.d.ts";

describe('Container isPaused', () => {
  it('pauses actions on this node', () => {
    const action = Action.sequence([
      Action.moveByX(5, 5.0),
      Action.moveByX(5, 5.0).setSpeed(2.0),
    ]);

    expect(action.duration).toBeCloseTo(7.5);
    expect(action.scaledDuration).toBeCloseTo(7.5);

    const node = new Container();
    node.run(action);
    expect(node.hasActions()).toBe(true);

    simulateTime(5.0);
    expect(node.x).toBeCloseTo(5);

    node.isPaused = true;

    // Sanity check: We've paused.
    simulateTime(2.5);
    expect(node.x).toBeCloseTo(5);
    expect(node.hasActions()).toBe(true);
  });

  it('pauses actions on descendant nodes', () => {
    const action = Action.sequence([
      Action.moveByX(5, 5.0),
      Action.moveByX(5, 5.0).setSpeed(2.0),
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
    expect(node.x).toBeCloseTo(5);

    grandparent.isPaused = true;

    // Sanity check: We've paused.
    simulateTime(10.0);
    expect(node.x).toBeCloseTo(5);
    expect(node.hasActions()).toBe(true);
  });
});

describe('Container speed', () => {
  it('modifies speed of descendant nodes actions', () => {
    const action = Action.sequence([
      Action.moveByX(5, 4.0),
      Action.moveByX(5, 4.0).setSpeed(2.0),
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
    expect(node.x).toBeCloseTo(5);

    simulateTime(1.0);
    expect(node.x).toBeCloseTo(10);

    // Sanity check: We've stopped.
    simulateTime(1.0);
    expect(node.x).toBeCloseTo(10);
    expect(node.hasActions()).toBe(false);
  });

  it('modifies speed of own actions', () => {
    const customAction = Action.sequence([
      Action.moveByX(5, 5.0),
      Action.moveByY(5, 5.0).setSpeed(2.0),
    ]);

    expect(customAction.scaledDuration).toBeCloseTo(7.5);

    const myNode = new Container();
    myNode.speed = 2.0;
    expect(myNode.hasActions()).toBe(false);

    myNode.runWithKey("test", customAction);

    simulateTime(2.5);
    expect(myNode.x).toBeCloseTo(5);
    expect(myNode.y).toBeCloseTo(0);

    simulateTime(1.25 + 1e-10);
    expect(myNode.x).toBeCloseTo(5);
    expect(myNode.y).toBeCloseTo(5);

    // Sanity check: We've stopped.
    expect(myNode.hasActions()).toBe(false);
  });
});
