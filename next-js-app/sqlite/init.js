const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("../database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS utexasMappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT,
      value TEXT,
      created_by TEXT,
      transformation TEXT,
      UNIQUE(key, transformation)
    );
  `);
});

db.close();
