import { Action } from '../Action';
export declare class SequenceAction extends Action {
    index: number;
    actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
}
