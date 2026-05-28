# Ghana PAYE Calculator

**Live demo:** https://ghana-paye-calculator.vercel.app

![Ghana PAYE Calculator preview](./ghana-paye-calculator-preview.png)

A client-side Ghana payroll and income tax dashboard for estimating PAYE, SSNIT, voluntary Tier 3 deductions, and net take-home pay from monthly salary details.

> **Estimate only.** This calculator is based on 2026 Ghana Revenue Authority (GRA) monthly income tax bands and the SSNIT employee Tier 1 rate. It does not account for overtime, bonuses, back-pay, reliefs, or other non-standard payroll items. Always confirm with the Ghana Revenue Authority (GRA) or a licensed tax professional.

## Features

Salary inputs:
Enter monthly basic salary, optional allowances, and optional voluntary Tier 3 contribution.

Tier 3 cap handling:
Voluntary Tier 3 is capped at 16.5% of basic salary and the UI warns when the cap applies.

Monthly / annual toggle:
Switch every displayed value between monthly and annual views.

Net-pay dashboard:
Shows take-home pay prominently with a take-home/deductions donut chart.

Tax breakdown table:
Displays each GRA band, rate, taxable amount, and tax due from the live calculation state.

Contribution summary:
Shows employee SSNIT, employer SSNIT, Tier 3, PAYE, and total employee deductions.

Quick facts:
Explains useful assumptions such as net-pay percentage, effective PAYE rate, and top marginal band.

Copy summary:
Copies the current calculated payslip summary to the clipboard.

Print payslip:
Opens a print-ready payslip view with form controls hidden.

Dark mode:
Supports a deep espresso/charcoal dark theme while keeping print output light and readable.

## Calculation Flow

Given a monthly basic salary, optional allowances, and optional voluntary Tier 3 contribution:

Gross income:
Basic salary + allowances.

Employee SSNIT Tier 1:
5.5% of basic salary only.

Voluntary Tier 3:
User input capped at 16.5% of basic salary.

Chargeable income:
Gross income - SSNIT Tier 1 - voluntary Tier 3.

PAYE tax:
2026 GRA monthly bands applied progressively to chargeable income.

Net take-home pay:
Gross income - SSNIT Tier 1 - voluntary Tier 3 - PAYE tax.

SSNIT Tier 1 at **5.5%** is deducted before the PAYE bands apply.

## 2026 GRA Monthly Income Tax Bands

First band:
First GH₵ 490.00 at 0.0%.

Second band:
Next GH₵ 110.00 at 5.0%.

Third band:
Next GH₵ 130.00 at 10.0%.

Fourth band:
Next GH₵ 3,166.67 at 17.5%.

Fifth band:
Next GH₵ 16,000.00 at 25.0%.

Sixth band:
Next GH₵ 30,520.00 at 30.0%.

Top band:
Above GH₵ 50,416.67 at 35.0%.

Data source: **Ghana Revenue Authority (GRA)**.

The band definitions are maintained in `src/lib/paye.ts`.

## Example

For monthly basic salary **GH₵ 12,000.00**, allowances **GH₵ 2,000.00**, and voluntary Tier 3 **GH₵ 1,500.00**, the calculator shows:

Gross income:
GH₵ 14,000.00.

Employee SSNIT Tier 1:
GH₵ 660.00.

Voluntary Tier 3:
GH₵ 1,500.00.

Chargeable income:
GH₵ 11,840.00.

PAYE tax:
GH₵ 2,558.50.

Net take-home pay:
GH₵ 9,281.50.

## Tech Stack

Vite:
Build tool and development server.

React:
UI framework.

TypeScript:
Type safety.

Tailwind CSS:
Styling and design tokens.

Vitest:
Unit tests for PAYE calculation logic.

Vercel:
Production hosting.

## Run Locally

```bash
npm install
npm run dev
```

Common commands:

```bash
npm run test
npm run lint
npm run build
npm run preview
```

## Test Coverage

The calculation tests cover zero salary, income in the 0.0% band, a sanity-check salary, high salary reaching the 35.0% band, allowances, Tier 3 cap behavior, and negative input clamping.

## License

MIT
