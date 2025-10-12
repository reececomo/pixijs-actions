import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';
import { Defaults } from '../../Defaults';

export interface AnimateSpritesheetOptions extends AnimateOptions {
  /**
   * Whether the textures should be sorted by their spritesheet key.
   *
   * @default true
   */
  sortKeys?: boolean;
}

export interface AnimateOptions {
  /**
   * Time to display each texture (in seconds).
   *
   * @default Action.defaults.animateTimePerFrame // default: 1/24
   */
  timePerFrame?: number;

  /**
   * Whether to resize the sprite to match each texture frame.
   *
   * @default false
   */
  resize?: boolean;

  /**
   * Whether to restore the sprite's texture to its original texture
   * when this action is completed or removed.
   *
   * @default false
   */
  restore?: boolean;
}

interface AnimateTickerData {
  previousTexture: PixiTexture;
}

export class AnimateAction extends Action {
  protected readonly textures: PixiTexture[];
  protected readonly count: number;
  protected readonly timePerFrame: number;
  protected readonly resize: boolean;
  protected readonly restore: boolean;

  /**
   * @internal
   */
  public static fromSpritesheet(
    spritesheet: PixiSpritesheet,
    options?: AnimateSpritesheetOptions,
  ): Action {
    const textures = options?.sortKeys === false
      ? Object.values(spritesheet.textures)
      : Object.keys(spritesheet.textures).sort().map((key) => spritesheet.textures[key]);

    return new AnimateAction(textures, options);
  }

  public constructor(textures: PixiTexture[], options?: AnimateOptions) {
    const timePerFrame = options?.timePerFrame || Defaults.animateTimePerFrame;

    super(textures.length * timePerFrame);

    this.textures = textures;
    this.count = textures.length;
    this.timePerFrame = timePerFrame;
    this.resize = options?.resize ?? false;
    this.restore = options?.restore ?? false;
  }

  public reversed(): Action {
    const reversedTextures = [ ...this.textures ].reverse();

    return new AnimateAction(reversedTextures, {
      timePerFrame: this.timePerFrame,
      resize: this.resize,
      restore: this.restore,
    })._apply(this);
  }

  public _onTickerAdded(target: SpriteTarget): AnimateTickerData {
    if (typeof target.texture === "undefined") {
      throw new TypeError('Action target must be a Sprite.');
    }

    return {
      previousTexture: target.texture,
    };
  }

  public _onTickerRemoved(
    target: SpriteTarget,
    ticker: IActionTicker<AnimateTickerData>
  ): void {
    if ( !ticker.data ) return;

    if (this.restore) {
      const texture = ticker.data.previousTexture;

      target.texture = texture;

      if (this.resize) {
        target.width = texture.width;
        target.height = texture.height;
      }
    }
  }

  public _onTickerUpdate(target: SpriteTarget, t: number): void {
    const i = Math.floor(t * this.count);
    const texture = this.textures[i];

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
