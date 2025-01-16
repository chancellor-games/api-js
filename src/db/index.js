import pg from "pg";

import migrations from "#src/db/migrations.js";

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://chancellor:chancellor@localhost:5432/chancellor",
});

export const info = async () => {
  const db_info = (
    await client.query(
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
    const res = await client.query("SELECT version FROM migration_status");
    return res.rows[0]["version"];
  } catch {
    return 0;
  }
};

export const up = async () => {
  const schema_version = await version();

  for (let i = schema_version; i < migrations.length; i++) {
    const migration = migrations[i];
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
    }
  }

  return await version();
};

export const init = async () => {
  await client.connect();
  await up();
};

export const shutdown = async () => {
  await client.end();
};
