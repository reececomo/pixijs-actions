import { Timing } from "./Timing";


export const Defaults = {

  /**
   * Default `timePerFrame` in seconds for `Action.animate(…)`.
   *
   * @default 1/24 // 24 FPS
   */
  animateTimePerFrame: 1 / 24,

  /**
   * Default timing mode used for ease-in pacing.
   *
   * Set this to update the default `easeIn()` timing mode.
   *
   * @default Timing.easeInSine
   */
  timingEaseIn: Timing.easeInSine,

  /**
   * Default timing mode used for ease-out pacing.
   *
   * Set this to update the default `easeOut()` timing mode.
   *
   * @default Timing.easeOutSine
   */
  timingEaseOut: Timing.easeOutSine,

  /**
   * Default timing mode used for ease-in, ease-out pacing.
   *
   * Set this to update the default `easeInOut()` timing mode.
   *
   * @default Timing.easeInOutSine
   */
  timingEaseInOut: Timing.easeInOutSine,

};
