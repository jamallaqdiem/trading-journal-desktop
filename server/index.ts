import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

try {
  // @ts-ignore
  const { app } = require("electron");
  if (app) {
    const userDataPath = app.getPath("userData");
    dotenv.config({ path: path.join(userDataPath, ".env") });
  } else {
    dotenv.config(); // Fallback for local development
  }
} catch (e) {
  dotenv.config(); // Fallback when run via terminal
}

import { errorHandler } from "./middleware/errorHandler.ts";
import { runMigrations } from "./database/migration.ts";
import tradesRouter from "./routes/trades.ts";
import journalRouter from "./routes/journal.ts";
import newsRouter from "./routes/news.ts";

export async function startLocalServer() {
  await runMigrations();

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());

  // Mount your existing routes
  app.use("/api/trades", tradesRouter);
  app.use("/api/journal", journalRouter);
  app.use("/api/news", newsRouter);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`[Local Express Server]: Running on http://localhost:${PORT}`);
  });
}

startLocalServer();
