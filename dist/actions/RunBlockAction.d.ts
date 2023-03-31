import { Action } from '../Action';
export declare class RunBlockAction extends Action {
    protected block: () => any;
    constructor(block: () => void);
    tick(delta: number): boolean;
}
