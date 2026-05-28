import { describe, it, expect } from 'vitest'
import { computeSSNIT, applyBands, computePayroll } from './paye'

// ─── helpers ────────────────────────────────────────────────────────────────

function totalTax(bands: ReturnType<typeof applyBands>) {
  return bands.reduce((s, b) => s + b.tax, 0)
}

// ─── computeSSNIT ────────────────────────────────────────────────────────────

describe('computeSSNIT', () => {
  it('is 5.5% of basic salary', () => {
    expect(computeSSNIT(5_000)).toBe(275)
    expect(computeSSNIT(3_000)).toBe(165)
    expect(computeSSNIT(0)).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    expect(computeSSNIT(1_000)).toBe(55)
    expect(computeSSNIT(181)).toBe(9.96) // 181 * 0.055 = 9.955 → 9.96
  })
})

// ─── applyBands ─────────────────────────────────────────────────────────────

describe('applyBands', () => {
  it('zero chargeable income produces all-zero bands', () => {
    const bands = applyBands(0)
    expect(totalTax(bands)).toBe(0)
    bands.forEach(b => expect(b.tax).toBe(0))
  })

  it('income entirely in the 0% band produces zero tax', () => {
    const bands = applyBands(490)
    expect(totalTax(bands)).toBe(0)
  })

  it('income spanning first three bands', () => {
    // 490 @ 0% + 110 @ 5% + 40 @ 10%
    const bands = applyBands(640)
    expect(bands[0].tax).toBe(0)
    expect(bands[1].tax).toBe(5.5)
    expect(bands[2].income).toBe(40)
    expect(bands[2].tax).toBe(4)
    expect(totalTax(bands)).toBe(9.5)
  })

  it('sanity-check: 4725 chargeable → PAYE 779.75', () => {
    // basic 5000, no allowances/tier3 → chargeable = 5000 - 275 = 4725
    const bands = applyBands(4_725)
    expect(totalTax(bands)).toBe(779.75)
  })

  it('pads missing bands with zero rows', () => {
    const bands = applyBands(300) // only 1 band needed
    expect(bands).toHaveLength(7) // still 7 rows
  })
})

// ─── computePayroll — spec sanity check ──────────────────────────────────────

describe('computePayroll — spec sanity check', () => {
  it('basic 5,000 | no allowances | no Tier 3', () => {
    const r = computePayroll({ basicSalary: 5_000 })
    expect(r.ssnit).toBe(275)
    expect(r.chargeableIncome).toBe(4_725)
    expect(r.paye).toBe(779.75)
    expect(r.netPay).toBe(3_945.25)
  })
})

// ─── computePayroll — edge cases ─────────────────────────────────────────────

describe('computePayroll — zero salary', () => {
  it('all outputs are zero', () => {
    const r = computePayroll({ basicSalary: 0 })
    expect(r.gross).toBe(0)
    expect(r.ssnit).toBe(0)
    expect(r.chargeableIncome).toBe(0)
    expect(r.paye).toBe(0)
    expect(r.netPay).toBe(0)
  })
})

describe('computePayroll — salary entirely in 0% band', () => {
  it('basic 490, no deductions beyond SSNIT → PAYE = 0', () => {
    const r = computePayroll({ basicSalary: 490 })
    expect(r.ssnit).toBe(26.95)           // 490 * 0.055
    expect(r.chargeableIncome).toBe(463.05)
    expect(r.paye).toBe(0)
    expect(r.netPay).toBe(463.05)
  })
})

describe('computePayroll — high salary reaching 35% band', () => {
  it('basic 60,000 → reaches top band', () => {
    const r = computePayroll({ basicSalary: 60_000 })
    expect(r.ssnit).toBe(3_300)
    expect(r.chargeableIncome).toBe(56_700)
    // Band totals: 0 + 5.50 + 13 + 554.17 + 4000 + 9156 + 2199.17
    expect(r.paye).toBe(15_927.84)
    expect(r.netPay).toBe(40_772.16)
    // Confirm the last band (35%) has income
    const topBand = r.bands[r.bands.length - 1]
    expect(topBand.income).toBeGreaterThan(0)
    expect(topBand.rate).toBe(0.35)
  })
})

describe('computePayroll — with allowances', () => {
  it('allowances increase gross and chargeable but SSNIT is on basic only', () => {
    const r = computePayroll({ basicSalary: 3_000, allowances: 1_000 })
    expect(r.gross).toBe(4_000)
    expect(r.ssnit).toBe(165)           // 3000 * 0.055 — NOT on allowances
    expect(r.chargeableIncome).toBe(3_835)
    expect(r.paye).toBe(561.88)
    expect(r.netPay).toBe(3_273.12)
  })
})

describe('computePayroll — with Tier 3', () => {
  it('Tier 3 reduces chargeable income and net pay', () => {
    const r = computePayroll({ basicSalary: 3_000, tier3: 200 })
    expect(r.tier3).toBe(200)
    expect(r.tier3Capped).toBe(false)
    expect(r.chargeableIncome).toBe(2_635) // 3000 - 165 - 200
    expect(r.paye).toBe(351.88)
    expect(r.netPay).toBe(2_283.12)
  })

  it('caps Tier 3 at 16.5% of basic', () => {
    // 16.5% of 5000 = 825; input 1000 → capped to 825
    const r = computePayroll({ basicSalary: 5_000, tier3: 1_000 })
    expect(r.tier3).toBe(825)
    expect(r.tier3Capped).toBe(true)
    expect(r.chargeableIncome).toBe(3_900) // 5000 - 275 - 825
  })
})

describe('computePayroll — negative / invalid inputs', () => {
  it('clamps negative inputs to zero', () => {
    const r = computePayroll({ basicSalary: -500, allowances: -100, tier3: -50 })
    expect(r.basic).toBe(0)
    expect(r.gross).toBe(0)
    expect(r.netPay).toBe(0)
  })
})
