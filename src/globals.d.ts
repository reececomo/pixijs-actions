import { Container } from 'pixi.js';


export {};

//
// ----------------- Global Type Aliases -----------------
//

declare global {

  /** Time measured in seconds. */
  type TimeInterval = number;

  /** Targeted display node. */
  type TargetNode = Container;

  type ContainerDestroyOptions = Parameters<TargetNode["destroy"]>[0];

  /** Targeted display node with a width and height. */
  type SizedTargetNode = TargetNode & SizeLike;

  /** Any vector-like object (e.g. PIXI.Point, or any node). */
  interface VectorLike {
    x: number;
    y: number;
  }

  /** Any object with a width and height (e.g. PIXI.Sprite). */
  interface SizeLike {
    width: number;
    height: number;
  }

  /** Any object containing an array of points (e.g. PIXI.SimpleRope). */
  interface PathObjectLike {
    points: VectorLike[];
  }

}

//
// ----------------- PixiJS extension: -----------------
//

declare module 'pixi.js' {

  export interface Container {

    //
    // ----------------- Container Action Properties: -----------------
    //

    /**
     * A boolean value that determines whether actions on the node and its descendants are processed.
     */
    isPaused: boolean;

    /**
     * A speed modifier applied to all actions executed by a node and its descendants.
     */
    speed: number;

    //
    // ----------------- Container Action Methods: -----------------
    //

    /**
     * Adds an action to the list of actions executed by the node.
     *
     * The new action is processed the next time the canvas's animation loop is processed.
     *
     * After the action completes, your completion block is called, but only if the action runs to
     * completion. If the action is removed before it completes, the completion handler is never
     * called.
     *
     * @param action The action to perform.
     * @param completion (Optional) A completion block called when the action completes.
     */
    run(action: Action, completion?: () => void): void;

    /**
     * Adds an identifiable action to the list of actions executed by the node.
     *
     * The action is stored so that it can be retrieved later. If an action using the same key is
     * already running, it is removed before the new action is added.
     *
     * @param action The action to perform.
     * @param key A unique key used to identify the action.
     */
    runWithKey(key: string, action: Action): void;
    runWithKey(action: Action, key: string): void;

    /**
     * Adds an action to the list of actions executed by the node.
     *
     * The new action is processed the next time the canvas's animation loop is processed.
     *
     * Runs the action as a promise.
     *
     * @param action The action to perform.
     */
    runAsPromise(action: Action): Promise<void>;

    /**
     * Returns an action associated with a specific key.
     */
    action(forKey: string): Action | undefined;

    /**
     * Returns a boolean value that indicates whether the node is executing actions.
     */
    hasActions(): boolean;

    /**
     * Ends and removes all actions from the node.
     */
    removeAllActions(): void;

    /**
     * Removes an action associated with a specific key.
     */
    removeAction(forKey: string): void;
  }

}
