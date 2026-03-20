<p align="center">
  <a href="https://hisaab.trymetis.app">
    <h1 align="center">Hisaab</h1>
  </a>
</p>

<p align="center">
  <strong>Your trades. Your data. Your edge.</strong>
</p>

<p align="center">
  A zero-friction trading journal for Indian traders.<br />
  Upload your broker CSV. See your real win rate in 2 minutes.<br />
  No signup. No server. No data leaves your browser.
</p>

<p align="center">
  <a href="https://github.com/Devansh-365/hisaab/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Devansh-365/hisaab/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <a href="https://github.com/Devansh-365/hisaab/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/Devansh-365/hisaab?style=social" /></a>
  <a href="CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
</p>

<p align="center">
  <a href="https://hisaab.trymetis.app/demo"><strong>Live Demo</strong></a> &nbsp;·&nbsp;
  <a href="#-get-started"><strong>Get Started</strong></a> &nbsp;·&nbsp;
  <a href="CONTRIBUTING.md"><strong>Contributing</strong></a> &nbsp;·&nbsp;
  <a href="#-roadmap"><strong>Roadmap</strong></a>
</p>

<br />

<!-- HERO SCREENSHOT -->
<!-- Replace with an actual screenshot of the dashboard for maximum impact -->
<!-- <p align="center">
  <a href="https://hisaab.trymetis.app">
    <img src="public/screenshot.png" alt="Hisaab Dashboard" width="100%" />
  </a>
</p> -->

## Why

91% of F&O traders lost money last year. The #1 differentiator between profitable and losing traders is **journaling**, yet almost no one does it.

The reason isn't motivation. It's **friction**.

Hisaab removes the friction entirely.

```
1. Export your tradebook from Zerodha or Groww
2. Drop the file on hisaab.trymetis.app
3. See your P&L, win rate, and patterns. Instantly.
```

That's it. No account. No setup. Everything runs in your browser and stays on your device.

<br />

## Features

<table>
<tr>
<td width="50%" valign="top">

### Analytics & Insights

- **Instant P&L:** Net profit, win rate, profit factor
- **FIFO Matching:** Auto buy/sell matching with partial fills
- **Visual Analytics:** Equity curve, monthly P&L, drawdown chart
- **Calendar Heatmap:** Daily P&L grid across the financial year
- **Advanced Metrics:** Sharpe ratio, Monte Carlo, Kelly criterion

</td>
<td width="50%" valign="top">

### Journal & Reports

- **Trade Journal:** Notes, strategy tags, emotion tracking, ratings
- **Tax Reports:** STCG/LTCG classification, ITR-ready CSV export
- **Multi-Broker:** Zerodha, Kite, Groww, Upstox, Angel One
- **100% Private:** IndexedDB storage, zero network requests
- **PWA:** Installable, works offline after first load

</td>
</tr>
</table>

<br />

## Tech Stack

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
  <img alt="Dexie.js" src="https://img.shields.io/badge/Dexie.js-1A73E8?style=for-the-badge&logo=databricks&logoColor=white" />
  <img alt="Recharts" src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white" />
  <img alt="Papa Parse" src="https://img.shields.io/badge/Papa_Parse-FF6F00?style=for-the-badge&logo=files&logoColor=white" />
</p>

> Static export. No backend. Deployable anywhere.

<br />

## Get Started

```bash
git clone https://github.com/Devansh-365/hisaab.git
cd hisaab
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) and drop a sample CSV from `public/demo-data/` to test.

<br />

## Philosophy

| Principle | What it means |
|---|---|
| **Zero friction** | Upload CSV, see dashboard. Nothing else required. |
| **Privacy first** | Your financial data never leaves your device. |
| **India native** | INR formatting, Indian brokers, FY awareness, tax-ready. |
| **Open source** | MIT licensed. Read every line. Self-host if you want. |

<br />

## Roadmap

- [x] CSV upload + instant P&L dashboard
- [x] FIFO trade matching with partial fills
- [x] Zerodha, Kite, Groww, Upstox, Angel One parsers
- [x] Trade journal with notes, tags, ratings
- [x] Calendar heatmap with FY view
- [x] Advanced analytics (Sharpe, drawdown, Monte Carlo, Kelly)
- [x] Tax report generation (STCG/LTCG with exemption)
- [x] PWA with offline support
- [ ] AI behavioral nudges (client-side pattern detection)
- [ ] Shareable stats card for social media
- [ ] Dark mode

<br />

## Contributing

**Broker parsers are the highest-impact contribution.** Every new parser unlocks thousands of users.

<table>
<tr>
<td>

**Read the docs:**

- [Contributing Guide](CONTRIBUTING.md): Setup, project structure, parser template, house rules
- [Code of Conduct](CODE_OF_CONDUCT.md): Contributor Covenant v2.1
- [Security Policy](SECURITY.md): Vulnerability reporting and architecture scope

</td>
<td>

**Quick links:**

- [Open a broker support request](https://github.com/Devansh-365/hisaab/issues/new?template=broker_support.yml)
- [Browse `good first issue`](https://github.com/Devansh-365/hisaab/labels/good%20first%20issue)
- [View open issues](https://github.com/Devansh-365/hisaab/issues)

</td>
</tr>
</table>

<br />

## Contributors

<a href="https://github.com/Devansh-365/hisaab/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Devansh-365/hisaab" />
</a>

<br />

## Star History

<a href="https://star-history.com/#Devansh-365/hisaab&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Devansh-365/hisaab&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Devansh-365/hisaab&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Devansh-365/hisaab&type=Date" width="100%" />
  </picture>
</a>

<br />

## License

MIT. See [LICENSE](LICENSE) for details.

<br />

<div align="center">

<sub>Built by <a href="https://github.com/Devansh-365">Devansh Tiwari</a> &nbsp;·&nbsp; Get AI-powered stock analysis at <a href="https://trymetis.app?utm_source=hisaab&utm_medium=readme&utm_content=footer">Metis</a></sub>

</div>
