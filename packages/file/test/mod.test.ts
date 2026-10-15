import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  copy,
  exists,
  mkdirRecursive,
  readJsonFile,
  readJsonFilesFromPath,
  readTextFile,
  removeRecursive,
  unZipFromURL,
  writeJsonFile,
  writeTextFile,
  writeTextFileRecursive,
} from "../mod.ts";

const TEST_RESOURCES_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "resources",
);
const TEMP = path.join(TEST_RESOURCES_PATH, ".temp");

describe("file", () => {
  before(async () => {
    await removeRecursive(TEMP).catch(() => {});
    await mkdirRecursive(TEMP);
  });

  after(async () => {
    await removeRecursive(path.join(TEST_RESOURCES_PATH, "copy")).catch(
      () => {},
    );
    await removeRecursive(TEMP).catch(() => {});
  });

  it("#exists()", async () => {
    assert.equal(
      await exists(path.join(TEST_RESOURCES_PATH, "sample.txt")),
      true,
    );
    assert.equal(
      await exists(path.join(TEST_RESOURCES_PATH, "nope.txt")),
      false,
    );
  });

  it("#readTextFile()", async () => {
    const fileContent = await readTextFile(
      path.join(TEST_RESOURCES_PATH, "sample.txt"),
    );
    assert.equal(fileContent, "Hello");
  });

  it("#readJsonFile()", async () => {
    const obj = await readJsonFile(
      path.join(TEST_RESOURCES_PATH, "sample.json"),
    );
    assert.equal(obj.title, "Hello");
  });

  it("#writeJsonFile()", async () => {
    const file = path.join(TEMP, "write.json");
    await writeJsonFile(file, { title: "Write" });
    assert.equal((await readJsonFile(file)).title, "Write");
  });

  it("#writeTextFile()", async () => {
    const file = path.join(TEMP, "write.txt");
    await writeTextFile(file, "Write");
    assert.equal(await readTextFile(file), "Write");
  });

  it("#writeTextFileRecursive()", async () => {
    const file = path.join(TEMP, "nested", "deep", "write.txt");
    await writeTextFileRecursive(file, "Nested");
    assert.equal(await readTextFile(file), "Nested");
  });

  it("#readJsonFilesFromPath()", async () => {
    const arr = await readJsonFilesFromPath(
      path.join(TEST_RESOURCES_PATH, "path", "*.json"),
    );
    assert.equal(arr.length, 2);
    assert.equal(arr[0].title, "a");
    assert.equal(arr[1].title, "b");
  });

  it("#copy()", async () => {
    const destination = path.join(TEST_RESOURCES_PATH, "copy");
    await copy(path.join(TEST_RESOURCES_PATH, "path"), destination);
    const objs = await readJsonFilesFromPath(path.join(destination, "*.json"));
    assert.equal(objs[0].title, "a");
    assert.equal(objs[1].title, "b");
    // Copying onto an existing destination fails.
    await assert.rejects(
      () => copy(path.join(TEST_RESOURCES_PATH, "path"), destination),
      { code: "EEXIST" },
    );
  });

  it("#unZipFromURL()", async () => {
    const destination = path.join(TEMP, "uncompressed");
    await unZipFromURL(
      new URL("./resources/compress.zip", import.meta.url),
      destination,
    );
    assert.equal(await exists(path.join(destination, "path", "a.json")), true);
    assert.equal(await exists(path.join(destination, "sample.txt")), true);
  });

  it("#unZipFromURL(): http URL", async () => {
    const zip = await fs.readFile(path.join(TEST_RESOURCES_PATH, "compress.zip"));
    const server = http.createServer((req, res) => {
      if (req.url === "/compress.zip") {
        res.writeHead(200, { "Content-Type": "application/zip" }).end(zip);
      } else {
        res.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    const { port } = server.address() as AddressInfo;

    try {
      const destination = path.join(TEMP, "http");
      await unZipFromURL(`http://127.0.0.1:${port}/compress.zip`, destination);
      assert.equal(await exists(path.join(destination, "sample.txt")), true);

      const missing = path.join(TEMP, "http-missing");
      await assert.rejects(
        () => unZipFromURL(`http://127.0.0.1:${port}/missing.zip`, missing),
        /404/,
      );
      assert.deepEqual(await fs.readdir(missing), []);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("#unZipFromURL(): invalid archive rejects and cleans up", async () => {
    const destination = path.join(TEMP, "invalid");
    await assert.rejects(() =>
      unZipFromURL(
        new URL("./resources/sample.json", import.meta.url),
        destination,
      )
    );
    assert.deepEqual(await fs.readdir(destination), []);
  });

  it("#remove()", async () => {
    await removeRecursive(TEMP);
    assert.equal(await exists(TEMP), false);
  });
});
