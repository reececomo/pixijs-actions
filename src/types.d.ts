// typealiases

declare global {

  /** Time measured in seconds. */
  type TimeInterval = number;

  /** Targeted display node. */
  type TargetNode = PIXI.DisplayObject;

  /** Targeted display node that has a width/height. */
  type SizedTargetNode = TargetNode & SizeLike;

  /** A vector (e.g. PIXI.Point, or any node). */
  interface VectorLike {
    x: number;
    y: number;
  }

  /** Any object with a width and height. */
  interface SizeLike {
    width: number;
    height: number;
  }

  /** Any object containing an array of points (e.g. PIXI.SimpleRope). */
  interface PathObjectLike {
    points: VectorLike[];
  }

}

export {};
