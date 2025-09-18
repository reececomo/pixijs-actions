import { Timing, type TimingFunction } from "./Timing";

export { PixiJSActions as Action } from "./Action";
export { ActionSettings } from "./lib/ActionSettings";
export { registerPixiJSActionsMixin } from './Container.mixin';
export { Timing, type TimingFunction, type TimingKey } from "./Timing";

/** @deprecated Use `Timing` instead. */
export const TimingMode = Timing;

/** @deprecated Use `TimingFunction` instead. */
export type TimingModeFn = TimingFunction;
