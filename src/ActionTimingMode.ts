export type TimingModeFn = (input: number) => number;

export class ActionTimingMode {
	public static linear: TimingModeFn = (x: number) => x;

	public static smooth: TimingModeFn = (x: number) => x * x * (3 - 2 * x);
	public static smooth2: TimingModeFn = (x: number) => ActionTimingMode.smooth(ActionTimingMode.smooth(x));
	public static smoother: TimingModeFn = (a: number) => a * a * a * (a * (a * 6 - 15) + 10);

	public static pow2out: TimingModeFn = (x: number) => Math.pow(x - 1, 2) * (-1) + 1;
}
