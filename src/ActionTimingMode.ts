/**
 * Timing mode function.
 * @see https://easings.net for examples
 */
export type TimingModeFn = (input: number) => number;

/**
 * Built-in timing mode functions.
 */
export class ActionTimingMode {
	public static linear: TimingModeFn = x => x;
	public static easeIn: TimingModeFn = x => x * x;
	public static easeOut: TimingModeFn = x => 1 - (1 - x) * (1 - x);
	public static easeInEaseOut: TimingModeFn = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

	// srpatel/pixi-actions timing modes:

	public static smooth: TimingModeFn = (x: number) => x * x * (3 - 2 * x);
	public static smooth2: TimingModeFn = (x: number) => ActionTimingMode.smooth(ActionTimingMode.smooth(x));
	public static smoother: TimingModeFn = (a: number) => a * a * a * (a * (a * 6 - 15) + 10);
	public static pow2out: TimingModeFn = (x: number) => Math.pow(x - 1, 2) * (-1) + 1;
}
