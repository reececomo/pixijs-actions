/* eslint-disable @typescript-eslint/no-namespace */

import { Action } from './ActionClass';
import { Defaults } from './Defaults';


declare module './ActionClass' {

  export namespace Action {

    /**
     * PixiJS Actions global default settings.
     */
    const defaults: typeof Defaults;

  }

}

//
// ----------------- Implementation: -----------------
//

(Action as any).defaults = Defaults;
