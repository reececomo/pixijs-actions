/**
 * Built-in timing mode functions.
 */
export class ActionTimingMode {
}
ActionTimingMode.linear = x => x;
ActionTimingMode.easeIn = x => x * x;
ActionTimingMode.easeOut = x => 1 - (1 - x) * (1 - x);
ActionTimingMode.easeInEaseOut = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
// srpatel/pixi-actions timing modes:
ActionTimingMode.smooth = (x) => x * x * (3 - 2 * x);
ActionTimingMode.smooth2 = (x) => ActionTimingMode.smooth(ActionTimingMode.smooth(x));
ActionTimingMode.smoother = (a) => a * a * a * (a * (a * 6 - 15) + 10);
ActionTimingMode.pow2out = (x) => Math.pow(x - 1, 2) * (-1) + 1;
//# sourceMappingURL=ActionTimingMode.js.map