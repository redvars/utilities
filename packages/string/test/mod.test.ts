import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toBoolean, toKebabCase, underscoreToTitleCase } from "../mod.ts";

describe("string", function () {
  it("underscoreToTitleCase()", function () {
    assert.equal(underscoreToTitleCase("hello_world"), "Hello World");
    assert.equal(underscoreToTitleCase("_hello_world_"), " Hello World ");
    assert.equal(underscoreToTitleCase("_hello_world_"), " Hello World ");
    assert.equal(underscoreToTitleCase(null), "");
    assert.equal(underscoreToTitleCase(undefined), "");
    assert.equal(underscoreToTitleCase("a__b"), "A  B");
  });

  it("toKebabCase()", function () {
    assert.equal(toKebabCase("HelloWorld"), "hello-world");
    assert.equal(toKebabCase("hello_world"), "hello-world");
    assert.equal(toKebabCase("Hello World"), "hello-world");
    assert.equal(toKebabCase("hello_World"), "hello-world");
    assert.equal(toKebabCase(null), "");
  });

  it("toBoolean()", function () {
    assert.equal(toBoolean("true"), true);
    assert.equal(toBoolean("false"), false);
    assert.equal(toBoolean("1"), true);
    assert.equal(toBoolean("0"), false);
    assert.equal(toBoolean("   "), false);
    assert.equal(toBoolean(" Yes "), true);
    assert.equal(toBoolean(null), false);
  });
});
