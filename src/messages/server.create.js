import { range, remove } from "ramda";

import { create_game, create_player } from "#src/db/index.js";
import { game } from "#src/messages/game.js";
import { random_int } from "#src/random.js";

const type = "server.create";

// This function will take in the full message for a client.create and return
// the full response server.create message
export const create = async (client, base_url) => {
  // First create a game from the provided game object (if any)
  const game_id = await create_game(client.game || {});

  let seats = range(1, client.players.length + 1);

  // Now for each player, loop over and create those
  for (let i = 0; i < client.players.length; i++) {
    const index = seats.length === 1 ? 0 : random_int(0, seats.length);
    const seat = seats[index];
    seats = remove(index, 1, seats);
    await create_player(game_id, seat, client.players[i]);
  }

  return {
    type,
    ...(await game(game_id, base_url)),
  };
};
