import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { after, before, describe, it } from "node:test";

import { GitError, GITUtility } from "../mod.ts";

describe("git", () => {
  let tmp: string;
  let repoPath: string;
  let repo: GITUtility;

  before(async () => {
    tmp = await fs.mkdtemp(path.join(tmpdir(), "utility-git-"));
    repoPath = path.join(tmp, "run_command_test");
    await fs.mkdir(repoPath, { recursive: true });
    repo = new GITUtility(repoPath);
    await repo.runCommand("init");
    await repo.runCommand("config", "user.email", "test@example.com");
    await repo.runCommand("config", "user.name", "Test");
    // Keep commits independent of the user's global signing setup.
    await repo.runCommand("config", "commit.gpgsign", "false");
  });

  after(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("runCommand(): positive", async () => {
    const output = await repo.runCommand("status");
    assert.match(output, /No commits yet/);
  });

  it("runCommand(): negative", async () => {
    await assert.rejects(() => repo.runCommand("invalid_command"), GitError);
  });

  it("runCommand(): missing working directory", async () => {
    await assert.rejects(
      () =>
        new GITUtility(path.join(tmp, "does-not-exist")).runCommand("status"),
      GitError,
    );
  });

  it("hasUncommittedChanges()", async () => {
    assert.equal(await repo.hasUncommittedChanges(), false);
    await fs.writeFile(path.join(repoPath, "a.txt"), "a");
    assert.equal(await repo.hasUncommittedChanges(), true);
  });

  it("clone()", async () => {
    await repo.runCommand("add", ".");
    await repo.runCommand("commit", "-m", "init");

    const checkouts = path.join(tmp, "checkouts");
    await fs.mkdir(checkouts);
    await new GITUtility(checkouts).clone(repoPath);
    const stat = await fs.stat(
      path.join(checkouts, "run_command_test", "a.txt"),
    );
    assert.ok(stat.isFile());
  });

  it("clone(): option-like URL is not interpreted as a flag", async () => {
    await assert.rejects(
      () => repo.clone("--upload-pack=touch pwned"),
      GitError,
    );
  });
});
