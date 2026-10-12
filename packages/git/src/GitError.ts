/**
 * Error thrown by {@linkcode GITUtility} when a Git command cannot be run or
 * exits with a non-zero code.
 *
 * @example Usage
 * ```ts ignore
 * import { GitError, GITUtility } from "@utility/git";
 *
 * try {
 *   await new GITUtility().runCommand("checkout", "missing-branch");
 * } catch (error) {
 *   if (error instanceof GitError) console.error(error.message);
 * }
 * ```
 */
export class GitError extends Error {
  /**
   * Create a GitError.
   *
   * @param message The error message describing the Git issue.
   * @param options Standard error options, e.g. `{ cause }`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options); // Call the parent Error class constructor with the message.
    this.name = "GitError"; // Set the error name to 'GitError' to distinguish it from other errors.
  }
}
