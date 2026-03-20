<div align="center">

<br />

# Hisaab

**Your trades. Your data. Your edge.**

A zero-friction trading journal for Indian traders.
Upload your broker CSV. See your real win rate in 2 minutes.

No signup. No server. No data leaves your browser.

<br />

[Get Started](#get-started) · [Demo](https://hisaab.dev/demo) · [Why Hisaab](#why)

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
2. Drop the file on hisaab.dev
3. See your P&L, win rate, and patterns. Instantly.
```

That's it. No account. No setup. Everything runs in your browser and stays on your device.

<br />

### What you get

| | |
|---|---|
| **Instant P&L** | Net profit, win rate, profit factor. Computed in seconds. |
| **FIFO Matching** | Automatic buy/sell matching with partial fill support |
| **Visual Analytics** | Cumulative equity curve, monthly P&L bars, trade distribution |
| **Multi-Broker** | Zerodha CSV, Groww XLSX. More coming. |
| **FY Aware** | Indian financial year (Apr to Mar) built in |
| **100% Private** | IndexedDB storage, zero network requests, verifiable via DevTools |

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
- [x] Zerodha & Groww parser
- [ ] Trade notes, tags & journaling
- [ ] Calendar heatmap
- [ ] Advanced analytics (Sharpe, drawdown, Monte Carlo)
- [ ] Tax report generation (STCG/LTCG)
- [ ] PWA offline support

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
