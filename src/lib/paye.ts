// Ghana PAYE calculation - 2026 GRA rates
// Source: Ghana Revenue Authority (GRA)

export interface Band {
  limit: number  // monthly GHS; Infinity for the top band
  rate: number   // decimal, e.g. 0.175 = 17.5%
  label: string  // human-readable range for UI
}

// 2026 GRA monthly income tax bands.
// Update ONLY this array when GRA revises the bands.
export const MONTHLY_BANDS: Band[] = [
  { limit:       490.00, rate: 0.000, label: 'First GH₵ 490.00'        },
  { limit:       110.00, rate: 0.050, label: 'Next GH₵ 110.00'         },
  { limit:       130.00, rate: 0.100, label: 'Next GH₵ 130.00'         },
  { limit:     3_166.67, rate: 0.175, label: 'Next GH₵ 3,166.67'       },
  { limit:    16_000.00, rate: 0.250, label: 'Next GH₵ 16,000.00'      },
  { limit:    30_520.00, rate: 0.300, label: 'Next GH₵ 30,520.00'      },
  { limit:      Infinity, rate: 0.350, label: 'Above GH₵ 50,416.67'    },
]

export const SSNIT_RATE   = 0.055   // 5.5% of basic salary (Tier 1, employee share)
export const TIER3_CAP    = 0.165   // 16.5% of basic - voluntary Tier 3 cap

export interface BandResult {
  label: string
  rate: number
  income: number  // portion of chargeable income falling in this band
  tax: number     // tax charged for this band
}

export interface PayrollInputs {
  basicSalary: number
  allowances?: number
  tier3?: number  // voluntary; capped at 16.5% of basic
}

export interface PayrollResult {
  basic: number
  allowances: number
  tier3: number          // actual applied value (capped)
  tier3Capped: boolean   // true if input was above the 16.5% cap
  gross: number
  ssnit: number          // 5.5% of basic
  chargeableIncome: number
  paye: number
  netPay: number
  bands: BandResult[]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function computeSSNIT(basicSalary: number): number {
  return round2(basicSalary * SSNIT_RATE)
}

export function applyBands(chargeableIncome: number, bands: Band[] = MONTHLY_BANDS): BandResult[] {
  const results: BandResult[] = []
  let remaining = Math.max(0, chargeableIncome)

  for (const band of bands) {
    const inBand = band.limit === Infinity
      ? remaining
      : Math.min(remaining, band.limit)
    const income = round2(inBand)
    const tax    = round2(income * band.rate)
    results.push({ label: band.label, rate: band.rate, income, tax })
    remaining = round2(remaining - inBand)
    if (remaining <= 0) break
  }

  // Pad remaining bands with zero rows so the UI always shows all bands
  const shown = results.length
  for (let i = shown; i < bands.length; i++) {
    results.push({ label: bands[i].label, rate: bands[i].rate, income: 0, tax: 0 })
  }

  return results
}

export function computePayroll(inputs: PayrollInputs): PayrollResult {
  const basic      = round2(Math.max(0, inputs.basicSalary))
  const allowances = round2(Math.max(0, inputs.allowances ?? 0))
  const tier3Input = round2(Math.max(0, inputs.tier3 ?? 0))

  const tier3Cap   = round2(basic * TIER3_CAP)
  const tier3      = Math.min(tier3Input, tier3Cap)
  const tier3Capped = tier3Input > tier3Cap

  const gross            = round2(basic + allowances)
  const ssnit            = computeSSNIT(basic)
  const chargeableIncome = round2(Math.max(0, gross - ssnit - tier3))

  const bands  = applyBands(chargeableIncome)
  const paye   = round2(bands.reduce((sum, b) => sum + b.tax, 0))
  const netPay = round2(gross - ssnit - paye - tier3)

  return {
    basic,
    allowances,
    tier3,
    tier3Capped,
    gross,
    ssnit,
    chargeableIncome,
    paye,
    netPay,
    bands,
  }
}
