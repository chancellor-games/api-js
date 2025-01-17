import { get_game, get_players } from "#src/db/index.js";

export const game = async (game_id, base_url) => {
  const game = await get_game(game_id);
  game["urls"] = {
    self: `${base_url}/games/${game_id}`,
  };

  const players = await get_players(game_id);
  for (let i = 0; i < players.length; i++) {
    const player_id = players[i].id;
    players[i]["urls"] = {
      self: `${base_url}/games/${game_id}/players/${player_id}`,
      events: `${base_url}/games/${game_id}/players/${player_id}/events`,
    };
  }

  return {
    game,
    players,
  };
};
