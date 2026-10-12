import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { isISODate } from "../mod.ts";

function isISODateCases() {
  it("isISODate(): positive", () => {
    assert.equal(isISODate("2022-12-27T07:40:25.551Z"), true);
  });
  it("isISODate(): negative", () => {
    assert.equal(isISODate("25/12/2022"), false);
  });
  it("isISODate(): out-of-range or malformed values return false", () => {
    assert.equal(isISODate("2022-13-45T07:40:25.551Z"), false);
    assert.equal(isISODate("2023-02-30T00:00:00.000Z"), false);
    assert.equal(isISODate("x2022-12-27T07:40:25.551Z"), false);
    assert.equal(isISODate("2022-12-27T07:40:25X551Z"), false);
    assert.equal(isISODate(""), false);
    assert.equal(isISODate("2016-12-31T23:59:60.000Z"), false);
  });
  it("isISODate(): leap day", () => {
    assert.equal(isISODate("2024-02-29T00:00:00.000Z"), true);
    assert.equal(isISODate("2023-02-29T00:00:00.000Z"), false);
  });
}

const globals = globalThis as { Temporal?: unknown };

describe("date", () => {
  describe(
    "with Temporal",
    {
      skip: globals.Temporal === undefined &&
        "Temporal is not available in this runtime",
    },
    () => {
      isISODateCases();
    },
  );

  describe("without Temporal (Date fallback)", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Temporal");

    before(() => {
      // Simulate a runtime that lacks Temporal.
      delete globals.Temporal;
    });

    after(() => {
      if (descriptor) Object.defineProperty(globalThis, "Temporal", descriptor);
    });

    it("Temporal is unavailable", () => {
      assert.equal(typeof globals.Temporal, "undefined");
    });
    isISODateCases();
  });
});
