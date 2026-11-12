import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import net from "net";

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
  const desiredPort = Number(process.env.PORT) || 5000;

  app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    }),
  );
  app.use(express.json());

  // Mount routes
  app.use("/api/trades", tradesRouter);
  app.use("/api/journal", journalRouter);
  app.use("/api/news", newsRouter);
  app.use(errorHandler);

  // Helper function to listen with automatic fallback if port is busy
  const listenOnPort = (port: number) => {
    const server = app.listen(port, "127.0.0.1", () => {
      const address = server.address();
      const actualPort =
        address && typeof address === "object" ? address.port : port;

      console.log(
        `[Local Express Server]: Running on http://localhost:${actualPort}`,
      );

      process.env.PORT = actualPort.toString();
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.warn(
          `[Local Express Server]: Port ${port} is busy, trying an auto-allocated port...`,
        );
        listenOnPort(0);
      } else {
        console.error("[Local Express Server]: Failed to start server:", err);
      }
    });
  };

  listenOnPort(desiredPort);
}
