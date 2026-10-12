/**
 * Template-literal type describing the shape of a version 4 UUID
 * (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`): five hyphen-separated groups
 * with the third group starting with `4`.
 *
 * This is a compile-time hint only. TypeScript cannot express regex-based
 * types, so group lengths and hex characters are **not** checked, and no
 * runtime validation happens. See
 * https://github.com/microsoft/TypeScript/issues/6579
 *
 * @example Usage
 * ```ts
 * import type { UUID4 } from "@utility/types";
 *
 * const id: UUID4 = "3b241101-e2bb-4255-8caf-4136c566a962";
 * ```
 */
export type UUID4 = `${string}-${string}-4${string}-${string}-${string}`;
