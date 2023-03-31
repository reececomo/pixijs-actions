import { Action } from '../Action';
export declare class GroupAction extends Action {
    protected index: number;
    protected actions: Action[];
    constructor(actions: Action[]);
    tick(delta: number): boolean;
    reset(): this;
}
