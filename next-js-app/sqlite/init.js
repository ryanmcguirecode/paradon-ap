const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("../database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE utexasMappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT,
      value TEXT,
      created_by TEXT,
      transformation TEXT
    );
  `);
});

db.close();
