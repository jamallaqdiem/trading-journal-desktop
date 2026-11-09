import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { db } from "../database/connection.ts";
import type { Trade } from "../types/type.ts";
import { createTradeSchema } from "../schemas/tradeSchema.ts";

const router = Router();

//  Fetch all trades
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trades = await db<Trade>("trades")
      .select("*")
      .orderBy("entry_date", "desc");
    res.json({ success: true, data: trades });
  } catch (error) {
    next(error);
  }
});

// Fetch single trade by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const trade = await db<Trade>("trades")
      .where({ id: Number(id) })
      .first();

    if (!trade) {
      return res.status(404).json({ success: false, error: "Trade not found" });
    }

    res.json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
});

// Create a new trade entry
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = createTradeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: validationResult.error.format(),
      });
    }

    const validData = validationResult.data;

    // returns an array of inserted IDs
    const [newTradeId] = await db<Trade>("trades").insert({
      ticker: validData.ticker,
      action: validData.action,
      shares: validData.shares,
      entry_price: validData.entry_price,
      exit_price: validData.exit_price || null,
      entry_date: validData.entry_date,
      exit_date: validData.exit_date || null,
      holding_period_minutes: validData.holding_period_minutes || null,
      realized_pnl: validData.realized_pnl || null,
      commission: validData.commission,
      exit_reason: validData.exit_reason || null,
      notes: validData.notes || null,
      screenshot_path: validData.screenshot_path || null,
    });

    // Fetch the newly inserted record back to return it to the client
    const newTrade = await db<Trade>("trades")
      .where({ id: newTradeId })
      .first();

    res.status(201).json({ success: true, data: newTrade });
  } catch (error) {
    next(error);
  }
});
// PATCH /api/trades/:id
router.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { exit_reason, exit_type, exit_price, notes, screenshot_path } =
      req.body;

    try {
      const numericId = Number(id);

      const affectedRows = await db<Trade>("trades")
        .where({ id: numericId })
        .update({
          ...(exit_reason !== undefined && { exit_reason }),
          ...(exit_type !== undefined && { exit_type }),
          ...(exit_price !== undefined && { exit_price }),
          ...(notes !== undefined && { notes }),
          ...(screenshot_path !== undefined && { screenshot_path }),
          updated_at: new Date(),
        });

      if (!affectedRows) {
        return res
          .status(404)
          .json({ success: false, error: "Trade not found" });
      }

      // Fetch the updated trade to return it
      const updatedTrade = await db<Trade>("trades")
        .where({ id: numericId })
        .first();

      res.json({ success: true, data: updatedTrade });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
