import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import process from "node:process";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import { fileURLToPath, URL } from "node:url";
import type { JSONObject } from "@utility/types";

/** Returns the `code` property of a system error, if any. */
function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

/** Converts a path or `file:` URL to a path string. */
function toPath(value: string | URL): string {
  return value instanceof URL ? fileURLToPath(value) : value;
}

/**
 * Checks if a file or directory exists at the given path.
 *
 * This is a small wrapper around `fs.stat` that returns `true` when the
 * path exists and `false` when the path does not exist. Other errors (for
 * example permission errors) are re-thrown so callers can decide how to
 * handle them.
 *
 * @param path The path or `file:` URL to test for existence.
 * @returns `true` if the path exists, `false` if it does not.
 * @throws {Error} Any other non-`ENOENT` error raised by `fs.stat`, for
 *   example `EACCES`.
 *
 * @example Usage
 * ```ts ignore
 * import { exists } from "@utility/file";
 *
 * const found = await exists("./some/file.txt");
 * ```
 */
export async function exists(path: string | URL): Promise<boolean> {
  try {
    await fs.stat(toPath(path));
    // successful, file or directory must exist
    return true;
  } catch (error) {
    const code = errorCode(error);
    if (code === "ENOENT" || code === "ENOTDIR") {
      // file or directory does not exist
      return false;
    }
    // unexpected error, maybe permissions, pass it along
    throw error;
  }
}

/**
 * Creates a single directory (non-recursive).
 *
 * A simple wrapper for `fs.mkdir(path)`. Use {@linkcode mkdirRecursive}
 * when parent directories may not exist.
 *
 * @param path Directory path to create.
 * @returns A promise that resolves when the directory has been created.
 * @throws {Error} With code `EEXIST` if `path` already exists, or `ENOENT`
 *   if the parent directory does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { mkdir } from "@utility/file";
 *
 * await mkdir("./out");
 * ```
 */
export async function mkdir(path: string): Promise<void> {
  await fs.mkdir(path);
}

/**
 * Creates a directory and any missing parents.
 *
 * Equivalent to `mkdir -p` on UNIX. Does not fail if the directory already
 * exists.
 *
 * @param path Directory path to create (parents will be created as needed).
 * @returns A promise that resolves when the directory (and parents) exist.
 *
 * @example Usage
 * ```ts ignore
 * import { mkdirRecursive } from "@utility/file";
 *
 * await mkdirRecursive("./out/a/b/c");
 * ```
 */
export async function mkdirRecursive(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

/**
 * Removes a file or an empty directory.
 *
 * If the path points to a non-empty directory use
 * {@linkcode removeRecursive}.
 *
 * @param path Path to the file or (empty) directory to remove.
 * @returns A promise that resolves when the target has been removed.
 * @throws {Error} With code `ENOENT` if `path` does not exist, or
 *   `ENOTEMPTY` if it is a non-empty directory.
 *
 * @example Usage
 * ```ts ignore
 * import { remove } from "@utility/file";
 *
 * await remove("./out/old.txt");
 * ```
 */
export async function remove(path: string): Promise<void> {
  const stats = await fs.lstat(path);
  if (stats.isDirectory()) {
    await fs.rmdir(path);
  } else {
    await fs.unlink(path);
  }
}

/**
 * Removes a file or directory and all of its contents recursively.
 *
 * This will recursively delete files and sub-directories under the given
 * path. Use with caution.
 *
 * @param path Path to the file or directory to recursively remove.
 * @returns A promise that resolves when the tree has been removed.
 * @throws {Error} With code `ENOENT` if `path` does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { removeRecursive } from "@utility/file";
 *
 * await removeRecursive("./out");
 * ```
 */
export async function removeRecursive(path: string): Promise<void> {
  await fs.rm(path, { recursive: true });
}

/**
 * Reads a file as raw bytes.
 *
 * @param filePath Path to the file to read.
 * @returns The file contents.
 * @throws {Error} With code `ENOENT` if the file does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { readFile } from "@utility/file";
 *
 * const bytes = await readFile("./image.png");
 * ```
 */
export async function readFile(filePath: string): Promise<Uint8Array> {
  return new Uint8Array(await fs.readFile(filePath));
}

/**
 * Reads a file as UTF-8 text.
 *
 * @param filePath Path to the file to read.
 * @returns The file contents as a string.
 * @throws {Error} With code `ENOENT` if the file does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { readTextFile } from "@utility/file";
 *
 * const text = await readTextFile("./notes.txt");
 * ```
 */
export async function readTextFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, "utf8");
}

/**
 * Reads a JSON file and parses it.
 *
 * The parsed value is **not** validated: if the file's top-level value is an
 * array or a primitive it is returned as-is despite the `JSONObject` return
 * type.
 *
 * @param filePath Path to the JSON file to read and parse.
 * @returns The parsed object.
 * @throws {SyntaxError} If the file is not valid JSON.
 * @throws {Error} With code `ENOENT` if the file does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { readJsonFile } from "@utility/file";
 *
 * const config = await readJsonFile("./config.json");
 * ```
 */
export async function readJsonFile(filePath: string): Promise<JSONObject> {
  return JSON.parse(await readTextFile(filePath));
}

/**
 * Reads and parses every JSON file matched by a glob pattern.
 *
 * Only files are matched (directories are skipped). Results are returned
 * sorted by file path so the order is deterministic across platforms.
 * Backslashes in `filePath` are treated as path separators on Windows.
 *
 * @param filePath Glob pattern matching one or more JSON files.
 * @returns The parsed objects, ordered by file path. Empty if nothing matched.
 * @throws {SyntaxError} If any matched file is not valid JSON.
 *
 * @example Usage
 * ```ts ignore
 * import { readJsonFilesFromPath } from "@utility/file";
 *
 * const locales = await readJsonFilesFromPath("./locales/*.json");
 * ```
 */
export async function readJsonFilesFromPath(
  filePath: string,
): Promise<JSONObject[]> {
  const pattern = path.sep === "\\" ? filePath.replaceAll("\\", "/") : filePath;

  const filePaths: string[] = [];
  for await (const entry of fs.glob(pattern, { withFileTypes: true })) {
    if (entry.isFile()) {
      filePaths.push(path.join(entry.parentPath, entry.name));
    }
  }
  filePaths.sort();

  const result: JSONObject[] = [];
  for (const file of filePaths) {
    result.push(await readJsonFile(file));
  }
  return result;
}

/**
 * Writes text to a file, creating it if needed and replacing existing
 * contents.
 *
 * Does not create parent directories; see {@linkcode writeTextFileRecursive}.
 *
 * @param filePath Destination file path.
 * @param content Text content to write.
 * @returns A promise that resolves when the file has been written.
 * @throws {Error} With code `ENOENT` if the parent directory does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { writeTextFile } from "@utility/file";
 *
 * await writeTextFile("./out.txt", "Hello");
 * ```
 */
export async function writeTextFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.writeFile(filePath, content, "utf8");
}

/**
 * Writes text to a file, first creating any missing parent directories.
 *
 * @param filePath Destination file path.
 * @param content Text content to write.
 * @returns A promise that resolves when the file has been written.
 *
 * @example Usage
 * ```ts ignore
 * import { writeTextFileRecursive } from "@utility/file";
 *
 * await writeTextFileRecursive("./out/nested/dir/file.txt", "Hello");
 * ```
 */
export async function writeTextFileRecursive(
  filePath: string,
  content: string,
): Promise<void> {
  await mkdirRecursive(path.dirname(filePath));
  await writeTextFile(filePath, content);
}

/**
 * Writes an object as JSON to a file.
 *
 * Serializes `object` with `JSON.stringify` (no indentation) and writes it
 * using {@linkcode writeTextFile}.
 *
 * @param filePath Destination file path.
 * @param object The object to serialize and write.
 * @returns A promise that resolves when the file has been written.
 * @throws {TypeError} If `object` contains a circular reference or a `bigint`.
 * @throws {Error} With code `ENOENT` if the parent directory does not exist.
 *
 * @example Usage
 * ```ts ignore
 * import { writeJsonFile } from "@utility/file";
 *
 * await writeJsonFile("./config.json", { name: "app" });
 * ```
 */
export async function writeJsonFile(
  filePath: string,
  object: JSONObject,
): Promise<void> {
  await writeTextFile(filePath, JSON.stringify(object));
}

/**
 * Copies a file or directory from source to destination.
 *
 * Directories are copied recursively. Fails if the destination already
 * exists.
 *
 * @param sourcePath Path to the source file or directory.
 * @param destinationPath Path to the destination file or directory.
 * @returns A promise that resolves when the copy has completed.
 * @throws {Error} With code `EEXIST` if `destinationPath` already exists.
 *
 * @example Usage
 * ```ts ignore
 * import { copy } from "@utility/file";
 *
 * await copy("./assets", "./dist/assets");
 * ```
 */
export async function copy(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  if (await exists(destinationPath)) {
    throw Object.assign(
      new Error(`EEXIST: destination already exists, copy '${destinationPath}'`),
      { code: "EEXIST" },
    );
  }
  await fs.cp(sourcePath, destinationPath, { recursive: true });
}

/**
 * Extracts a zip archive into a destination directory.
 *
 * Runs the platform unzip tool: PowerShell's `Expand-Archive` on Windows and
 * `unzip` elsewhere (which must be installed). Existing files in
 * `destinationPath` are overwritten.
 *
 * @param zipSourcePath Path to the .zip archive to extract.
 * @param destinationPath Destination directory where contents will be
 *   extracted.
 * @returns `true` if the extraction command exited successfully, otherwise
 *   `false`.
 * @throws {Error} With code `ENOENT` if the unzip tool itself cannot be found.
 *
 * @example Usage
 * ```ts ignore
 * import { unZip } from "@utility/file";
 *
 * const ok = await unZip("./archive.zip", "./out");
 * ```
 */
export async function unZip(
  zipSourcePath: string,
  destinationPath: string,
): Promise<boolean> {
  const output = await __runUnzip(zipSourcePath, destinationPath);
  return output.success;
}

/**
 * Downloads a zip file from a URL and extracts it into `destinationPath`.
 *
 * Creates `destinationPath` if it does not already exist, downloads the
 * archive to a uniquely named temporary file inside it, extracts it with
 * the platform unzip tool, then removes the temporary file (also on
 * failure). `file:` URLs are read from disk instead of fetched.
 *
 * @param downloadUrl URL pointing to the zip archive to download.
 * @param destinationPath Path where the archive contents should be
 *   extracted.
 * @returns A promise that resolves when extraction is complete.
 * @throws {Error} If the HTTP response is not successful or has no body, or
 *   if extraction fails.
 * @throws {TypeError} On network failure.
 *
 * @example Usage
 * ```ts ignore
 * import { unZipFromURL } from "@utility/file";
 *
 * await unZipFromURL(new URL("https://example.com/archive.zip"), "./out");
 * ```
 */
export async function unZipFromURL(
  downloadUrl: string | URL,
  destinationPath: string,
): Promise<void> {
  await mkdirRecursive(destinationPath);

  const tempFilePath = await __downloadFileToTemp(
    downloadUrl,
    destinationPath,
  );

  try {
    const output = await __runUnzip(tempFilePath, destinationPath);
    if (!output.success) {
      throw new Error(
        `Failed to extract ${downloadUrl} (exit code ${output.code}): ${output.stderr.trim()}`,
      );
    }
  } finally {
    // remove the temp file
    await fs.rm(tempFilePath, { force: true });
  }
}

interface UnzipOutput {
  success: boolean;
  code: number | string | null;
  stderr: string;
}

/**
 * Runs the platform unzip command and returns its result.
 *
 * Paths are passed via environment variables on Windows so PowerShell never
 * parses them as script text (which would break on spaces and allow command
 * injection through crafted file names).
 *
 * @internal
 */
function __runUnzip(
  zipSourcePath: string,
  destinationPath: string,
): Promise<UnzipOutput> {
  let file: string;
  let args: string[];
  let env = process.env;

  if (process.platform === "win32") {
    file = "PowerShell";
    args = [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      // "Stop" turns Expand-Archive's non-terminating errors into a
      // non-zero exit code; otherwise a corrupt archive exits with 0.
      "$ErrorActionPreference = 'Stop'; Expand-Archive -LiteralPath $env:UTILITY_UNZIP_SRC -DestinationPath $env:UTILITY_UNZIP_DEST -Force",
    ];
    env = {
      ...process.env,
      UTILITY_UNZIP_SRC: zipSourcePath,
      UTILITY_UNZIP_DEST: destinationPath,
    };
  } else {
    file = "unzip";
    // -o: overwrite without prompting (a prompt would otherwise hang).
    args = ["-o", zipSourcePath, "-d", destinationPath];
  }

  return new Promise((resolve, reject) => {
    const child = execFile(
      file,
      args,
      { env, windowsHide: true },
      (error, _stdout, stderr) => {
        if (error === null) {
          resolve({ success: true, code: 0, stderr });
        } else if (errorCode(error) === "ENOENT") {
          // The unzip tool itself could not be started.
          reject(error);
        } else {
          resolve({
            success: false,
            code: (error as { code?: number | string }).code ?? null,
            stderr: stderr || error.message,
          });
        }
      },
    );
    child.stdin?.end();
  });
}

/**
 * Downloads a URL to a uniquely named temporary .zip file inside
 * `destinationPath` and returns the temp file path.
 *
 * @internal
 */
async function __downloadFileToTemp(
  downloadUrl: string | URL,
  destinationPath: string,
): Promise<string> {
  const tempFilePath = path.join(
    destinationPath,
    `_temp_${randomUUID()}.zip`,
  );

  const url = new URL(downloadUrl);
  try {
    if (url.protocol === "file:") {
      await fs.copyFile(fileURLToPath(url), tempFilePath);
      return tempFilePath;
    }

    const response = await fetch(url);

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `Failed to download ${downloadUrl}: ${response.status} ${response.statusText}`,
      );
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }

    await pipeline(
      Readable.fromWeb(response.body as WebReadableStream<Uint8Array>),
      createWriteStream(tempFilePath),
    );
  } catch (error) {
    await fs.rm(tempFilePath, { force: true });
    throw error;
  }

  return tempFilePath;
}
