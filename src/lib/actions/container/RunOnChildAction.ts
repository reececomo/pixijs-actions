import { Action } from '../../ActionClass';

interface CompatibilityTarget
{
  label?: string; // PIXI 8+
  name?: string; // PIXI 7

  children: CompatibilityTarget[];

  getChildByLabel?: (label: string) => Target | undefined; // PIXI 8+
}

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

  public _onTickerUpdate(target: Target): void {
    const child = this._getChildByLabel(target as any, this.label);

    if (!child) {
      throw new ReferenceError(`Action target did not have child matching '${this.label}'.`);
    }

    child.run(this.action);
  }

  private _getChildByLabel(
    target: CompatibilityTarget,
    label: string
  ): Target | undefined {
    if (!target.children || !Array.isArray(target.children)) {
      return undefined;
    }

    let child: any;

    if ('getChildByLabel' in target) {
      child = target.getChildByLabel(label);
    }
    else {
      child = target.children.find((child) =>
        child.label === label || child.name === label
      );
    }

    return child;
  }
}