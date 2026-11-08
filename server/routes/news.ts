import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../database/connection.ts";
import type { MarketNews } from "../types/type.ts";
import { fetchLiveNewsForTicker } from "../services/newsService.ts";

const router = Router();

/**
 * GET /api/news
 * Fetch and synchronize live market news with PostgreSQL.
 * Supports optional query parameter `ticker` for on-demand company/symbol searches.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const rawTicker = req.query.ticker;
    const searchTerm = rawTicker ? String(rawTicker).trim() : "";

    let targetQueries: string[] = [];

    if (searchTerm.length > 0) {
      //  User search mode: search for the exact query term
      targetQueries = [searchTerm];
    } else {
      //  Default mode: fetch major index catalysts + distinct active portfolio tickers
      const tradedTickers = await db("trades").distinct("ticker");
      const activeSymbols = tradedTickers
        .map((t) => t.ticker?.toUpperCase().trim())
        .filter(Boolean);

      targetQueries = Array.from(
        new Set(["MARKET", "SPY", "QQQ", ...activeSymbols]),
      );
    }

    // Fetch and upsert live articles into PostgreSQL
    for (const queryTerm of targetQueries) {
      const liveArticles = await fetchLiveNewsForTicker(queryTerm);

      for (const article of liveArticles) {
        try {
          await db("market_news")
            .insert({
              ticker: article.ticker,
              headline: article.headline,
              summary: article.summary,
              sentiment: article.sentiment,
              source: article.source,
              url: article.url,
              date: article.date,
            })
            .onConflict("url")
            .ignore();
        } catch (dbError) {
          console.error(
            `[newsRoute] Error inserting article "${article.headline}":`,
            dbError,
          );
        }
      }
    }

    //  Query PostgreSQL for today's market news sorted by newest date first
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    let query = db<MarketNews>("market_news")
      .select("*")
      .where("date", ">=", startOfToday.toISOString())
      .orderBy("date", "desc");

    if (searchTerm.length > 0) {
      const lowerSearch = `%${searchTerm.toLowerCase()}%`;
      query = query.andWhere((builder) => {
        builder
          .whereRaw("LOWER(ticker) LIKE ?", [lowerSearch])
          .orWhereRaw("LOWER(headline) LIKE ?", [lowerSearch])
          .orWhereRaw("LOWER(summary) LIKE ?", [lowerSearch]);
      });
    }

    const news = await query;
    return res.json({ success: true, count: news.length, data: news });
  } catch (error: any) {
    console.error("[newsRoute] Internal server error in GET /api/news:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to process market news." });
  }
});

// GET /api/news/:id - Fetch a single news article by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await db<MarketNews>("market_news")
      .where({ id: Number(id) })
      .first();

    if (!article) {
      return res
        .status(404)
        .json({ success: false, error: "Market news article not found." });
    }

    return res.json({ success: true, data: article });
  } catch (error) {
    console.error("[newsRoute] Error fetching single article:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
});

export default router;
