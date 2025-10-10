import { Timing, type TimingFunction } from "./lib";
import { Defaults } from "./lib/Defaults";

// legacy:
/** @deprecated Use `Timing` instead. */
export const TimingMode = Timing;

/** @deprecated Use `TimingFunction` instead. */
export type TimingModeFn = TimingFunction;

/** @deprecated Use `Action.defaults` instead. */
export const ActionSettings = Defaults;

// exports
export * from "./lib";
export { registerPixiJSActionsMixin } from './Container.mixin';
