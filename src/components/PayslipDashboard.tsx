import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { PayrollResult } from '../lib/paye'

interface Props {
  result: PayrollResult | null
  annual: boolean
}

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(amount: number, annual: boolean): string {
  const v = annual ? amount * 12 : amount
  return 'GH₵ ' + v.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtRaw(amount: number): string {
  return 'GH₵ ' + amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(percent: number): string {
  return `${percent.toFixed(1)}%`
}

function fmtRate(rate: number): string {
  return fmtPct(rate * 100)
}

function buildSummaryText(result: PayrollResult, annual: boolean): string {
  const f = (n: number) => fmt(n, annual)
  const period = annual ? 'Annual' : 'Monthly'
  const lines: string[] = [
    `Ghana PAYE Estimate — ${period}`,
    '─────────────────────────────────',
    `Basic Salary:       ${f(result.basic)}`,
  ]
  if (result.allowances > 0) lines.push(`Allowances:         ${f(result.allowances)}`)
  lines.push(`Gross Income:       ${f(result.gross)}`, '')
  lines.push(`SSNIT (Tier 1):    −${f(result.ssnit)}`)
  if (result.tier3 > 0) lines.push(`Tier 3 (Vol.):     −${f(result.tier3)}`)
  lines.push(
    `PAYE Tax:          −${f(result.paye)}`,
    `Total Deductions:  −${f(result.ssnit + result.paye + result.tier3)}`,
    '',
    `Net Take-Home:      ${f(result.netPay)}`,
    '─────────────────────────────────',
    `Effective Rate:     ${fmtPct((result.paye / result.gross) * 100)}`,
    '',
    'Estimate only · 2026 GRA bands · gra.gov.gh',
  )
  return lines.join('\n')
}

// ── Donut Chart ────────────────────────────────────────────────────────────

function DonutChart({ result }: { result: PayrollResult }) {
  const R = 50, CX = 64, CY = 64
  const C = 2 * Math.PI * R
  const { gross, netPay, ssnit, paye, tier3 } = result
  const deductions = ssnit + paye + tier3

  if (gross === 0) return (
    <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
    </svg>
  )

  const netPct = Math.min(netPay / gross, 1)
  const dedPct = Math.min(deductions / gross, 1)
  const gapFrac = 4 / 360
  const netArc  = Math.max(0, (netPct - gapFrac) * C)
  const dedArc  = Math.max(0, (dedPct - gapFrac) * C)

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
      {netArc > 0 && (
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F59E0B" strokeWidth="10"
          strokeDasharray={`${netArc} ${C}`}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px` }}
        />
      )}
      {dedArc > 0 && (
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#EF4444" strokeWidth="10"
          strokeDasharray={`${dedArc} ${C}`}
          style={{ transform: `rotate(${-90 + netPct * 360}deg)`, transformOrigin: `${CX}px ${CY}px` }}
        />
      )}
      <text x={CX} y={CY + 2} textAnchor="middle" fill="white"
        fontSize="23" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
        {fmtPct(netPct * 100)}
      </text>
      <text x={CX} y={CY + 18} textAnchor="middle" fill="rgba(255,255,255,0.62)"
        fontSize="8" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">of gross</text>
      <text x={CX} y={CY + 29} textAnchor="middle" fill="rgba(255,255,255,0.52)"
        fontSize="8" fontFamily="Inter, system-ui, sans-serif">take-home</text>
    </svg>
  )
}

// ── Hero Card ──────────────────────────────────────────────────────────────

function HeroCard({ result, annual }: { result: PayrollResult; annual: boolean }) {
  const deductions = result.ssnit + result.paye + result.tier3
  const period     = annual ? 'Annual' : 'Monthly'
  const netPct     = result.gross > 0 ? Math.min((result.netPay / result.gross) * 100, 100) : 0

  return (
    <div
      className="overflow-hidden rounded-xl p-6 shadow-xl shadow-copper/15"
      style={{ background: 'linear-gradient(135deg, #7C2D05 0%, #522006 48%, #2B1207 100%)' }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white/80">{period} take-home pay (net pay)</p>
          <p className="mt-3 text-4xl font-black leading-none tracking-normal text-white tabular-nums sm:text-5xl">
            {fmt(result.netPay, annual)}
          </p>
          <p className="mt-3 text-sm text-white/75">Amount you take home this {annual ? 'year' : 'month'}.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-white/70">
                <span>Net pay ratio</span>
                <span className="font-semibold text-white">{fmtPct(netPct)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-500"
                  style={{ width: `${netPct}%` }}
                />
              </div>
            </div>
            <div className="grid gap-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gold" />
                  Net Pay
                </span>
                <span className="font-semibold text-white tabular-nums">{fmt(result.netPay, annual)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="h-2.5 w-2.5 rounded-sm bg-orange-600" />
                  Total Deductions
                </span>
                <span className="font-semibold text-white tabular-nums">{fmt(deductions, annual)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  Gross Income
                </span>
                <span className="font-semibold text-white tabular-nums">{fmt(result.gross, annual)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <DonutChart result={result} />
          <div className="flex items-center gap-4 text-[9px] font-medium text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#F59E0B' }} />
              Net Pay
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
              Deductions
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Metric Grid ────────────────────────────────────────────────────────────

function MetricIcon({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
      style={{ color, backgroundColor: `${color}14`, borderColor: `${color}2e` }}
    >
      {children}
    </div>
  )
}

function MetricGrid({ result, annual }: { result: PayrollResult; annual: boolean }) {
  const deductions    = result.ssnit + result.paye + result.tier3
  const effectiveRate = result.gross > 0 ? fmtPct((result.paye / result.gross) * 100) : fmtPct(0)
  const dedRate       = result.gross > 0 ? fmtPct((deductions / result.gross) * 100) : fmtPct(0)

  const cards: { label: string; value: string; sub: string; color: string; icon: ReactNode }[] = [
    {
      label: 'Gross Income',
      value: fmt(result.gross, annual),
      sub:   result.allowances > 0 ? 'basic + allowances' : 'basic salary only',
      color: 'var(--color-ok)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 8.5h16v10A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5v-10z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M7 8.5V7a4 4 0 018 0v1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Taxable Income',
      value: fmt(result.chargeableIncome, annual),
      sub:   'after SSNIT' + (result.tier3 > 0 ? ' & Tier 3' : ''),
      color: 'var(--color-gold)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="6" rx="6" ry="3" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6 6v8c0 1.7 2.7 3 6 3s6-1.3 6-3V6" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6 10c0 1.7 2.7 3 6 3s6-1.3 6-3" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      ),
    },
    {
      label: 'PAYE Tax',
      value: fmt(result.paye, annual),
      sub:   `${effectiveRate} of gross`,
      color: 'var(--color-tax)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h7l4 4v14H7V3z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M14 3v5h4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9.5 13h5M9.5 17h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'SSNIT Tier 1',
      value: fmt(result.ssnit, annual),
      sub:   '5.5% of basic salary',
      color: 'var(--color-ssnit)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.2-2.8 7.8-7 10-4.2-2.2-7-5.8-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9.5 12l1.8 1.8 3.5-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Voluntary Tier 3',
      value: result.tier3 > 0 ? fmt(result.tier3, annual) : 'GH₵ 0.00',
      sub:   result.tier3 > 0 ? 'tax-deductible' : 'not contributing',
      color: result.tier3 > 0 ? 'var(--color-tier3)' : 'var(--color-fore-3)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Total Deductions',
      value: fmt(deductions, annual),
      sub:   `${dedRate} of gross`,
      color: 'var(--color-copper)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.5 8h7M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, value, sub, color, icon }) => (
        <div
          key={label}
          className="flex min-h-[112px] items-center gap-4 rounded-xl border border-edge bg-panel/90 p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <MetricIcon color={color}>{icon}</MetricIcon>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fore">{label}</p>
            <p className="mt-1 text-lg font-black tabular-nums text-fore">{value}</p>
            <p className="mt-1 text-xs leading-snug text-fore-3">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tax Band Breakdown ─────────────────────────────────────────────────────

function BandTable({ result, annual }: { result: PayrollResult; annual: boolean }) {
  const totalTax    = result.bands.reduce((s, b) => s + b.tax, 0)
  const activeBands = result.bands.filter(b => b.income > 0)

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel/92 shadow-sm">
      <div className="border-b border-edge px-4 py-4">
        <h3 className="text-base font-bold text-fore">Tax Breakdown</h3>
        <p className="mt-1 text-xs text-fore-3">PAYE bands applied to your taxable income.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-edge">
              <th className="px-4 py-3 text-left text-xs font-semibold text-fore-3">Band</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fore-3">Rate</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fore-3">Taxable amount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fore-3">Tax due</th>
            </tr>
          </thead>
          <tbody>
            {result.bands.map((band, i) => {
              const active = band.income > 0
              return (
                <tr key={i} className={['border-t border-edge/40 transition-colors', active ? 'hover:bg-raised/60' : 'opacity-45'].join(' ')}>
                  <td className="px-4 py-3">
                    <span className="text-xs text-fore-2">{band.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={[
                      'rounded-md px-2 py-1 text-xs font-bold tabular-nums',
                      band.rate === 0 ? 'bg-ok/10 text-ok' : active ? 'bg-tax/10 text-tax' : 'text-fore-3',
                    ].join(' ')}>
                      {fmtRate(band.rate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-fore-2">
                    {active ? fmt(band.income, annual) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold tabular-nums">
                    <span className={active && band.tax > 0 ? 'text-tax' : 'text-fore-3'}>
                      {active ? fmt(band.tax, annual) : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {activeBands.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-edge bg-raised/60">
                <td className="px-4 py-3 text-xs font-bold text-fore" colSpan={3}>Total PAYE tax</td>
                <td className="px-4 py-3 text-right text-sm font-black text-tax tabular-nums">{fmt(totalTax, annual)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// ── Contribution Summary ───────────────────────────────────────────────────

function ContributionTable({ result, annual }: { result: PayrollResult; annual: boolean }) {
  const employerSSNIT = Math.round(result.basic * 0.13 * 100) / 100
  const employeeDeductions = result.ssnit + result.paye + result.tier3

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel/92 shadow-sm">
      <div className="border-b border-edge px-4 py-4">
        <h3 className="text-base font-bold text-fore">Contribution Summary</h3>
        <p className="mt-1 text-xs text-fore-3">Employee and employer payroll deductions.</p>
      </div>
      <div className="divide-y divide-edge/40">
        {[
          { label: 'Employee SSNIT (5.5%)', value: fmt(result.ssnit, annual), color: 'var(--color-ssnit)' },
          { label: 'Employer SSNIT (13.0%)',  value: fmt(employerSSNIT, annual), color: 'var(--color-ssnit)' },
          ...(result.tier3 > 0 ? [{ label: 'Voluntary Tier 3', value: fmt(result.tier3, annual), color: 'var(--color-tier3)' }] : []),
          { label: 'PAYE tax', value: fmt(result.paye, annual), color: 'var(--color-tax)' },
          { label: 'Total employee deductions', value: fmt(employeeDeductions, annual), color: 'var(--color-copper)', bold: true },
        ].map(({ label, value, color, bold }) => (
          <div key={label} className="flex items-center justify-between gap-3 px-4 py-3">
            <p className={['text-sm', bold ? 'font-bold text-fore' : 'text-fore-2'].join(' ')}>{label}</p>
            <span className={['shrink-0 text-sm tabular-nums', bold ? 'font-black' : 'font-semibold'].join(' ')} style={{ color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Quick Facts ────────────────────────────────────────────────────────────

function QuickFacts({ result, annual }: { result: PayrollResult; annual: boolean }) {
  const netPct  = result.gross > 0 ? fmtPct((result.netPay / result.gross) * 100) : fmtPct(0)
  const effRate = result.gross > 0 ? fmtPct((result.paye  / result.gross) * 100) : fmtPct(0)
  const topBand = [...result.bands].reverse().find(b => b.income > 0)
  const employerSSNIT = Math.round(result.basic * 0.13 * 100) / 100

  const facts = [
    `You keep ${netPct} of gross income.`,
    `Effective PAYE rate: ${effRate} of gross.`,
    topBand && topBand.rate > 0
      ? `Top marginal band: ${fmtRate(topBand.rate)}.`
      : 'Income is in the 0.0% tax-free band.',
    !annual ? `Annual take-home: ${fmtRaw(result.netPay * 12)}.` : null,
    `Employer SSNIT: ${fmt(employerSSNIT, annual)} toward your pension.`,
  ].filter(Boolean) as string[]

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel/92 shadow-sm">
      <div className="border-b border-edge px-4 py-4">
        <h3 className="text-base font-bold text-fore">Quick Facts</h3>
        <p className="mt-1 text-xs text-fore-3">Useful assumptions from this estimate.</p>
      </div>
      <ul className="divide-y divide-edge/40">
        {facts.map((fact, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok/10 text-ok">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.2 6.2l2.3 2.3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="text-sm leading-relaxed text-fore-2">{fact}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-edge bg-panel/92 shadow-xl shadow-copper/5 backdrop-blur">
      <div className="border-b border-edge px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper text-white shadow-md shadow-copper/20">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7" y1="8"  x2="15" y2="8"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-fore">Monthly Payslip</h2>
            <p className="text-xs text-fore-3">PAYE, SSNIT, deductions, and take-home pay.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-copper/20 bg-copper-soft text-copper">
          <svg width="30" height="30" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <line x1="7" y1="8"  x2="15" y2="8"  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="7" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="7" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
      <div>
          <p className="text-lg font-bold text-fore">Enter your monthly basic salary</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-fore-3">
            Your PAYE, SSNIT, deductions, and take-home pay will appear here.
          </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {['PAYE Tax', 'SSNIT', 'Net Pay', 'Tax Bands', 'Contributions'].map(tag => (
            <span key={tag} className="rounded-full border border-edge bg-raised/80 px-3 py-1 text-xs font-semibold text-fore-3">
            {tag}
          </span>
        ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────

export default function PayslipDashboard({ result, annual }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!result) return
    const text = buildSummaryText(result, annual)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result, annual])

  if (!result) return <EmptyState />

  return (
    <>
      <section className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-edge bg-panel/92 p-5 shadow-xl shadow-copper/5 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper text-white shadow-md shadow-copper/20">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <rect x="4" y="2.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7h6M8 11h6M8 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-fore">{annual ? 'Annual' : 'Monthly'} Payslip</h2>
              <p className="text-xs text-fore-3">Calculated from your salary details.</p>
            </div>
          </div>

          <div className="no-print flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg border border-edge bg-panel px-3 py-2 text-xs font-semibold text-fore-2 shadow-sm transition-colors hover:border-copper/40 hover:text-copper"
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <rect x="1" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M3 3V2a1 1 0 011-1h6a1 1 0 011 1v7a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Copy summary
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-copper bg-copper px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-copper/20 transition-colors hover:bg-copper-dark"
            >
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3V1h6v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <rect x="1" y="3" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 9v2h6V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="9" cy="6" r="0.7" fill="currentColor" />
              </svg>
              Print payslip
            </button>
          </div>
        </div>

        <HeroCard result={result} annual={annual} />
        <MetricGrid result={result} annual={annual} />
      </section>

      <div className="grid gap-4 lg:col-span-2 xl:grid-cols-[minmax(620px,1.35fr)_minmax(280px,0.8fr)_minmax(280px,0.8fr)]">
        <BandTable result={result} annual={annual} />
        <ContributionTable result={result} annual={annual} />
        <QuickFacts result={result} annual={annual} />
      </div>
    </>
  )
}
