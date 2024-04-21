import * as PIXI from 'pixi.js';
import { registerGlobalMixin } from "./Action";
//
// ----- Library exports -----
//
export * from "./Action";
export * from "./TimingMode";
//
// ----- [Side-effect] Load global mixin: -----
//
registerGlobalMixin(PIXI.DisplayObject);
//# sourceMappingURL=index.js.map