import express from "express";
import httpLogger from "pino-http";

import * as db from "#src/db/index.js";
import logger from "#src/logger.js";
import {
  get_game,
  get_player,
  index,
  post_games,
  post_player,
} from "#src/routes.js";
import * as sse from "#src/sse.js";

const app = express();
app.use(httpLogger({ logger, autoLogging: false }));
app.use(express.json());
const port = process.env.PORT || 3000;

// Initialized DB
await db.init();

// Add Routes
app.get("/", index);
app.get("/games/:id", get_game);
app.get("/games/:game_id/players/:id", get_player);

// Creating a new game
app.post("/games", post_games);

// Submitting actions
app.post("/games/:game_id/players/:id", post_player);

// SSE
app.get("/games/:game_id/players/:id/events", (req, res) => {
  const game_id = req.params.game_id;
  const player_id = req.params.id;

  return sse.init(game_id, player_id, req, res);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

const server = app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

const shutdown = async () => {
  logger.info("Received kill signal, shutting down gracefully");

  server.close(async () => {
    await db.shutdown();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
