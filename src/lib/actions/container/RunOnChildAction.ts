import { Action } from '../../ActionClass';

type AnyContainer = any;

export class RunOnChildAction extends Action {
  protected readonly action: Action;
  protected readonly label: string;

  public constructor(action: Action, label: string) {
    super(0);

    this.action = action;
    this.label = label;
  }

  public reversed(): Action {
    const reversedAction = this.action.reversed();
    return new RunOnChildAction(reversedAction, this.label)._apply(this);
  }

  public _onTickerTick(target: TargetNode): void {
    const child = this._getChildByLabel(target, this.label);
    if (!child) throw new ReferenceError(`Target did not have child '${this.label}'.`);
    child.run(this.action);
  }

  private _getChildByLabel(target: AnyContainer, label: string): TargetNode | undefined {
    if (!target.children || !Array.isArray(target.children)) {
      return undefined;
    }

    let child: AnyContainer;

    if ('getChildByLabel' in target) {
      child = target.getChildByLabel(label);
    }
    else {
      child = target.children.find((child: AnyContainer) =>
        child.label === label || child.name === label
      );
    }

    return child;
  }
}
