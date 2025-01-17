import { get_player } from "#src/db/index.js";

export const player = async (game_id, player_id, base_url) => {
  const player = await get_player(game_id, player_id);
  player["urls"] = {
    self: `${base_url}/games/${game_id}/players/${player_id}`,
    events: `${base_url}/games/${game_id}/players/${player_id}/events`,
  };

  return {
    player,
  };
};
