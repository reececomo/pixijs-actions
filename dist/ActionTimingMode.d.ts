export declare type TimingModeFn = (input: number) => number;
export declare class ActionTimingMode {
    static linear: TimingModeFn;
    static smooth: TimingModeFn;
    static smooth2: TimingModeFn;
    static smoother: TimingModeFn;
    static pow2out: TimingModeFn;
}
