import * as PIXI from 'pixi.js';
import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';
export declare class RotateByAction extends Action {
    protected startRotation: number;
    protected rotation: number;
    constructor(target: PIXI.DisplayObject, rotation: number, duration: number, timingMode?: TimingModeFn);
    tick(delta: number): boolean;
}
