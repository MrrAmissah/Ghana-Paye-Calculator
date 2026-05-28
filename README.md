# Ghana PAYE Calculator

Client-side income tax calculator for Ghana — enter your monthly salary, get your SSNIT deduction, PAYE breakdown by band, and net take-home instantly.

**Live demo:** https://ghana-paye-calculator.vercel.app

![screenshot](./screenshot.png)

## What it calculates

Given a monthly basic salary (plus optional allowances and a voluntary Tier 3 contribution):

| Output | Description |
|---|---|
| Gross Income | Basic + allowances |
| SSNIT — Tier 1 | 5.5% of basic salary only (not allowances) |
| Chargeable Income | Gross − SSNIT − Tier 3 |
| PAYE | Progressive tax across applicable bands |
| Net Take-Home | Gross − SSNIT − PAYE − Tier 3 |

## 2026 GRA Monthly Income Tax Bands

| Band | Rate |
|---|---|
| First GH₵ 490.00 | 0% |
| Next GH₵ 110.00 | 5% |
| Next GH₵ 130.00 | 10% |
| Next GH₵ 3,166.67 | 17.5% |
| Next GH₵ 16,000.00 | 25% |
| Next GH₵ 30,520.00 | 30% |
| Above GH₵ 50,416.67 | 35% |

Bands are defined in a single exported array in `src/lib/paye.ts` — one edit when GRA revises the rates.

## Sanity check

Monthly basic **GH₵ 5,000** (no allowances, no Tier 3):

| | |
|---|---|
| SSNIT | GH₵ 275.00 |
| Chargeable income | GH₵ 4,725.00 |
| PAYE | GH₵ 779.75 |
| Net take-home | GH₵ 3,945.25 |

## Tech stack

| Tool | Purpose |
|---|---|
| Vite 6 | Build tool & dev server |
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling with custom design tokens |
| Vitest | Unit testing |

## Run locally

```bash
npm install
npm run dev       # dev server → http://localhost:5173
npm run build     # production build
npm run preview   # preview production build
```

## Tests

```bash
npm run test
```

Covers: zero salary, salary in the 0% band, the spec sanity-check (basic GH₵ 5,000), high salary reaching the 35% band, allowances, Tier 3 (including the 16.5% cap), and negative input clamping.

---

> **Estimate only.** Based on 2026 GRA monthly income tax bands and the 5.5% SSNIT employee Tier 1 rate. Does not account for overtime, bonuses, or back-pay. Always confirm with the [Ghana Revenue Authority (GRA)](https://gra.gov.gh) or a licensed tax professional.
> **Data source: GRA.**

## License

MIT
