import { Container } from 'pixi.js';
import { Action, registerPixiJSActionsMixin, Timing } from '../index';
import { ActionTicker } from '../lib/ActionTicker';

// ----- Setup script: -----

beforeAll(() => {
  // reset defaults
  Action.DefaultTimingEaseIn = Timing.easeInSine;
  Action.DefaultTimingEaseOut = Timing.easeOutSine;
  Action.DefaultTimingEaseInOut = Timing.easeInOutSine;

  // inject mixin
  registerPixiJSActionsMixin(Container);
});

afterEach(() => {
  // clear any in-progress tickers
  ActionTicker.removeAll();
});
