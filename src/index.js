import express from "express";
import pg from "pg";
import pino from "pino";
import httpLogger from "pino-http";

import pkg from "../package.json" with { type: "json" };

const logger = pino();
const app = express();
app.use(httpLogger({ logger, autoLogging: false }));
const port = process.env.PORT || 3000;

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://chancellor:chancellor@localhost:5432/chancellor",
});
await client.connect();
const db_info = (
  await client.query(
    `SELECT current_catalog as database,
            current_schema as schema,
            user,
            current_setting('server_encoding') as encoding,
            current_setting('server_version') as version`,
  )
).rows[0];

app.get("/", (req, res) => {
  res.json({
    name: "Chancellor Games API",
    version: pkg.version,
    spec: "https://chancellor.games",
    schema: "https://schema.chancellor.games",
    db: db_info,
  });
});

const server = app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

const shutdown = async () => {
  logger.info("Received kill signal, shutting down gracefully");

  await client.end();

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
