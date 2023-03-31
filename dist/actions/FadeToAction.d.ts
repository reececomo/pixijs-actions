import * as PIXI from 'pixi.js';
import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';
export declare class FadeToAction extends Action {
    protected startAlpha: number;
    protected alpha: number;
    constructor(target: PIXI.DisplayObject, alpha: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
