import { forEach } from "ramda";

import { get_players } from "#src/db/index.js";
import logger from "#src/logger.js";

const online = {};

export const update_meta = async (game_id) => {
  const players = await get_players(game_id);

  const message = {
    type: "server.meta",
    connected: {},
  };
  forEach((player) => {
    message.connected[player.id] = player.id in online;
  }, players);
  forEach((player) => {
    if (player.id in online) {
      online[player.id].send(message);
    }
  }, players);
};

export const init = async (game_id, player_id, req, res) => {
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client

  const send = (message) => {
    const json = JSON.stringify(message);
    res.write(`data: ${json}\n\n`);
  };

  const end = () => {
    res.end();
    delete online[player_id];
    logger.info(`Player ${player_id} disconnected from game ${game_id}`);
  };

  if (player_id in online) {
    online[player_id].end();
  }
  online[player_id] = {
    send,
    end,
  };

  logger.info(`Player ${player_id} connected to game ${game_id}`);
  await update_meta(game_id);

  // If client closes connection, stop sending events
  res.on("close", end);
};
