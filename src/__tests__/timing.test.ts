import { Action, Timing } from '../index';

import "../globals.d.ts";

describe('DefaultTiming static properties', () => {
  it('should reflect the DefaultTimingEaseInOut on the root Action type', () => {
    expect(Action.DefaultTimingEaseInOut).toBe(Timing.easeInOutSine);
    expect(Action.fadeIn(0.3).easeInOut().timing).toBe(Timing.easeInOutSine);
    expect(Action.fadeIn(0.3).easeInOut().timing).not.toBe(Timing.easeInCubic);

    // Update to any other function.
    Action.DefaultTimingEaseInOut = Timing.easeInOutCubic;

    expect(Action.DefaultTimingEaseInOut).toBe(Timing.easeInOutCubic);
    expect(Action.fadeIn(0.3).easeInOut().timing).toBe(Timing.easeInOutCubic);
    expect(Action.fadeIn(0.3).easeInOut().timing).not.toBe(Timing.easeInOutSine);

    // Check string setter
    Action.DefaultTimingEaseInOut = "easeInOutBack";

    expect(Action.DefaultTimingEaseInOut).toBe(Timing.easeInOutBack);
  });

  it('should reflect the DefaultTimingEaseIn on the root Action type', () => {
    expect(Action.DefaultTimingEaseIn).toBe(Timing.easeInSine);
    expect(Action.fadeIn(0.3).easeIn().timing).toBe(Timing.easeInSine);
    expect(Action.fadeIn(0.3).easeIn().timing).not.toBe(Timing.easeInCubic);

    // Update to any other function.
    Action.DefaultTimingEaseIn = Timing.easeInCubic;

    expect(Action.DefaultTimingEaseIn).toBe(Timing.easeInCubic);
    expect(Action.fadeIn(0.3).easeIn().timing).toBe(Timing.easeInCubic);
    expect(Action.fadeIn(0.3).easeIn().timing).not.toBe(Timing.easeInSine);

    // Check string setter
    Action.DefaultTimingEaseIn = "easeInBack";

    expect(Action.DefaultTimingEaseIn).toBe(Timing.easeInBack);
  });

  it('should reflect the DefaultTimingEaseOut on the root Action type', () => {
    expect(Action.DefaultTimingEaseOut).toBe(Timing.easeOutSine);
    expect(Action.fadeIn(0.3).easeOut().timing).toBe(Timing.easeOutSine);
    expect(Action.fadeIn(0.3).easeOut().timing).not.toBe(Timing.easeInCubic);

    // Update to any other function.
    Action.DefaultTimingEaseOut = Timing.easeInCubic;

    expect(Action.DefaultTimingEaseOut).toBe(Timing.easeInCubic);
    expect(Action.fadeIn(0.3).easeOut().timing).toBe(Timing.easeInCubic);
    expect(Action.fadeIn(0.3).easeOut().timing).not.toBe(Timing.easeInSine);

    // Check string setter
    Action.DefaultTimingEaseOut = "easeOutBack";

    expect(Action.DefaultTimingEaseOut).toBe(Timing.easeOutBack);
  });
});
