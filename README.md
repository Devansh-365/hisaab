<div align="center">

<br />

# Hisaab

**Your trades. Your data. Your edge.**

A zero-friction trading journal for Indian traders.
Upload your broker CSV. See your real win rate in 2 minutes.

No signup. No server. No data leaves your browser.

<br />

[Get Started](#get-started) · [Demo](https://hisaab.trymetis.app/demo) · [Why Hisaab](#why)

<br />

---

</div>

<br />

### Why

91% of F&O traders lost money last year. The #1 differentiator between profitable and losing traders is journaling, yet almost no one does it. The reason isn't motivation. It's friction.

Hisaab removes the friction entirely.

<br />

### How it works

```
1. Export your tradebook from Zerodha or Groww
2. Drop the file on hisaab.trymetis.app
3. See your P&L, win rate, and patterns. Instantly.
```

That's it. No account. No setup. Everything runs in your browser and stays on your device.

<br />

### What you get

<table width="100%">
<tr><td width="180"><strong>Instant P&L</strong></td><td>Net profit, win rate, profit factor. Computed in seconds.</td></tr>
<tr><td><strong>FIFO Matching</strong></td><td>Automatic buy/sell matching with partial fill support</td></tr>
<tr><td><strong>Visual Analytics</strong></td><td>Equity curve, monthly P&L bars, drawdown chart, day-of-week analysis</td></tr>
<tr><td><strong>Trade Journal</strong></td><td>Notes, strategy tags, emotion tracking, star ratings on every trade</td></tr>
<tr><td><strong>Calendar Heatmap</strong></td><td>Daily P&L grid across the financial year. Click any day to drill down.</td></tr>
<tr><td><strong>Tax Reports</strong></td><td>STCG/LTCG classification, Rs 1.25L exemption, ITR-ready CSV export</td></tr>
<tr><td><strong>Multi-Broker</strong></td><td>Zerodha, Kite, Groww, Upstox, Angel One. CSV and XLSX.</td></tr>
<tr><td><strong>Advanced Analytics</strong></td><td>Sharpe ratio, max drawdown, Monte Carlo simulation, Kelly criterion</td></tr>
<tr><td><strong>100% Private</strong></td><td>IndexedDB storage, zero network requests, verifiable via DevTools</td></tr>
<tr><td><strong>PWA</strong></td><td>Installable, works offline after first load</td></tr>
</table>

<br />

### Get Started

```bash
git clone https://github.com/Devansh-365/hisaab.git
cd hisaab
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000)

<br />

### Tech

Next.js · TypeScript · Tailwind CSS · shadcn/ui · Dexie.js · Recharts · Papa Parse

Static export. No backend. Deployable anywhere.

<br />

### Philosophy

- **Zero friction.** Upload CSV, see dashboard. Nothing else required.
- **Privacy first.** Your financial data never leaves your device.
- **India native.** INR formatting, Indian brokers, FY awareness, tax-ready.
- **Open source.** MIT licensed. Read every line. Self-host if you want.

<br />

### Roadmap

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

### Contributing

PRs welcome. If your broker isn't supported, open an issue with an anonymized sample CSV.

<br />

### License

MIT

<br />

<div align="center">

<sub>Built by <a href="https://github.com/Devansh-365">Devansh Tiwari</a> · Get AI-powered stock analysis at <a href="https://trymetis.app?utm_source=hisaab&utm_medium=readme&utm_content=footer">Metis</a></sub>

</div>
