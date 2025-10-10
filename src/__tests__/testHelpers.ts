import { Action } from "../index";

/**
 * Increments simulation time forward.
 *
 * @param seconds Amount of time to simulate forward.
 * @param fps (default: 60) Steps per second.
 */
export function simulateTime(seconds: number, fps: number = 60): Error[] {
  const errors: Error[] = [];
  const errorHandler = (error: Error): any => errors.push(error);

  // simulate time forward in multiple discrete steps
  // to approximate real world conditions
  let remainingMS = seconds * 1_000;
  const tickMS = 1_000 / fps;

  while (remainingMS > 0) {
    const ms = Math.min(tickMS, remainingMS);
    remainingMS -= ms;

    Action.tick({ deltaMS: ms }, errorHandler);
  }

  return errors;
}
