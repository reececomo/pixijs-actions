import { Container } from "pixi.js";


export interface TextureLike {
  width: number;
  height: number;
}

export class MockTexture implements TextureLike {
  public width: number;
  public height: number;

  public constructor(options: Partial<TextureLike>) {
    this.width = options.width ?? 100;
    this.height = options.height ?? 100;
  }
}

/**
 * A mock Sprite-like container.
 */
export class MockSprite extends Container {
  public texture: MockTexture;
  public tint = 0xffffff;

  public constructor(texture?: TextureLike) {
    texture ??= new MockTexture({ width: 100, height: 100});

    super();

    this.texture = texture;
    this.width = texture.width;
    this.height = texture.height;
  }

  // ----- Methods: -----

  public override get width(): number {
    return Math.abs(this.scale.x) * this.texture.width;
  }

  public override set width(value: number) {
    this.__setWidth(value, this.texture.width);
  }

  public override get height(): number {
    return Math.abs(this.scale.y) * this.texture.height;
  }

  public override set height(value: number) {
    this.__setHeight(value, this.texture.height);
  }

  // ----- Internal methods: -----

  private __setWidth(value: number, local: number): void {
    const sign = Math.sign(this.scale.x) || 1;
    const z = local ? value / local : 1;

    this.scale.x = z * sign;
  }

  private __setHeight(value: number, local: number): void {
    const sign = Math.sign(this.scale.y) || 1;
    const z = local ? value / local : 1;

    this.scale.y = z * sign;
  }
}
