import { execFile } from "node:child_process";
import process from "node:process";
import { GitError } from "./GitError.ts";

/**
 * Utility class for executing Git commands in Node.js, Deno and Bun.
 *
 * Requires a `git` executable on the `PATH`. Commands run in the directory
 * given to the constructor (or `process.cwd()`), with no shell involved.
 *
 * @example Usage
 * ```ts ignore
 * import { GITUtility } from "@utility/git";
 *
 * const git = new GITUtility("./my-repo");
 * if (await git.hasUncommittedChanges()) {
 *   console.log(await git.runCommand("status", "--short"));
 * }
 * ```
 */
export class GITUtility {
  // Private field to store the current working directory
  readonly #cwd: string;

  /**
   * Constructs a GITUtility instance, optionally setting the current working
   * directory.
   *
   * @param cwd The working directory for Git operations. Defaults to
   *   `process.cwd()`.
   */
  constructor(cwd?: string) {
    this.#cwd = cwd ? cwd : process.cwd();
  }

  /**
   * Executes a Git command and returns its standard output.
   *
   * Arguments are passed directly to the `git` executable (no shell), so they
   * do not need quoting.
   *
   * @param args The arguments for the Git command.
   * @returns The decoded standard output of the command.
   * @throws {GitError} If `git` cannot be started or exits with a non-zero
   *   code. The message includes the command's standard error.
   *
   * @example Usage
   * ```ts ignore
   * import { GITUtility } from "@utility/git";
   *
   * const status = await new GITUtility().runCommand("status", "--short");
   * ```
   */
  runCommand(...args: string[]): Promise<string> {
    const description = `git ${args.join(" ")}`;

    return new Promise((resolve, reject) => {
      const child = execFile(
        "git",
        args,
        {
          cwd: this.#cwd,
          encoding: "utf8",
          maxBuffer: 64 * 1024 * 1024,
          windowsHide: true,
        },
        (error, stdout, stderr) => {
          if (error === null) {
            resolve(stdout);
            return;
          }
          if ((error as { code?: unknown }).code === "ENOENT") {
            reject(
              new GitError(
                `Failed to run \`${description}\`: git executable or working directory "${this.#cwd}" not found`,
                { cause: error },
              ),
            );
            return;
          }
          reject(
            new GitError(`Failed to run \`${description}\`: ${stderr}`, {
              cause: error,
            }),
          );
        },
      );
      child.stdin?.end();
    });
  }

  /**
   * Checks if there are uncommitted changes (staged, unstaged or untracked
   * files) in the working directory.
   *
   * @returns `true` if there are uncommitted changes, `false` otherwise.
   * @throws {GitError} If the directory is not a Git repository.
   *
   * @example Usage
   * ```ts ignore
   * import { GITUtility } from "@utility/git";
   *
   * const dirty = await new GITUtility().hasUncommittedChanges();
   * ```
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.runCommand("status", "--porcelain");
    return status.trim() !== "";
  }

  /**
   * Clones a Git repository into a new sub-directory of the working
   * directory (named after the repository, as `git clone` does).
   *
   * @param repositoryUrl The URL of the repository to clone.
   * @returns A promise that resolves once the clone has finished.
   * @throws {GitError} If the clone fails (e.g. unreachable URL or the
   *   target directory already exists).
   *
   * @example Usage
   * ```ts ignore
   * import { GITUtility } from "@utility/git";
   *
   * await new GITUtility("./checkouts").clone("https://github.com/utilityjs/git-test.git");
   * ```
   */
  async clone(repositoryUrl: string): Promise<void> {
    // "--" stops option parsing so a URL like "--upload-pack=..." cannot be
    // interpreted as a git option (argument injection).
    await this.runCommand("clone", "--", repositoryUrl);
  }
}
