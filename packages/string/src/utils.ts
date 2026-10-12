/**
 * Converts any value to a string. `null` and `undefined` become `""`, `-0`
 * becomes `"-0"`, and arrays are converted element-wise and joined with `,`.
 *
 * @internal
 * @param value The value to convert.
 * @returns The string representation of `value`.
 */
export function toString(value: unknown): string {
  if (value == null) {
    return "";
  }
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return value.map((item) => toString(item)).join(",");
  }
  if (Object.is(value, -0)) {
    return "-0";
  }
  // String() (unlike a template literal) does not throw for symbols.
  return String(value);
}
