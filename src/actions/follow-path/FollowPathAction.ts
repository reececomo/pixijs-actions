import { IActionTicker } from 'src/lib/IActionTicker';
import { Action } from '../../lib/Action';

const HALF_PI = Math.PI / 2;

export class FollowPathAction extends Action {
  protected readonly path: VectorLike[];
  protected readonly lastIndex: number;
  protected readonly segmentLengths!: number[];
  protected readonly segmentWeights!: number[];

  public constructor(
    path: VectorLike[],
    duration: number,
    protected readonly asOffset: boolean,
    protected readonly orientToPath: boolean,
    protected readonly fixedSpeed: boolean,
  ) {
    super(duration);
    this.path = path;
    this.lastIndex = path.length - 1;

    // Precalculate segment lengths, if needed.
    if (orientToPath || fixedSpeed) {
      const [totalDist, segmentLengths] = FollowPathAction.getLength(path);
      this.segmentLengths = segmentLengths;

      if (fixedSpeed) {
        this.segmentWeights = segmentLengths.map(v => v / (totalDist || 1));
      }
    }
  }

  // ----- Static Helpers: -----

  public static getPath(path: VectorLike[] | { points: VectorLike[] }): VectorLike[] {
    return Array.isArray(path) ? [...path] : [...path.points];
  }

  public static getLength(path: VectorLike[]): [length: number, segmentLengths: number[]] {
    let totalLength = 0;
    const segmentLengths: number[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const directionX = path[i + 1]!.x - path[i]!.x;
      const directionY = path[i + 1]!.y - path[i]!.y;
      const length = Math.sqrt(directionX * directionX + directionY * directionY);

      segmentLengths.push(length);
      totalLength += length;
    }

    return [totalLength, segmentLengths];
  }

  // ----- Methods: -----

  public reversed(): Action {
    return new FollowPathAction(
      this._getReversedPath(),
      this.duration,
      this.asOffset,
      this.orientToPath,
      this.fixedSpeed,
    )
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onSetupTicker(target: any): any {
    return {
      x: this.asOffset ? target.x : 0,
      y: this.asOffset ? target.y : 0,
    };
  }

  protected onTick(target: any, t: number, dt: number, ticker: IActionTicker): void {
    if (this.lastIndex < 0) {
      return; // Empty path.
    }

    const [index, st] = this.fixedSpeed
      ? this._getFixedSpeedProgress(t)
      : this._getDynamicSpeedProgress(t);

    const startPoint = this.path[index]!;
    const endPoint = this.path[index + 1] ?? startPoint;

    target.position.set(
      ticker.data.x + startPoint.x + (endPoint.x - startPoint.x) * st,
      ticker.data.y + startPoint.y + (endPoint.y - startPoint.y) * st
    );

    if (this.orientToPath) {
      const length = this.segmentLengths[index]! || 1;
      const ndx = (endPoint.x - startPoint.x) / length;
      const ndy = (endPoint.y - startPoint.y) / length;
      const rotation = HALF_PI + Math.atan2(ndy, ndx);

      target.rotation = rotation;
    }
  }

  // ----- Internal: -----

  protected _getReversedPath(): VectorLike[] {
    if (this.asOffset && this.path.length > 0) {
      // Calculate the relative delta offset when first and last are flipped.
      const first = this.path[0]!, last = this.path[this.path.length - 1]!;
      const dx = last.x + first.x, dy = last.y + first.y;

      return this.path.map(({x, y}) => ({ x: x - dx, y: y - dy })).reverse();
    }

    // Absolute path is the path backwards.
    return [...this.path].reverse();
  }

  protected _getDynamicSpeedProgress(t: number): [index: number, segmentT: number] {
    const index = Math.max(Math.min(Math.floor(t * this.lastIndex), this.lastIndex - 1), 0);
    const lastIndexNonZero = this.lastIndex || 1;
    const st = (t - index / lastIndexNonZero) * lastIndexNonZero;

    return [index, st];
  }

  protected _getFixedSpeedProgress(t: number): [index: number, segmentT: number] {
    let remainingProgress = t;
    let index = 0;
    let st = 0;

    for (let i = 0; i < this.lastIndex; i++) {
      const segmentWeight = this.segmentWeights[i]!;

      if (segmentWeight! > remainingProgress || i === this.lastIndex - 1) {
        st = remainingProgress / segmentWeight || 1;
        break;
      }

      remainingProgress -= segmentWeight;
      index++;
    }

    return [index, st];
  }
}
