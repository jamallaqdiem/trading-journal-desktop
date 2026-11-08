import axios from "axios";

export interface ParsedNewsArticle {
  ticker: string;
  headline: string;
  summary: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  source: string;
  url: string;
  date: string;
}

/**
 * Fetch news from Finnhub API for a given stock symbol.
 */
export async function fetchFinnhubNews(
  symbol: string,
): Promise<ParsedNewsArticle[]> {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) return [];

    const today = new Date().toISOString().split("T")[0];
    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(
      symbol.toUpperCase(),
    )}&from=${today}&to=${today}&token=${apiKey}`;

    const response = await axios.get(url, { timeout: 4000 });
    const newsItems = response.data || [];

    if (!Array.isArray(newsItems)) return [];

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Math.floor(startOfToday.getTime() / 1000);

    return newsItems
      .filter(
        (item: any) =>
          item.headline &&
          item.url &&
          (item.datetime || 0) >= startOfTodayTimestamp,
      )
      .map((item: any) => ({
        ticker: symbol.toUpperCase().slice(0, 10),
        headline: String(item.headline).trim(),
        summary: item.summary
          ? String(item.summary).trim().slice(0, 500)
          : "Financial Market News",
        sentiment: "NEUTRAL",
        source: item.source ? String(item.source).slice(0, 100) : "Finnhub",
        url: String(item.url).slice(0, 500),
        date: new Date(item.datetime * 1000).toISOString(),
      }));
  } catch (error: any) {
    console.error(
      `[newsService] Error fetching Finnhub news for "${symbol}":`,
      error?.message || error,
    );
    return [];
  }
}

/**
 * Safely extracts a clean string ticker symbol from Yahoo Finance's relatedTickers field.
 */
function extractPrimaryTicker(
  relatedTickers: any[],
  defaultSearch: string,
): string {
  if (Array.isArray(relatedTickers) && relatedTickers.length > 0) {
    const first = relatedTickers[0];
    if (typeof first === "string") return first.toUpperCase().slice(0, 10);
    if (typeof first === "object" && first?.symbol)
      return String(first.symbol).toUpperCase().slice(0, 10);
  }
  return defaultSearch.toUpperCase().slice(0, 10);
}

/**
 * Internal helper to fetch news strictly from Yahoo Finance.
 */
async function fetchYahooNews(
  searchTerm: string,
): Promise<ParsedNewsArticle[]> {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      searchTerm,
    )}&newsCount=15`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      timeout: 5000,
    });

    const newsItems = response.data?.news || [];
    if (!Array.isArray(newsItems)) return [];

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Math.floor(startOfToday.getTime() / 1000);

    const parsedArticles: ParsedNewsArticle[] = [];

    for (const item of newsItems) {
      if (!item.title || !item.link) continue;

      const publishTimeSeconds = Number(item.providerPublishTime) || 0;
      if (publishTimeSeconds < startOfTodayTimestamp) continue;

      const extractedTicker = extractPrimaryTicker(
        item.relatedTickers,
        searchTerm,
      );

      parsedArticles.push({
        ticker: extractedTicker,
        headline: String(item.title).trim(),
        summary: item.publisher
          ? String(item.publisher).trim()
          : "Financial Market News",
        sentiment: "NEUTRAL",
        source: item.publisher
          ? String(item.publisher).slice(0, 100)
          : "Yahoo Finance",
        url: String(item.link).slice(0, 500),
        date: new Date(publishTimeSeconds * 1000).toISOString(),
      });
    }

    return parsedArticles;
  } catch (error: any) {
    console.error(
      `[newsService] Error fetching Yahoo news for "${searchTerm}":`,
      error?.message || error,
    );
    return [];
  }
}

/**
 * Fetches combined live news from both Yahoo Finance and Finnhub.
 * Deduplicates items by URL and filters strictly for today's market catalysts.
 */
export async function fetchLiveNewsForTicker(
  queryParam: string = "MARKET",
): Promise<ParsedNewsArticle[]> {
  const searchTerm = queryParam.trim()
    ? queryParam.trim().toUpperCase()
    : "MARKET";

  // Execute both provider requests concurrently
  const [yahooNews, finnhubNews] = await Promise.all([
    fetchYahooNews(searchTerm),
    fetchFinnhubNews(searchTerm),
  ]);

  // Combine and deduplicate articles by unique URL
  const combined = [...yahooNews, ...finnhubNews];
  const uniqueMap = new Map<string, ParsedNewsArticle>();

  for (const article of combined) {
    if (article.url && !uniqueMap.has(article.url)) {
      uniqueMap.set(article.url, article);
    }
  }

  return Array.from(uniqueMap.values());
}
