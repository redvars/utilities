/**
 * Git utility functions: run Git commands, check for uncommitted changes and
 * clone repositories.
 *
 * @example Usage
 * ```ts ignore
 * import { GITUtility } from "@utility/git";
 *
 * await new GITUtility("./git-repo-folder/").hasUncommittedChanges();
 * // => true
 * ```
 *
 * @module
 */

export * from "./src/git.ts";
export { GitError } from "./src/GitError.ts";
