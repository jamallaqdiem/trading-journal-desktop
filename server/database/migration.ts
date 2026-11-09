import { db } from "./connection.ts";

export async function runMigrations() {
  const hasTrades = await db.schema.hasTable("trades");
  if (!hasTrades) {
    console.log("[Migration]: Creating database tables...");

    // Core US Stock Trades Table
    await db.schema.createTable("trades", (table) => {
      table.increments("id").primary();
      table.string("perm_id", 50).nullable();
      table.string("ticker", 10).notNullable();
      table.string("action", 10).notNullable();
      table.decimal("shares", 12, 2).notNullable();
      table.decimal("remaining_shares", 12, 2).nullable();
      table.decimal("entry_price", 10, 2).notNullable();
      table.decimal("exit_price", 10, 2).nullable();
      table.timestamp("entry_date", { useTz: true }).notNullable();
      table.timestamp("exit_date", { useTz: true }).nullable();
      table.decimal("holding_period_minutes", 10, 2).nullable();
      table.decimal("realized_pnl", 12, 2).nullable();
      table.decimal("commission", 6, 2).defaultTo(0);
      table.string("exchange", 50).nullable();
      table.string("exit_reason", 500).nullable();
      table.string("exit_type", 20).defaultTo("MANUAL");
      table.text("notes").nullable();
      table.string("screenshot_path", 500).nullable();
      table.timestamps(true, true);
    });

    // Daily Market News & Catalysts Table
    await db.schema.createTable("market_news", (table) => {
      table.increments("id").primary();
      table.date("date").notNullable();
      table.string("ticker", 10).nullable();
      table.text("headline").notNullable();
      table.text("summary").nullable();
      table.string("sentiment", 20).nullable();
      table.string("source", 100).nullable();
      table.text("url").unique().nullable();
      table.timestamps(true, true);
    });

    // Trader Journal & Psychology Table
    await db.schema.createTable("daily_journal", (table) => {
      table.increments("id").primary();
      table.date("date").unique().notNullable();
      table.string("market_bias", 20).nullable();
      table.integer("psychology_rating").nullable();
      table.text("notes").nullable();
      table.timestamps(true, true);
    });

    console.log("[Migration]: Tables created successfully!");
  }
}
