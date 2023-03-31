import { Action } from '../Action';
export declare class RepeatAction extends Action {
    protected action: Action;
    protected maxRepeats: number;
    protected n: number;
    /**
     * @param action Targeted action.
     * @param repeats A negative value indicates looping forever.
     */
    constructor(action: Action, repeats: number);
    tick(delta: number): boolean;
    reset(): this;
}
