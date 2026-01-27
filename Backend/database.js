const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const DB_PATH = path.join(__dirname, "linkhub.db");
let db = null;

async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new
  let data;
  if (fs.existsSync(DB_PATH)) {
    data = fs.readFileSync(DB_PATH);
  }
  
  db = new SQL.Database(data);
  
  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS link_hubs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      theme TEXT DEFAULT 'light',
      rules_config TEXT DEFAULT '[]',
      total_visits INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      hub_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT,
      FOREIGN KEY(hub_id) REFERENCES link_hubs(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      hub_id TEXT NOT NULL,
      date TEXT,
      visits INTEGER DEFAULT 0,
      timestamp INTEGER,
      FOREIGN KEY(hub_id) REFERENCES link_hubs(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS link_analytics (
      id TEXT PRIMARY KEY,
      link_id TEXT NOT NULL,
      hub_id TEXT NOT NULL,
      date TEXT,
      clicks INTEGER DEFAULT 0,
      timestamp INTEGER,
      FOREIGN KEY(link_id) REFERENCES links(id),
      FOREIGN KEY(hub_id) REFERENCES link_hubs(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )
  `);
  
  saveDatabase();
  return db;
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function query(sql, params = []) {
  if (!db) throw new Error("Database not initialized");
  try {
    db.run(sql, params);
    saveDatabase();
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

function get(sql, params = []) {
  if (!db) throw new Error("Database not initialized");
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return null;
  } catch (error) {
    console.error("Get query error:", error);
    throw error;
  }
}

function all(sql, params = []) {
  if (!db) throw new Error("Database not initialized");
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error("All query error:", error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  query,
  get,
  all,
  saveDatabase
};
