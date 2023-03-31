import * as PIXI from 'pixi.js';
import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';
export declare class ScaleToAction extends Action {
    protected startX: number;
    protected startY: number;
    protected x: number;
    protected y: number;
    constructor(target: PIXI.DisplayObject, x: number, y: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
