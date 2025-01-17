import { describe, expect, it } from "vitest";

import { forEach, times, xprod } from "ramda";

import {
  n_random_dice,
  random,
  random_dice,
  random_die,
  random_int,
} from "#src/random.js";

const ITERATIONS = 100;

describe("random_int", () => {
  it("should return random ints", () => {
    times(() => {
      const n = random_int(0, 5);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(5);
    }, ITERATIONS);
  });
});

describe("random_die", () => {
  it.for([2, 4, 6, 8, 10, 12, 20])(
    "should return 1d%i die results",
    (sides) => {
      times(() => {
        const n = random_die(sides);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(sides);
      }, ITERATIONS);
    },
  );
});

describe("random_dice", () => {
  it.for(xprod([2, 4, 8], [2, 4, 6, 8, 10, 12, 20]))(
    "should return %id%i die results",
    ([number, sides]) => {
      times(() => {
        const n = random_dice(number, sides);
        expect(n).toBeGreaterThanOrEqual(number);
        expect(n).toBeLessThanOrEqual(number * sides);
      }, ITERATIONS);
    },
  );
});

describe("n_random_dice", () => {
  it.for([1, 2, 3, 4, 5, 6, 7, 8])("should return %ix2d6 die results", (n) => {
    times(() => {
      const rs = n_random_dice(n, 2, 6);
      expect(rs).toHaveLength(n);
      forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(2);
        expect(r).toBeLessThanOrEqual(12);
      }, rs);
    }, ITERATIONS);
  });
});

describe("random", () => {
  it.for([
    ["zero", 0],
    ['""', ""],
    ["null", null],
    ["[]", []],
    ["foo", "foo"],
  ])("should return no results for %s", ([, request]) => {
    expect(random(request)).toStrictEqual([]);
  });

  it.for(["[1-4]", "[1-5)"])("should handle %s", (request) => {
    times(() => {
      const result = random(request);
      expect(result).toHaveLength(1);
      const number = result[0];
      expect(number).toBeGreaterThanOrEqual(1);
      expect(number).toBeLessThanOrEqual(4);
    }, ITERATIONS);
  });

  it("should handle 2x4d6", () => {
    times(() => {
      const result = random("2x4d6");
      expect(result).toHaveLength(2);
      forEach((number) => {
        expect(number).toBeGreaterThanOrEqual(4);
        expect(number).toBeLessThanOrEqual(24);
      }, result);
    }, ITERATIONS);
  });
});
