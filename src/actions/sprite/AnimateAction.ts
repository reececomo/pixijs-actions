import { Sprite, Texture } from 'pixi.js';
import { Action } from '../../lib/Action';
import { ActionTicker } from 'src/lib/ActionTicker';
import { IActionTicker } from 'src/lib/IActionTicker';

export class AnimateAction extends Action {
  public constructor(
    protected readonly textures: Texture[],
    protected readonly timePerFrame: number,
    protected readonly resize: boolean,
    protected readonly restore: boolean,
  ) {
    super(textures.length * timePerFrame);
  }

  protected onSetupTicker(target: TargetNode): any {
    if ('texture' in target) {
      return { previousTexture: target.texture };
    }

    throw new Error("Target must be a Sprite");
  }

  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): void {
    if (this.restore) {
      const texture: Texture = ticker.data.previousTexture;

      (target as Sprite).texture = texture;

      if (this.resize) {
        target.width = texture.width;
        target.height = texture.height;
      }
    }
  }

  public reversed(): Action {
    const reversedTextures = [...this.textures].reverse();
    return new AnimateAction(reversedTextures, this.timePerFrame, this.resize, this.restore);
  }

  protected onTick(target: TargetNode, t: number, _dt: number, ticker: ActionTicker): void {
    const i = Math.floor(t * this.textures.length);
    const texture = this.textures[i];

    if (texture === undefined || (target as Sprite).texture === texture) return;

    (target as Sprite).texture = texture;

    if (this.resize) {
      target.width = texture.width;
      target.height = texture.height;
    }
  }
}
