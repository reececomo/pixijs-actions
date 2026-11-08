import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';


type SizedTarget = Target & ISize;
type Data = ISize;

export class ScaleToSizeAction extends Action {
  protected readonly width: number;
  protected readonly height: number;

  public constructor(
    width: number,
    height: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this.width = width;
    this.height = height;
  }

  public reversed(): Action {
    return new ScaleToSizeAction(this.width, this.height, this.duration)._apply(this);
  }

  public _onTickerAdded(target: SizedTarget, { data }: IActionTicker<Data>): Data {
    if (typeof target.width !== 'number' || typeof target.height !== 'number') {
      throw new TypeError("Action target must have 'width' and 'height'.");
    }

    if (data === undefined) {
      return {
        width: target.width,
        height: target.height,
      };
    }

    data.width = target.width;
    data.height = target.height;

    return data;
  }

  public _onTickerUpdate(target: SizedTarget, { data, t }: IActionTicker): void {
    target.width = data.width + (this.width - data.width) * t;
    target.height = data.height + (this.height - data.height) * t;
  }
}
