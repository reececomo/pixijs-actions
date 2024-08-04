import * as PIXI from 'pixi.js';

/*
 * PixiJS Mixin declaration
 */

declare global {

  /** Time measured in seconds. */
  type TimeInterval = number;

  /** Targeted display node. */
  type TargetNode = PIXI.Container;

  /** Targeted display node with a width and height. */
  type SizedTargetNode = TargetNode & SizeLike;

  /** Any vector-like object (e.g. PIXI.Point, or any node). */
  interface VectorLike {
    x: number;
    y: number;
  }

  /** Any object with a width and height (e.g. PIXI.Sprite). */
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
