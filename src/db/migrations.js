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
];

export default migrations;
