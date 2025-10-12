import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';
import { Defaults } from '../../Defaults';

export type AnimateOptions = AnimateTextureOptions | AnimateSpritesheetOptions;

export interface AnimateTextureOptions extends BaseAnimateOptions {
  /**
   * Array of textures to animate.
   */
  frames: PixiTexture[];
}

export interface AnimateSpritesheetOptions extends BaseAnimateOptions {
  /**
   * A spritesheet containing textures to animate.
   */
  spritesheet: {
    textures: Record<string, PixiTexture>;
  };

  /**
   * Whether spritesheet frames are sorted on key.
   *
   * @default true
   */
  sortKeys?: boolean;
}

interface BaseAnimateOptions {
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
}

interface AnimateTickerData {
  restoreTexture: PixiTexture;
}

export class AnimateAction extends Action {
  protected readonly frames: PixiTexture[];
  protected readonly timePerFrame: number;
  protected readonly resize: boolean;
  protected readonly restore: boolean;

  public constructor(options: AnimateOptions) {
    let textures: PixiTexture[];

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

    const timePerFrame = options.timePerFrame || Defaults.animateTimePerFrame;

    super(textures.length * timePerFrame);

    this.frames = textures;
    this.timePerFrame = timePerFrame;
    this.resize = options.resize ?? false;
    this.restore = options.restore ?? false;
  }

  public reversed(): Action {
    return new AnimateAction({
      frames: [ ...this.frames ].reverse(),
      timePerFrame: this.timePerFrame,
      resize: this.resize,
      restore: this.restore,
    });
  }

  public _onTickerAdded(target: SpriteTarget): AnimateTickerData {
    if (typeof target.texture === "undefined") {
      throw new TypeError('Action target must be a Sprite.');
    }

    return {
      restoreTexture: target.texture,
    };
  }

  public _onTickerRemoved(
    target: SpriteTarget,
    ticker: IActionTicker<AnimateTickerData>
  ): void {
    if ( !ticker.data ) return;

    if (this.restore) {
      const texture = ticker.data.restoreTexture;

      target.texture = texture;

      if (this.resize) {
        target.width = texture.width;
        target.height = texture.height;
      }
    }
  }

  public _onTickerUpdate(target: SpriteTarget, t: number): void {
    const i = Math.floor(t * this.frames.length);
    const texture = this.frames[i];

    if (texture == null) return;

    if (target.texture === texture) {
      // no texture change
      return;
    }

    target.texture = texture;

    if (this.resize) {
      target.width = texture.width;
      target.height = texture.height;
    }
  }
}
