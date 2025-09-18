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
  let remainingMs = seconds * 1_000;
  const tickMs = 1_000 / fps;

  while (remainingMs > 0) {
    const ms = Math.min(tickMs, remainingMs);
    remainingMs -= ms;

    Action.tick(ms, errorHandler);
  }

  return errors;
}
