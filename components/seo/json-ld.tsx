import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_AUTHOR,
  METIS_URL,
} from "@/lib/constants";

const webApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#app`,
  name: SITE_NAME,
  url: SITE_URL,
  description:
    `A zero-friction trading journal for Indian traders. ${SITE_DESCRIPTION}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  softwareVersion: "1.0",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "Zerodha CSV import",
    "Groww CSV import",
    "Upstox CSV import",
    "Angel One CSV import",
    "FIFO trade matching with partial fills",
    "Win rate and profit factor analysis",
    "P&L calendar heatmap",
    "Trade journal with notes and tags",
    "Sharpe ratio calculation",
    "Monte Carlo simulation",
    "Kelly criterion position sizing",
    "STCG/LTCG tax report generation",
    "100% browser-based, zero network requests",
    "PWA with offline support",
    "Open source (MIT license)",
  ],
  screenshot: `${SITE_URL}/opengraph-image`,
  creator: {
    "@type": "Person",
    name: SITE_AUTHOR.name,
    url: SITE_AUTHOR.url,
  },
  sourceOrganization: {
    "@type": "Organization",
    name: "Metis",
    url: METIS_URL,
  },
  license: "https://opensource.org/licenses/MIT",
  isAccessibleForFree: true,
  inLanguage: "en",
  audience: {
    "@type": "Audience",
    audienceType: "Indian retail traders and investors on NSE/BSE",
  },
};

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: `Is my trading data safe on ${SITE_NAME}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${SITE_NAME} is 100% browser-based. Your trading data never leaves your device. There is no server, no database, and no analytics tracking of your financial data. Everything is stored locally in your browser's IndexedDB.`,
      },
    },
    {
      "@type": "Question",
      name: `Which Indian brokers does ${SITE_NAME} support?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${SITE_NAME} supports CSV and XLSX imports from Zerodha (Kite), Groww, Upstox, and Angel One. The broker is auto-detected from the file's column headers.`,
      },
    },
    {
      "@type": "Question",
      name: `Is ${SITE_NAME} free to use?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${SITE_NAME} is completely free and open source under the MIT license. There are no paid plans, no premium features, and no ads.`,
      },
    },
    {
      "@type": "Question",
      name: `Does ${SITE_NAME} work offline?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${SITE_NAME} is a Progressive Web App (PWA). After the first visit, it works completely offline. You can install it on your phone or desktop.`,
      },
    },
    {
      "@type": "Question",
      name: `What analytics does ${SITE_NAME} provide?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${SITE_NAME} provides net P&L, win rate, profit factor, Sharpe ratio, maximum drawdown, Monte Carlo simulation, Kelly criterion position sizing, cumulative equity curve, calendar heatmap, monthly P&L breakdown, and STCG/LTCG tax classification.`,
      },
    },
    {
      "@type": "Question",
      name: `How does FIFO trade matching work in ${SITE_NAME}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: "First In, First Out (FIFO) matching pairs your buy and sell trades chronologically. If you bought 100 shares and later sold 50, it matches the sell against the first 50 shares you bought. This is the standard method used for Indian tax calculations.",
      },
    },
  ],
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
