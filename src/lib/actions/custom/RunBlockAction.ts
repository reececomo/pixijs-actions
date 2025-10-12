import { Action } from '../../ActionClass';

export type BlockFunction = (target: Target) => void;

export class RunBlockAction extends Action {
  protected readonly fn: (target: Target) => void;

  public constructor(fn: BlockFunction) {
    super(0);
    this.fn = fn;
  }

  public reversed(): Action {
    return new RunBlockAction(this.fn)._apply(this);
  }

  public _onTickerUpdate(target: Target): void {
    this.fn(target);
  }
}
