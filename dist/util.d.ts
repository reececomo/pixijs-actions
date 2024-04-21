import * as PIXI from 'pixi.js';
/** @returns Whether the target is paused, including via any ancestors. */
export declare function getIsPaused(target: PIXI.DisplayObject): boolean;
/** @returns The targets action speed, after factoring in any ancestors. */
export declare function getSpeed(target: PIXI.DisplayObject): number;
