import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';


type TintableTarget = Target & { tint: HexColor; };

interface TintData {
  start: HexColor;
  end: HexColor;
}

export class TintToAction extends Action<TintableTarget, TintData> {
  protected readonly color: HexColor;

  public constructor(
    color: HexColor,
    duration: TimeInterval,
  ) {
    super(duration);

    this.color = color;
  }

  public reversed(): Action {
    return new TintToAction(this.color, this.duration)._apply(this);
  }

  public _onTickerAdded(target: TintableTarget): TintData {
    if (typeof target.tint !== "number") {
      throw new TypeError("Action target must have a 'tint'.");
    }

    return {
      start: target.tint,
      end: this.color,
    };
  }

  public _onTickerUpdate(
    target: TintableTarget,
    t: number,
    _: number,
    { data }: IActionTicker<TintData>
  ): void {
    target.tint = blend(data.start, data.end, t);
  }
}

function blend(a: HexColor, b: HexColor, t: number): HexColor {
  t = Math.max(0, Math.min(1, t));

  const u = 1 - t;
  const ar = (a >> 16) & 0xFF, ag = (a >> 8) & 0xFF, ab = a & 0xFF;
  const br = (b >> 16) & 0xFF, bg = (b >> 8) & 0xFF, bb = b & 0xFF;

  return ((ar * u + br * t) << 16) | ((ag * u + bg * t) << 8) |  (ab * u + bb * t);
}
