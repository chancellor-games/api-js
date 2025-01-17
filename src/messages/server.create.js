import { create_game, create_player } from "#src/db/index.js";
import { game } from "#src/messages/game.js";

const type = "server.create";

// This function will take in the full message for a client.create and return
// the full response server.create message
export const create = async (client, base_url) => {
  // First create a game from the provided game object (if any)
  const game_id = await create_game(client.game || {});

  // Now for each player, loop over and create those
  for (let i = 0; i < client.players.length; i++) {
    await create_player(game_id, client.players[i]);
  }

  return {
    type,
    ...(await game(game_id, base_url)),
  };
};
