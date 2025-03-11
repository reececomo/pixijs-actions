import { Sprite, Spritesheet, Texture } from 'pixi.js';
import { Action } from '../../lib/Action';
import { IActionTicker } from 'src/lib/IActionTicker';

type AnimateTextureOptions = {
  /**
   * Array of textures to animate.
   */
  frames: Texture[];
}

type AnimateSpritesheetOptions = {
  /**
   * A spritesheet containing textures to animate.
   */
  spritesheet: Spritesheet;
  /**
   * Whether spritesheet frames are sorted on key.
   *
   * @default true
   */
  sortKeys?: boolean;
};

export type AnimateOptions = (AnimateTextureOptions | AnimateSpritesheetOptions) & {
  /**
   * Time to display each texture in seconds.
   *
   * @default Action.DefaultAnimateTimePerFrame
   */
  timePerFrame?: number;

  /**
   * Whether to resize the sprite width and height to match each texture.
   *
   * @default false
   */
  resize?: boolean;

  /**
   * When the action completes or is removed, whether to restore the sprite's
   * texture to the texture it had before the action ran.
   *
   * @default false
   */
  restore?: boolean;
};

export class AnimateAction extends Action {
  protected readonly frames: Texture[];
  protected readonly timePerFrame: number;
  protected readonly resize: boolean;
  protected readonly restore: boolean;

  public constructor(options: AnimateOptions) {
    let textures: Texture[];

    if ("frames" in options) {
      textures = options.frames;
    }
    else {
      const { spritesheet, sortKeys } = options;

      if (sortKeys) {
        textures = Object.keys(spritesheet.textures)
          .sort()
          .map(k => spritesheet.textures[k]);
      }
      else {
        textures = Object.values(spritesheet.textures);
      }
    }

    const timePerFrame = options.timePerFrame || Action._defaultAnimateTimePerFrame;

    super(textures.length * timePerFrame);

    this.frames = textures;
    this.timePerFrame = timePerFrame;
    this.resize = options.resize ?? false;
    this.restore = options.restore ?? false;
  }

  protected onSetupTicker(target: TargetNode): any {
    if ("texture" in target) {
      return { restoreTexture: target.texture };
    }

    throw new TypeError('Target must be a Sprite.');
  }

  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): void {
    if ( !ticker.data ) return;

    if (this.restore) {
      const texture: Texture = ticker.data.restoreTexture;

      (target as Sprite).texture = texture;

      if (this.resize) {
        target.width = texture.width;
        target.height = texture.height;
      }
    }
  }

  public reversed(): Action {
    return new AnimateAction({
      frames: [ ...this.frames ].reverse(),
      timePerFrame: this.timePerFrame,
      resize: this.resize,
      restore: this.restore,
    });
  }

  protected onTick(target: TargetNode, t: number, _dt: number): void {
    const i = Math.floor(t * this.frames.length);
    const texture = this.frames[i];

    if (
      texture === undefined || (target as Sprite).texture === texture
    ) {
      // no texture change
      return;
    }

    (target as Sprite).texture = texture;

    if (this.resize) {
      target.width = texture.width;
      target.height = texture.height;
    }
  }
}
