const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("../database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE mappings (
      key TEXT PRIMARY KEY,
      value TEXT,
      field TEXT,
      created_by TEXT
    );
  `);
});

db.close();
