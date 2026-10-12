/**
 * Generates a random number between `min` and `max`.
 *
 * - Integer mode (default): returns an integer in the inclusive range
 *   `[ceil(min), floor(max)]`, so fractional bounds never produce a value
 *   outside the requested range.
 * - Floating mode: returns a float in the half-open range `[min, max)`
 *   (`max` itself is never returned, as with `Math.random()`).
 *
 * Uses `Math.random()`, so the result is **not** cryptographically secure.
 *
 * @param min The lower bound (inclusive).
 * @param max The upper bound (inclusive for integers, exclusive for floats).
 * @param floating If `true`, generates a floating-point number. Defaults to `false`.
 * @returns The random number.
 * @throws {RangeError} If `min` or `max` is not finite, if `min > max`, or if
 *   integer mode is requested and no integer lies within `[min, max]`.
 *
 * @example Random integer
 * ```ts
 * import { random } from "@utility/number";
 *
 * const n = random(10, 20); // e.g. 14 (10 <= n <= 20)
 * ```
 *
 * @example Random float
 * ```ts
 * import { random } from "@utility/number";
 *
 * const f = random(0, 1, true); // e.g. 0.374... (0 <= f < 1)
 * ```
 */
export function random(min: number, max: number, floating = false): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError(
      `Expected finite bounds, received min=${min}, max=${max}`,
    );
  }
  if (min > max) {
    throw new RangeError(`min (${min}) must not be greater than max (${max})`);
  }

  if (floating) {
    return Math.random() * (max - min) + min;
  }

  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  if (lower > upper) {
    throw new RangeError(`No integer exists between ${min} and ${max}`);
  }
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}
