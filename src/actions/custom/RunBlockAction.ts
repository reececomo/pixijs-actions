
import { Action } from '../../lib/Action';

export class RunBlockAction extends Action {
  public constructor(
      protected readonly block: () => void
  ) {
    super(0);
  }

  protected onTick(): void {
    this.block();
  }

  public reversed(): Action {
    return this;
  }
}
