import { randomInt } from "node:crypto";

import { is, isNotNil, map } from "ramda";

export const random_int = (min, max) => {
  return randomInt(min, max);
};

export const random_die = (sides) => {
  return random_int(1, sides + 1);
};

export const random_dice = (number, sides) => {
  if (number === 0) {
    return 0;
  }

  return random_die(sides) + random_dice(number - 1, sides);
};

export const n_random_dice = (n, number, sides) => {
  return map(() => random_dice(number, sides), Array(n).fill());
};

const RANGE_RE = /^\[(\d+)-(\d+)([\])])$/;
const DICE_RE = /^(?:(\d+)x)?(\d+)d(\d+)$/;

// Handles multiple random request strings
// Returns an array of random results
export const random = (request) => {
  if (!is(String, request)) {
    return [];
  }

  const dice = DICE_RE.exec(request);
  if (isNotNil(dice)) {
    if (dice.length < 4) {
      return [random_dice(parseInt(dice[1]), parseInt(dice[2]))];
    }
    return n_random_dice(
      parseInt(dice[1]),
      parseInt(dice[2]),
      parseInt(dice[3]),
    );
  }

  const range = RANGE_RE.exec(request);
  if (isNotNil(range)) {
    if (range[3] === "]") {
      return [random_int(parseInt(range[1]), parseInt(range[2]) + 1)];
    }
    return [random_int(parseInt(range[1]), parseInt(range[2]))];
  }

  return [];
};
