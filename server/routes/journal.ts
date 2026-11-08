import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../database/connection.ts";
import type { DailyJournal } from "../types/type.ts";

const router = Router();

//  Fetch all journal entries (ordered by date descending)
router.get("/", async (req: Request, res: Response) => {
  try {
    const journals = await db<DailyJournal>("daily_journal")
      .select("*")
      .orderBy("date", "desc");
    res.json({ success: true, data: journals });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

//  Fetch a single journal entry by date or ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await db<DailyJournal>("daily_journal")
      .where({ id: Number(id) })
      .first();

    if (!entry) {
      return res
        .status(404)
        .json({ success: false, error: "Journal entry not found" });
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Create or upsert a daily journal entry
router.post("/", async (req: Request, res: Response) => {
  try {
    const { date, market_bias, psychology_rating, notes }: DailyJournal =
      req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: date",
      });
    }

    if (
      market_bias &&
      !["Bullish", "Bearish", "Choppy"].includes(market_bias)
    ) {
      return res.status(400).json({
        success: false,
        error: "Market bias must be one of 'Bullish', 'Bearish', or 'Choppy'",
      });
    }

    if (psychology_rating !== undefined && psychology_rating !== null) {
      if (psychology_rating < 1 || psychology_rating > 5) {
        return res.status(400).json({
          success: false,
          error: "Psychology rating must be an integer between 1 and 5",
        });
      }
    }

    await db<DailyJournal>("daily_journal")
      .insert({
        date,
        market_bias: market_bias || null,
        psychology_rating: psychology_rating || null,
        notes: notes || null,
      })
      .onConflict("date")
      .merge({
        market_bias: market_bias || null,
        psychology_rating: psychology_rating || null,
        notes: notes || null,
        updated_at: new Date(),
      });

    // Fetch back the upserted entry to return to the client
    const savedEntry = await db<DailyJournal>("daily_journal")
      .where({ date })
      .first();

    res.status(201).json({ success: true, data: savedEntry });
  } catch (error) {
    console.error("Error saving journal entry:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
