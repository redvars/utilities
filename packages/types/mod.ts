/**
 * Shared TypeScript type definitions: JSON value types and a UUID v4 shape.
 *
 * @example Usage
 * ```ts
 * import type { JSONObject, UUID4 } from "@utility/types";
 *
 * const config: JSONObject = { name: "app", tags: ["a", "b"], nested: { on: true } };
 * const id: UUID4 = "3b241101-e2bb-4255-8caf-4136c566a962";
 * ```
 *
 * @module
 */

export * from "./src/JSON.ts";
export * from "./src/UUID.ts";
