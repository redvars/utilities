/**
 * Type definitions describing JSON-compatible values.
 *
 * @example Usage
 * ```ts
 * import type { JSONValue } from "@utility/types/json";
 *
 * const value: JSONValue = { list: [1, "two", null], flag: true };
 * ```
 *
 * @module
 */

/**
 * Type alias for JSON primitive values.
 *
 * Note: `undefined` is accepted for convenience with optional properties, but
 * it is not valid JSON; `JSON.stringify` omits such properties (and turns
 * `undefined` array items into `null`).
 */
export type JSONPrimitive = string | boolean | number | null | undefined;

/**
 * Type alias for arrays in JSON.
 * It's an array that can contain any type of {@linkcode JSONValue}.
 */
export type JSONArray = JSONValue[];

/**
 * Union type for any value that can be found in a JSON structure.
 * This includes objects, arrays, and primitives.
 */
export type JSONValue = JSONObject | JSONArray | JSONPrimitive;

/**
 * Type alias for objects in JSON.
 * It represents an object with string keys and {@linkcode JSONValue} values.
 */
export type JSONObject = {
  [key: string]: JSONValue;
};
