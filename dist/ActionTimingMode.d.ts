/**
 * Timing mode function.
 * @see https://easings.net for examples
 */
export declare type TimingModeFn = (input: number) => number;
/**
 * Built-in timing mode functions.
 */
export declare class ActionTimingMode {
    static linear: TimingModeFn;
    static easeIn: TimingModeFn;
    static easeOut: TimingModeFn;
    static easeInEaseOut: TimingModeFn;
    static smooth: TimingModeFn;
    static smooth2: TimingModeFn;
    static smoother: TimingModeFn;
    static pow2out: TimingModeFn;
}
