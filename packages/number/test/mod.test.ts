import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { random } from "../mod.ts";

describe("number", () => {
  it("random()", () => {
    for (let i = 0; i < 10; i++) {
      const rand = random(100, 200);
      assert.ok(Number.isInteger(rand) && 100 <= rand && rand <= 200);
    }

    for (let i = 0; i < 10; i++) {
      const rand = random(100, 200, true);
      assert.ok(100 <= rand && rand < 200);
    }
  });

  it("random(): fractional bounds stay in range", () => {
    for (let i = 0; i < 100; i++) {
      const rand = random(1.5, 3.2);
      assert.ok(Number.isInteger(rand) && 2 <= rand && rand <= 3);
    }
  });

  it("random(): invalid bounds throw", () => {
    assert.throws(() => random(10, 5), RangeError);
    assert.throws(() => random(0, Infinity), RangeError);
    assert.throws(() => random(NaN, 1), RangeError);
    assert.throws(() => random(1.2, 1.8), RangeError);
  });
});
