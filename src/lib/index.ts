// apply mixins
import { Action } from './ActionClass';
import { ActionTicker } from "./ActionTicker";

import './Action.mixin.initializers';
import './Action.mixin.defaults';
import './Action.mixin.tick';

// exports
export { Action, ActionTicker };
export { Timing, type TimingFunction, type TimingKey } from './Timing';
