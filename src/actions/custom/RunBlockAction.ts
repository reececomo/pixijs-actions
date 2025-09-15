import { Action } from '../../lib/Action';

export type BlockFunction = (target: TargetNode) => void;

export class RunBlockAction extends Action {
  protected readonly fn: (target: TargetNode) => void;

  public constructor(fn: BlockFunction) {
    super(0);
    this.fn = fn;
  }

  public reversed(): Action {
    return new RunBlockAction(this.fn)._mutate(this);
  }

  protected onTick(target: TargetNode): void {
    this.fn(target);
  }
}
