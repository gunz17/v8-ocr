// backend/src/db/sqlite.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "gracie.db");

let db;

function initDB() {
  const exists = fs.existsSync(DB_PATH);

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) throw err;
    console.log("✔ SQLite DB connected");
  });

  if (!exists) {
    const schema = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );
    db.exec(schema);
    console.log("✔ DB Schema created");

    const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
    db.exec(seed);
    console.log("✔ DB Seed populated");
  }

  return db;
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };
