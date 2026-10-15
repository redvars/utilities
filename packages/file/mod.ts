/**
 * Promise-based file system helpers for Node.js, Deno and Bun: existence
 * checks, directory creation/removal, text/JSON read & write, glob-based JSON
 * loading, copying, and zip extraction.
 *
 * @example Usage
 * ```ts ignore
 * import { exists, readJsonFile, writeJsonFile } from "@utility/file";
 *
 * if (await exists("./config.json")) {
 *   const config = await readJsonFile("./config.json");
 *   await writeJsonFile("./config.backup.json", config);
 * }
 * ```
 *
 * @module
 */

export * from "./src/file.ts";
