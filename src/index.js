import express from "express";
import pino from "pino";
import httpLogger from "pino-http";

import * as db from "#src/db/index.js";
import pkg from "../package.json" with { type: "json" };

const logger = pino();
const app = express();
app.use(httpLogger({ logger, autoLogging: false }));
app.use(express.json());
const port = process.env.PORT || 3000;

await db.init();

app.get("/", async (req, res) => {
  return res.json({
    name: "Chancellor Games API",
    version: pkg.version,
    spec: "https://chancellor.games",
    schema: "https://schema.chancellor.games",
    db: await db.info(),
  });
});

app.post("/games", (req, res) => {
  return res.json({});
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

  await db.shutdown();

  server.close(() => {
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
