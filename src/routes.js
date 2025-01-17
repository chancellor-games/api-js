import pkg from "#pkg" with { type: "json" };
import * as db from "#src/db/index.js";
import { game } from "#src/messages/game.js";
import { player } from "#src/messages/player.js";
import * as server from "#src/messages/server.js";
import validate from "#src/validate.js";

const get_base_url = (req) => {
  return `${req.protocol}://${req.headers.host}`;
};

export const index = async (req, res) => {
  return res.json({
    name: "Chancellor Games API",
    version: pkg.version,
    spec: "https://chancellor.games",
    schema: "https://schema.chancellor.games",
    db: await db.info(),
  });
};

export const post_games = async (req, res) => {
  const base_url = get_base_url(req);
  if (!validate(req.body, "client.create")) {
    return res.status(400).json({ error: "Invalid client.create message" });
  }
  return res.json(await server.create(req.body, base_url));
};

export const get_game = async (req, res) => {
  const base_url = get_base_url(req);
  return res.json(await game(req.params.id, base_url));
};

export const get_player = async (req, res) => {
  const base_url = get_base_url(req);
  return res.json(await player(req.params.game_id, req.params.id, base_url));
};

export const post_player = async (req, res) => {
  // const base_url = get_base_url(req);
  // const game_id = req.params.game_id;
  // const player_id = req.params.player_id;

  return res.json({});
};
