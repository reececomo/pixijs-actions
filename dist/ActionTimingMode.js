export class ActionTimingMode {
}
ActionTimingMode.linear = (x) => x;
ActionTimingMode.smooth = (x) => x * x * (3 - 2 * x);
ActionTimingMode.smooth2 = (x) => ActionTimingMode.smooth(ActionTimingMode.smooth(x));
ActionTimingMode.smoother = (a) => a * a * a * (a * (a * 6 - 15) + 10);
ActionTimingMode.pow2out = (x) => Math.pow(x - 1, 2) * (-1) + 1;
//# sourceMappingURL=ActionTimingMode.js.map