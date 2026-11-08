import { Container } from "pixi.js";
import { Action } from "../index";
import { ActionTicker } from "../lib/ActionTicker";
import { MockSprite, MockTexture } from "./MockSprite";
import { simulateTime } from "./testHelpers";

import "../globals.d.ts";

const TICK_MS = 1_000 / 60;

function tick(times = 1): void {
  for (let i = 0; i < times; i++) Action.tick(TICK_MS);
}

function logger(log: string[], label: string, fn?: (target: Target) => void): Action {
  return Action.custom(1_000, (target) => {
    log.push(label);
    fn?.(target);
  });
}

function rootTicker(target: Target): any {
  const tickers = (ActionTicker as any).tickers.get(target);
  return tickers ? [...tickers.values()][0] : undefined;
}

describe('ActionTicker.tickAll()', () => {
  it('ticks targets and actions in insertion order', () => {
    const log: string[] = [];
    const a = new Container();
    const b = new Container();

    a.run(logger(log, 'a1'));
    b.run(logger(log, 'b1'));
    a.run(logger(log, 'a2'));

    tick();
    expect(log).toEqual(['a1', 'a2', 'b1']);
  });

  it('continues ticking when an action removes itself', () => {
    const log: string[] = [];
    const node = new Container();

    node.runWithKey('a1', logger(log, 'a1', () => node.removeAction('a1')));
    node.run(logger(log, 'a2'));

    tick(2);
    expect(log).toEqual(['a1', 'a2', 'a2']);
    expect(node.action('a1')).toBeUndefined();
  });

  it('skips a sibling removed before it ticks', () => {
    const log: string[] = [];
    const node = new Container();

    node.run(logger(log, 'a1', () => node.removeAction('a2')));
    node.runWithKey('a2', logger(log, 'a2'));
    node.run(logger(log, 'a3'));

    tick(2);
    expect(log).toEqual(['a1', 'a3', 'a1', 'a3']);
  });

  it('continues ticking when a sibling that already ticked is removed', () => {
    const log: string[] = [];
    const node = new Container();

    node.runWithKey('a1', logger(log, 'a1'));
    node.run(logger(log, 'a2', () => node.removeAction('a1')));
    node.run(logger(log, 'a3'));

    tick(2);
    expect(log).toEqual(['a1', 'a2', 'a3', 'a2', 'a3']);
  });

  it('removes all actions when the target is destroyed mid-tick', () => {
    const log: string[] = [];
    const a = new Container();
    const b = new Container();

    a.run(logger(log, 'a1', () => a.destroy()));
    a.run(logger(log, 'a2'));
    b.run(logger(log, 'b1'));

    tick(2);
    expect(log).toEqual(['a1', 'b1', 'b1']);
    expect(a.hasActions()).toBe(false);
  });

  it('skips a later target destroyed mid-tick', () => {
    const log: string[] = [];
    const a = new Container();
    const b = new Container();
    const c = new Container();

    a.run(logger(log, 'a1', () => b.destroy()));
    b.run(logger(log, 'b1'));
    c.run(logger(log, 'c1'));

    tick();
    expect(log).toEqual(['a1', 'c1']);
    expect(b.hasActions()).toBe(false);
  });

  it('skips a later target whose actions are removed mid-tick', () => {
    const log: string[] = [];
    const a = new Container();
    const b = new Container();
    const c = new Container();

    a.run(logger(log, 'a1', () => b.removeAllActions()));
    b.run(logger(log, 'b1'));
    c.run(logger(log, 'c1'));

    tick();
    expect(log).toEqual(['a1', 'c1']);
  });

  it('ticks actions added mid-tick in the same frame', () => {
    const log: string[] = [];
    const a = new Container();
    const b = new Container();
    const c = new Container();
    let added = false;

    a.run(logger(log, 'a1', () => {
      if (added) return;
      added = true;
      a.run(logger(log, 'a2'));
      c.run(logger(log, 'c1'));
    }));
    b.run(logger(log, 'b1'));

    tick(2);
    expect(log).toEqual(['a1', 'a2', 'b1', 'c1', 'a1', 'a2', 'b1', 'c1']);
  });

  it('appends a target that is removed and re-added mid-tick', () => {
    const log: string[] = [];
    const a = new Container();
    const b = new Container();
    const c = new Container();
    let replaced = false;

    a.run(logger(log, 'a1', () => {
      if (replaced) return;
      replaced = true;
      b.removeAllActions();
      b.run(logger(log, 'b2'));
    }));
    b.run(logger(log, 'b1'));
    c.run(logger(log, 'c1'));

    tick(2);
    expect(log).toEqual(['a1', 'c1', 'b2', 'a1', 'c1', 'b2']);
  });

  it('replaces keyed actions in place', () => {
    const log: string[] = [];
    const node = new Container();

    node.runWithKey('k1', logger(log, 'old'));
    node.run(logger(log, 'a2'));
    node.runWithKey('k1', logger(log, 'new'));

    tick();
    expect(log).toEqual(['new', 'a2']);
  });

  it('removes a failing action and continues', () => {
    const log: string[] = [];
    const node = new Container();

    node.run(Action.custom(1, () => {
      throw new Error('boom');
    }));
    node.run(logger(log, 'a2'));

    const errors = simulateTime(2 / 60);
    expect(errors).toHaveLength(1);
    expect(log).toEqual(['a2', 'a2']);
  });

  it('cleans up targets after all actions complete', () => {
    const nodes = [new Container(), new Container(), new Container()];
    nodes.forEach((node) => node.run(Action.moveByX(10, 0.5)));

    simulateTime(1);

    nodes.forEach((node) => {
      expect(node.hasActions()).toBe(false);
      expect(node.x).toBeCloseTo(10);
    });
    expect((ActionTicker as any).tickers.size).toBe(0);
  });

  it('can run new actions on a target after its actions complete', () => {
    const node = new Container();

    node.run(Action.moveByX(10, 0.5));
    simulateTime(1);
    node.run(Action.moveByX(10, 0.5));
    simulateTime(1);

    expect(node.x).toBeCloseTo(20);
    expect(node.hasActions()).toBe(false);
  });
});

describe('pause and speed', () => {
  it('multiplies speed through every ancestor', () => {
    const grandparent = new Container();
    const parent = new Container();
    const node = new Container();
    grandparent.addChild(parent);
    parent.addChild(node);

    grandparent.speed = 2;
    parent.speed = 0.5;
    node.speed = 3;

    node.run(Action.moveByX(100, 10));
    simulateTime(1);

    expect(node.x).toBeCloseTo(30);
  });

  it('pauses via any ancestor and resumes', () => {
    const grandparent = new Container();
    const parent = new Container();
    const node = new Container();
    grandparent.addChild(parent);
    parent.addChild(node);

    node.run(Action.moveByX(10, 10));
    simulateTime(1);
    expect(node.x).toBeCloseTo(1);

    grandparent.isPaused = true;
    simulateTime(5);
    expect(node.x).toBeCloseTo(1);

    grandparent.isPaused = false;
    simulateTime(1);
    expect(node.x).toBeCloseTo(2);
  });

  it('does not tick targets with zero speed', () => {
    const parent = new Container();
    const node = new Container();
    parent.addChild(node);

    node.run(Action.moveByX(10, 10));
    parent.speed = 0;
    simulateTime(5);

    expect(node.x).toBe(0);
    expect(node.hasActions()).toBe(true);
  });

  it('only pauses the paused subtree', () => {
    const root = new Container();
    const paused = new Container();
    const running = new Container();
    root.addChild(paused, running);

    paused.run(Action.moveByX(10, 10));
    running.run(Action.moveByX(10, 10));
    paused.isPaused = true;
    simulateTime(1);

    expect(paused.x).toBe(0);
    expect(running.x).toBeCloseTo(1);
  });
});

describe('action speed', () => {
  it('completes in its scaled duration', () => {
    const node = new Container();
    const action = Action.moveByX(100, 10).setSpeed(2);

    expect(action.scaledDuration).toBeCloseTo(5);

    node.run(action);
    simulateTime(2.5);
    expect(node.x).toBeCloseTo(50);

    simulateTime(2.5 + 1 / 60);
    expect(node.x).toBeCloseTo(100);
    expect(node.hasActions()).toBe(false);
  });

  it('combines target speed with action speed', () => {
    const node = new Container();
    node.speed = 2;

    node.run(Action.moveByX(100, 10).setSpeed(2));
    simulateTime(1);

    expect(node.x).toBeCloseTo(40);
  });

  it('applies to children of a sped-up sequence', () => {
    const node = new Container();
    const action = Action.sequence([
      Action.moveByX(10, 1),
      Action.moveByX(10, 1),
    ]).setSpeed(2);

    expect(action.scaledDuration).toBeCloseTo(1);

    node.run(action);
    simulateTime(0.5);
    expect(node.x).toBeCloseTo(10);

    simulateTime(0.5 + 1 / 60);
    expect(node.x).toBeCloseTo(20);
    expect(node.hasActions()).toBe(false);
  });

  it('applies to a sped-up child in a sequence', () => {
    const node = new Container();
    const action = Action.sequence([
      Action.moveByX(10, 1).setSpeed(2),
      Action.moveByY(10, 1),
    ]);

    expect(action.scaledDuration).toBeCloseTo(1.5);

    node.run(action);
    simulateTime(0.5);
    expect(node.x).toBeCloseTo(10);
    expect(node.y).toBeCloseTo(0);

    simulateTime(0.5);
    expect(node.y).toBeCloseTo(5);
  });

  it('applies to repeated sped-up actions', () => {
    const node = new Container();
    const action = Action.repeat(Action.moveByX(1, 0.1).setSpeed(2), 10);

    expect(action.scaledDuration).toBeCloseTo(0.5);

    node.run(action);
    simulateTime(0.25);
    expect(node.x).toBeCloseTo(5);

    simulateTime(0.25 + 1 / 60);
    expect(node.x).toBeCloseTo(10);
    expect(node.hasActions()).toBe(false);
  });

  it('returns unused time in the caller\'s time scale', () => {
    const node = new Container();
    const ticker = new ActionTicker(node, Action.moveByX(10, 1).setSpeed(2));

    expect(ticker.tick(0.25)).toBe(-1);
    expect(ticker.tick(0.5)).toBeCloseTo(0.25);
    expect(ticker.isDone).toBe(true);
    expect(node.x).toBeCloseTo(10);
  });
});

describe('update state', () => {
  it('passes progress and its change to update hooks', () => {
    const node = new Container();
    const ts: number[] = [];
    let sum = 0;

    node.run(Action.custom(1, (_, t, dt) => {
      ts.push(t);
      sum += dt;
    }).easeInOut());

    simulateTime(1.5);

    expect(ts[ts.length - 1]).toBe(1);
    expect(sum).toBeCloseTo(1, 10);
    expect(ts.every((t, i) => i === 0 || t >= ts[i - 1])).toBe(true);
  });

  it('starts progress from zero on every repeat cycle', () => {
    const node = new Container();
    const firsts: number[] = [];
    let previous = 1;

    node.run(Action.repeat(Action.custom(0.5, (_, t, dt) => {
      if (t < previous) firsts.push(t - dt);
      previous = t;
    }).easeIn(), 4));

    simulateTime(2.5);

    expect(firsts).toHaveLength(4);
    firsts.forEach((t0) => expect(t0).toBeCloseTo(0, 10));
  });
});

describe('repeating actions', () => {
  it('repeat() accumulates relative actions over many cycles', () => {
    const node = new Container();

    node.run(Action.repeat(Action.moveByX(1, 0.1), 1_000));
    simulateTime(101);

    expect(node.x).toBeCloseTo(1_000, 6);
    expect(node.hasActions()).toBe(false);
  });

  it('repeatForever() accumulates relative actions over many cycles', () => {
    const node = new Container();

    node.run(Action.repeatForever(Action.moveByX(1, 0.1)));
    simulateTime(100);

    expect(node.x).toBeCloseTo(1_000, 6);
  });

  it('re-captures relative scale deltas each cycle', () => {
    const node = new Container();

    node.run(Action.repeat(Action.scaleBy(2, 0.5), 5));
    simulateTime(3);

    expect(node.scale.x).toBeCloseTo(32);
    expect(node.scale.y).toBeCloseTo(32);
  });

  it('re-captures start values of "to" actions each cycle', () => {
    const node = new Container();

    node.run(Action.repeat(Action.sequence([
      Action.moveByX(10, 1),
      Action.moveToX(5, 1),
    ]), 3));

    simulateTime(3.5);
    expect(node.x).toBeCloseTo(10);

    simulateTime(2.5);
    expect(node.x).toBeCloseTo(5);
    expect(node.hasActions()).toBe(false);
  });

  it('repeatForever() oscillates "to" actions without drift', () => {
    const node = new Container();

    node.run(Action.repeatForever(Action.sequence([
      Action.fadeAlphaTo(0, 0.25),
      Action.fadeAlphaTo(1, 0.25),
    ])));

    for (let i = 0; i < 200; i++) {
      simulateTime(0.25);
      expect(node.alpha).toBeCloseTo(i % 2 === 0 ? 0 : 1);
    }
  });

  it('resets every action in a repeated group', () => {
    const node = new Container();

    node.run(Action.repeat(Action.group([
      Action.moveByX(10, 1),
      Action.moveByY(5, 0.5),
      Action.rotateBy(1, 0.25),
    ]), 4));

    simulateTime(5);
    expect(node.x).toBeCloseTo(40);
    expect(node.y).toBeCloseTo(20);
    expect(node.rotation).toBeCloseTo(4);
  });

  it('resets every action in a repeated sequence', () => {
    const node = new Container();

    node.run(Action.repeat(Action.sequence([
      Action.moveByX(10, 0.5),
      Action.moveByY(5, 0.5),
      Action.scaleBy(2, 0.5),
    ]), 3));

    simulateTime(5);
    expect(node.x).toBeCloseTo(30);
    expect(node.y).toBeCloseTo(15);
    expect(node.scale.x).toBeCloseTo(8);
  });

  it('runs completion blocks every cycle', () => {
    const node = new Container();
    let count = 0;

    node.run(Action.repeat(Action.sequence([
      Action.waitForDuration(0.1),
      Action.run(() => count++),
    ]), 50));

    simulateTime(6);
    expect(count).toBe(50);
  });
});

describe('allocations', () => {
  const texture = new MockTexture({ width: 10, height: 10 });

  it.each([
    ['moveTo', () => Action.moveTo(10, 10, 0.1)],
    ['rotateTo', () => Action.rotateTo(1, 0.1)],
    ['skewTo', () => Action.skewTo(1, 1, 0.1)],
    ['tintTo', () => Action.tintTo(0xff0000, 0.1)],
    ['fadeAlphaTo', () => Action.fadeAlphaTo(0.5, 0.1)],
    ['scaleTo', () => Action.scaleTo(2, 0.1)],
    ['scaleBy', () => Action.scaleBy(1.01, 0.1)],
    ['scaleToSize', () => Action.scaleToSize(20, 20, 0.1)],
    ['speedTo', () => Action.speedTo(1, 0.1)],
    ['animate', () => Action.animate([texture, texture] as any, { timePerFrame: 0.05 })],
    ['follow', () => Action.follow([{ x: 0, y: 0 }, { x: 10, y: 0 }], 0.1)],
  ])('reuses %s ticker data across repeat cycles', (_, makeAction) => {
    const node = new MockSprite();

    node.run(Action.repeatForever(makeAction()));
    simulateTime(0.05);

    const childTicker = rootTicker(node).data.childTicker;
    const data = childTicker.data;
    expect(data).toBeDefined();

    simulateTime(1);

    expect(rootTicker(node).data.childTicker).toBe(childTicker);
    expect(childTicker.data).toBe(data);
  });

  it('re-captures reused ticker data each cycle', () => {
    const node = new Container();

    node.run(Action.repeatForever(Action.sequence([
      Action.moveByX(10, 0.5),
      Action.moveToY(5, 0.5),
    ])));
    simulateTime(0.75);

    const moveTo = rootTicker(node).data.childTicker.data.childTickers[1];
    const data = moveTo.data;
    expect(data.y0).toBe(0);

    simulateTime(0.5);
    node.y = -5;
    simulateTime(0.5);

    expect(moveTo.data).toBe(data);
    expect(data.y0).toBe(-5);
    expect(node.y).toBeCloseTo(0);
  });

  it('does not use Map iterators or array iterators while ticking', () => {
    const nodes = [new Container(), new Container(), new Container()];

    nodes.forEach((node) => {
      node.run(Action.repeatForever(Action.moveByX(1, 0.1)));
      node.run(Action.repeatForever(Action.sequence([
        Action.fadeAlphaTo(0, 0.1),
        Action.fadeAlphaTo(1, 0.1),
      ])));
      node.run(Action.repeat(Action.group([
        Action.rotateBy(1, 0.1),
        Action.scaleTo(2, 0.05),
      ]), 1_000));
    });

    simulateTime(0.5);

    const calls: string[] = [];
    const patches: [any, PropertyKey, any][] = [
      [Map.prototype, 'entries', Map.prototype.entries],
      [Map.prototype, 'values', Map.prototype.values],
      [Map.prototype, 'keys', Map.prototype.keys],
      [Map.prototype, 'forEach', Map.prototype.forEach],
      [Map.prototype, Symbol.iterator, Map.prototype[Symbol.iterator]],
      [Array.prototype, 'forEach', Array.prototype.forEach],
      [Array.prototype, Symbol.iterator, Array.prototype[Symbol.iterator]],
    ];

    for (let i = 0; i < patches.length; i++) {
      const proto = patches[i][0], key = patches[i][1], original = patches[i][2];
      proto[key] = function (this: any, ...args: any[]): any {
        calls.push(`${proto === Map.prototype ? 'Map' : 'Array'}.${String(key)}`);
        return original.apply(this, args);
      };
    }

    try {
      simulateTime(2);
    }
    finally {
      for (let i = 0; i < patches.length; i++) {
        patches[i][0][patches[i][1]] = patches[i][2];
      }
    }

    expect(calls).toEqual([]);
    expect(nodes[0].x).toBeCloseTo(25);
  });
});
