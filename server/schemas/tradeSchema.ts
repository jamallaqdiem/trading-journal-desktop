import { z } from "zod";

export const createTradeSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").toUpperCase(),
  action: z.enum(["BUY", "SELL"], { message: "Action must be BUY or SELL" }),
  shares: z.number().positive("Shares must be greater than 0"),
  entry_price: z.number().positive("Entry price must be greater than 0"),
  entry_date: z.string().min(1, "Entry date is required"), // Ensures date is provided
  exit_price: z
    .number()
    .positive("Exit price must be greater than 0")
    .optional()
    .nullable(),
  exit_date: z.string().optional().nullable(),
  holding_period_minutes: z.number().optional().nullable(),
  realized_pnl: z.number().optional().nullable(),
  commission: z
    .number()
    .nonnegative("Commission cannot be negative")
    .default(0),
  exit_reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  screenshot_path: z.string().optional().nullable(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
