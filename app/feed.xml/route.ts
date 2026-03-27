import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/constants";

export const dynamic = "force-static";

const items = [
  {
    title: "Hisaab - Free Trading Journal for Indian Traders",
    description:
      "A zero-friction trading journal. Upload your broker tradebook CSV from Zerodha, Groww, Upstox, or Angel One and see instant P&L analytics, win rate, profit factor, and more. No signup required.",
    link: SITE_URL,
    date: "2025-07-01T00:00:00Z",
  },
  {
    title: "Live Demo - Explore Hisaab Without Uploading",
    description:
      "Try Hisaab with sample trade data. See the dashboard, calendar heatmap, trade journal, and advanced analytics without uploading your own file.",
    link: `${SITE_URL}/demo`,
    date: "2025-07-01T00:00:00Z",
  },
  {
    title: "Dashboard - Instant P&L Analytics",
    description:
      "Net P&L, win rate, profit factor, average win/loss, cumulative equity curve, and financial year filtering. All calculated client-side from your broker CSV.",
    link: `${SITE_URL}/dashboard`,
    date: "2025-07-01T00:00:00Z",
  },
  {
    title: "Trade Journal - Notes, Tags, and Emotion Tracking",
    description:
      "Add notes, strategy tags, emotion tracking, and ratings to every trade. Build your trading discipline with structured journaling.",
    link: `${SITE_URL}/journal`,
    date: "2025-07-01T00:00:00Z",
  },
  {
    title: "Calendar Heatmap - Daily P&L Across the Financial Year",
    description:
      "See your daily trading performance in a calendar grid. Color-coded green/red for profit/loss days. Indian financial year aware (April to March).",
    link: `${SITE_URL}/calendar`,
    date: "2025-07-01T00:00:00Z",
  },
  {
    title: "Advanced Analytics - Sharpe, Monte Carlo, Kelly Criterion",
    description:
      "Sharpe ratio, maximum drawdown, Monte Carlo simulation, Kelly criterion position sizing, and monthly/weekly P&L breakdowns.",
    link: `${SITE_URL}/analytics`,
    date: "2025-07-01T00:00:00Z",
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-in</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
