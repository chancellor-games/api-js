import pg from "pg";

import { dissoc, map } from "ramda";

import migrations from "#src/db/migrations.js";

const { Pool } = pg;
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://chancellor:chancellor@localhost:5432/chancellor",
});

export const info = async () => {
  const db_info = (
    await pool.query(
      `SELECT current_catalog as database,
              current_schema as schema,
              user,
              current_setting('server_encoding') as encoding,
              current_setting('server_version') as version`,
    )
  ).rows[0];

  return {
    ...db_info,
    schema_version: await version(),
  };
};

export const version = async () => {
  try {
    const res = await pool.query("SELECT version FROM migration_status");
    return res.rows[0]["version"];
  } catch {
    return 0;
  }
};

export const up = async () => {
  const schema_version = await version();

  for (let i = schema_version; i < migrations.length; i++) {
    const migration = migrations[i];
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const sql of migration.up) {
        await client.query(sql);
      }
      await client.query("UPDATE migration_status SET version = $1", [i + 1]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  return await version();
};

export const init = async () => {
  await up();
};

export const shutdown = async () => {
  await pool.end();
};

const gather = (row) => ({
  ...row.data,
  ...dissoc("data", row),
});

const select_one = async (query, values) => {
  const result = await pool.query(query, values);
  return gather(result.rows[0]);
};

const select_many = async (query, values) => {
  const result = await pool.query(query, values);
  return map(gather, result.rows);
};

const insert = async (query, values) => {
  const result = await pool.query(query, values);
  return result.rows[0].id;
};

export const get_game = async (game_id) => {
  return await select_one(
    "SELECT id, state, created_at, data FROM games WHERE id = $1",
    [game_id],
  );
};

export const get_player = async (game_id, player_id) => {
  return await select_one(
    "SELECT id, created_at, data FROM players WHERE id = $1 AND game_id = $2",
    [player_id, game_id],
  );
};

export const get_players = async (game_id) => {
  return await select_many(
    "SELECT id, created_at, data FROM players WHERE game_id = $1",
    [game_id],
  );
};

export const create_game = async (game) => {
  return await insert("INSERT INTO games (data) VALUES ($1) RETURNING id", [
    game,
  ]);
};

export const create_player = async (game_id, player) => {
  return await insert(
    "INSERT INTO players (game_id, data) VALUES ($1, $2) RETURNING id",
    [game_id, player],
  );
};
