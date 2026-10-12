/**
 * String utility functions: case conversion and boolean parsing.
 *
 * @example Usage
 * ```ts
 * import { toBoolean, toKebabCase, underscoreToTitleCase } from "@utility/string";
 *
 * underscoreToTitleCase("hello_world"); // "Hello World"
 * toKebabCase("HelloWorld"); // "hello-world"
 * toBoolean("yes"); // true
 * ```
 *
 * @module
 */

export * from "./src/string.ts";
