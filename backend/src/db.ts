import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.OPPORTUNITYCLAW_DB || path.join(__dirname, "..", "data", "opportunityclaw.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      domain TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS trend_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      keyword TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, keyword)
    );

    CREATE TABLE IF NOT EXISTS seen_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      url_hash TEXT NOT NULL,
      entity TEXT,
      title TEXT,
      seen_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, url_hash)
    );

    CREATE TABLE IF NOT EXISTS digests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      entity TEXT NOT NULL,
      signal_type TEXT,
      summary TEXT,
      score REAL,
      url TEXT,
      outreach_snippet TEXT,
      content_hook TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
