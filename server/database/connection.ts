import knex, { type Knex } from "knex";
import path from "path";

// Helper to safely import app from electron whether running locally or packaged
let dbPath = "db.sqlite";

try {
  // If running inside Electron, we use persistent user data path
  // @ts-ignore
  const { app } = require("electron");
  if (app) {
    const userDataPath = app.getPath("userData");
    dbPath = path.join(userDataPath, "db.sqlite");
  }
} catch (e) {
  // Fallback for local testing outside Electron window
  dbPath = path.join(process.cwd(), "db.sqlite");
}

console.log(`[SQLite Database Path]: ${dbPath}`);

export const db: Knex = knex({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});
