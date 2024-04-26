import * as PIXI from 'pixi.js';

/** @returns Whether the target is paused, including via any ancestors. */
export function getIsPaused(target: PIXI.DisplayObject): boolean {
  let leaf = target;
  do {
    if (leaf.isPaused) {
      return true;
    }
    leaf = leaf.parent;
  }
  while (leaf != null);

  return false;
}

/** @returns The target's action speed, after factoring in any ancestors. */
export function getSpeed(target: PIXI.DisplayObject): number {
  let leaf = target;
  let speed = leaf.speed;

  while (leaf.parent != null) {
    speed *= leaf.parent.speed;
    leaf = leaf.parent;
  }

  return speed;
}
