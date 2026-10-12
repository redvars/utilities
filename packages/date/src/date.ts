/** Minimal shape of the `Temporal` global used for validation. */
interface TemporalLike {
  Instant: {
    from(value: string): {
      toString(options: { fractionalSecondDigits: number }): string;
    };
  };
}

/** Strict `YYYY-MM-DDTHH:mm:ss.sssZ` shape produced by `Date#toISOString()`. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Checks whether the provided string is a valid ISO 8601 UTC date string in
 * the exact format produced by `Date.prototype.toISOString()`
 * (`YYYY-MM-DDTHH:mm:ss.sssZ`).
 *
 * The string must both match that shape and describe a real instant, so
 * values such as `"2022-13-45T07:40:25.551Z"` or `"2023-02-30T00:00:00.000Z"`
 * are rejected. Validation uses the `Temporal` API
 * (`Temporal.Instant.from`) when available, and falls back to `Date` on
 * runtimes without it; both give the same result. This function never
 * throws.
 *
 * @param value The value to check.
 * @returns `true` if `value` is a valid ISO date string, otherwise `false`.
 *
 * @example Usage
 * ```ts
 * import { isISODate } from "@utility/date";
 *
 * isISODate("2022-12-27T07:40:25.551Z"); // true
 * isISODate("25/12/2022"); // false
 * isISODate("2022-13-45T07:40:25.551Z"); // false (no such month/day)
 * ```
 */
export function isISODate(value: string): boolean {
  if (!value || !ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const temporal = (globalThis as { Temporal?: TemporalLike }).Temporal;

  // Temporal is missing in many Node versions and some browsers.
  if (temporal === undefined) {
    return _isISODateWithDate(value);
  }

  let instant: ReturnType<TemporalLike["Instant"]["from"]>;
  try {
    // Throws RangeError for out-of-range fields, e.g. month 13 or Feb 30.
    instant = temporal.Instant.from(value);
  } catch (error) {
    if (error instanceof RangeError) {
      return false;
    }
    throw error;
  }

  // Round-trip catches values Temporal constrains instead of rejecting,
  // e.g. the leap second "23:59:60" is parsed as "23:59:59".
  return instant.toString({ fractionalSecondDigits: 3 }) === value;
}

/** `Date`-based fallback for runtimes without `Temporal`. */
function _isISODateWithDate(value: string): boolean {
  const date = new Date(value);
  // An out-of-range date yields `Invalid Date`, whose toISOString() throws.
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  // Round-trip catches dates that overflow, e.g. "2023-02-30" -> "2023-03-02".
  return date.toISOString() === value;
}
