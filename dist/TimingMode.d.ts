/**
 * Timing mode function.
 *
 * @see {TimingMode} for https://easings.net imports
 */
export type TimingModeFn = (progress: number) => number;
/** A number 0 -> 1 */
type Progress = number;
/**
 * Timing mode functions
 * https://easings.net/
 *
 * @see https://raw.githubusercontent.com/ai/easings.net/master/src/easings/easingsFunctions.ts
 */
export declare const TimingMode: {
    linear: (x: Progress) => number;
    easeInQuad: (x: Progress) => number;
    easeOutQuad: (x: Progress) => number;
    easeInOutQuad: (x: Progress) => number;
    easeInCubic: (x: Progress) => number;
    easeOutCubic: (x: Progress) => number;
    easeInOutCubic: (x: Progress) => number;
    easeInQuart: (x: Progress) => number;
    easeOutQuart: (x: Progress) => number;
    easeInOutQuart: (x: Progress) => number;
    easeInQuint: (x: Progress) => number;
    easeOutQuint: (x: Progress) => number;
    easeInOutQuint: (x: Progress) => number;
    easeInSine: (x: Progress) => number;
    easeOutSine: (x: Progress) => number;
    easeInOutSine: (x: Progress) => number;
    easeInExpo: (x: Progress) => number;
    easeOutExpo: (x: Progress) => number;
    easeInOutExpo: (x: Progress) => number;
    easeInCirc: (x: Progress) => number;
    easeOutCirc: (x: Progress) => number;
    easeInOutCirc: (x: Progress) => number;
    easeInBack: (x: Progress) => number;
    easeOutBack: (x: Progress) => number;
    easeInOutBack: (x: Progress) => number;
    easeInElastic: (x: Progress) => number;
    easeOutElastic: (x: Progress) => number;
    easeInOutElastic: (x: Progress) => number;
    easeInBounce: (x: Progress) => number;
    easeOutBounce: (x: Progress) => number;
    easeInOutBounce: (x: Progress) => number;
};
export {};
