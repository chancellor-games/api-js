const migrations = [
  {
    up: [
      `CREATE TABLE IF NOT EXISTS migration_status (
  version INTEGER PRIMARY KEY
)`,
      `INSERT INTO migration_status (version) VALUES (0)`,
    ],
    down: [`DROP TABLE migration_status`],
  },
  {
    up: [
      `CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(16) NOT NULL DEFAULT 'setup',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'
)`,
    ],
    down: [`DROP TABLE games`],
  },
  {
    up: [
      `CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'
)`,
    ],
    down: [`DROP TABLE players`],
  },
  {
    up: [`ALTER TABLE players ADD COLUMN seat SMALLINT NOT NULL`],
    down: [`ALTER TABLE players DROP COLUMN seat`],
  },
];

export default migrations;
