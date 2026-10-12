import { toString } from "./utils.ts";

/**
 * Converts an underscore-separated (snake_case) string to Title Case.
 *
 * Every `_` becomes a single space and the first character of every
 * resulting word is upper-cased. Leading, trailing and repeated underscores
 * are preserved as spaces. The rest of each word is left untouched.
 *
 * @param value The value to convert. `null` and `undefined` are treated as `""`.
 * @returns The title-cased string.
 *
 * @example Usage
 * ```ts
 * import { underscoreToTitleCase } from "@utility/string";
 *
 * underscoreToTitleCase("hello_world"); // "Hello World"
 * underscoreToTitleCase("_hello_world_"); // " Hello World "
 * underscoreToTitleCase(null); // ""
 * ```
 */
export function underscoreToTitleCase(
  value: string | null | undefined,
): string {
  return toString(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Converts a string to kebab-case.
 *
 * Upper-case letters start a new lower-cased segment, and spaces,
 * underscores and hyphens become a single `-`. Consecutive separators never
 * produce more than one `-` in a row. Acronyms are split per letter
 * (`"XMLHttp"` → `"x-m-l-http"`).
 *
 * @param value The value to convert. `null` and `undefined` are treated as `""`.
 * @returns The kebab-cased string.
 *
 * @example Usage
 * ```ts
 * import { toKebabCase } from "@utility/string";
 *
 * toKebabCase("HelloWorld"); // "hello-world"
 * toKebabCase("hello_world"); // "hello-world"
 * toKebabCase("Hello World"); // "hello-world"
 * ```
 */
export function toKebabCase(value: string | null | undefined): string {
  const strValue = toString(value);
  let kebabCase = '';
  for (const char of strValue) {
    if (char.toUpperCase() === char && char.toLowerCase() !== char) {
      if (kebabCase !== '' && !kebabCase.endsWith('-')) {
        kebabCase += '-';
      }
      kebabCase += char.toLowerCase();
    } else if (char === ' ' || char === '_' || char === '-') {
      if (!kebabCase.endsWith('-')) {
        kebabCase += '-';
      }
    } else {
      kebabCase += char;
    }
  }
  return kebabCase;
}

/**
 * Converts a string value to a boolean.
 *
 * Matching is case-insensitive and ignores surrounding whitespace:
 * - `"true"`, `"yes"`, `"1"` → `true`
 * - `"false"`, `"no"`, `"0"`, `""` (or whitespace only), `null`, `undefined` → `false`
 * - any other non-empty string → `true`
 *
 * @param value The input value to convert.
 * @returns The boolean representation of the input value.
 *
 * @example Usage
 * ```ts
 * import { toBoolean } from "@utility/string";
 *
 * toBoolean("true"); // true
 * toBoolean(" YES "); // true
 * toBoolean("false"); // false
 * toBoolean("   "); // false
 * toBoolean(null); // false
 * ```
 */
export function toBoolean(value: string | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  const normalized = value.toLowerCase().trim();
  switch (normalized) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
      return false;
    default:
      return normalized !== "";
  }
}
