import { useState, useEffect, useMemo } from 'react'
import { computePayroll, type PayrollResult, MONTHLY_BANDS } from './lib/paye'
import SalaryForm from './components/SalaryForm'
import PayslipDashboard from './components/PayslipDashboard'

function GhanaMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 6v36M6 24h36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M16 16c0-5.6 8-5.6 8 0 0 5.3-8 5.3-8 0Zm8 0c0-5.6 8-5.6 8 0 0 5.3-8 5.3-8 0ZM16 32c0-5.3 8-5.3 8 0 0 5.6-8 5.6-8 0Zm8 0c0-5.3 8-5.3 8 0 0 5.6-8 5.6-8 0Z" stroke="currentColor" strokeWidth="3.4" />
      <path d="M16 24c-5.3 0-5.3-8 0-8M32 24c5.3 0 5.3 8 0 8M24 16c0-5.3 8-5.3 8 0M24 32c0 5.3-8 5.3-8 0" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3.4" fill="currentColor" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2.93" y1="2.93" x2="4.34" y2="4.34" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11.66" y1="11.66" x2="13.07" y2="13.07" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2.93" y1="13.07" x2="4.34" y2="11.66" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11.66" y1="4.34" x2="13.07" y2="2.93" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AboutModal({ onClose }: { onClose: () => void }) {
  const fmt = (n: number) =>
    n === Infinity ? '∞' : n.toLocaleString('en-GH', { minimumFractionDigits: 2 })

  const cumulativeThreshold = MONTHLY_BANDS.reduce<number[]>((acc, b, i) => {
    if (i === 0) return [b.limit]
    const prev = acc[i - 1]
    return [...acc, b.limit === Infinity ? Infinity : prev + b.limit]
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-fore/40 backdrop-blur-sm" />
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-edge bg-panel shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-edge bg-panel px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-copper text-white shadow-md shadow-copper/20">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <line x1="8" y1="7" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="8" cy="4.8" r="0.8" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-fore">About this Calculator</h2>
              <p className="text-xs text-fore-3">Ghana PAYE · 2026 GRA Tax Bands</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-edge text-fore-3 transition-colors hover:border-copper/40 hover:text-copper"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* What it does */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-fore">What This Calculator Does</h3>
            <p className="text-sm leading-relaxed text-fore-2">
              Estimates your monthly net pay and PAYE (Pay As You Earn) income tax based on the{' '}
              <span className="font-semibold text-copper">2026 Ghana Revenue Authority (GRA)</span>{' '}
              tax bands. It accounts for SSNIT Tier 1 deductions and optional voluntary Tier 3
              contributions, providing a detailed breakdown of your payslip.
            </p>
          </div>

          {/* How it calculates */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-fore">Calculation Method</h3>
            <ol className="flex flex-col gap-2">
              {[
                ['SSNIT Tier 1', '5.5% of basic salary is deducted as your employee contribution.'],
                ['Gross Income', 'Basic salary + all allowances.'],
                ['Chargeable Income', 'Gross income − SSNIT − Tier 3 (voluntary, capped at 16.5% of basic).'],
                ['PAYE Tax', 'Progressive rates applied to chargeable income using the 2026 GRA bands below.'],
                ['Net Pay', 'Gross income − SSNIT − PAYE − Tier 3.'],
              ].map(([step, desc], i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-copper/10 text-xs font-bold text-copper">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-fore-2">
                    <span className="font-semibold text-fore">{step}</span> — {desc}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tax band table */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-fore">2026 GRA Monthly Income Tax Bands</h3>
            <div className="overflow-hidden rounded-xl border border-edge">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge bg-raised">
                    <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-fore-3">Band</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-fore-3">Rate</th>
                    <th className="py-2.5 pl-3 pr-4 text-right text-xs font-semibold text-fore-3">Up to (cumulative)</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_BANDS.map((band, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-panel' : 'bg-raised/50'}>
                      <td className="py-2.5 pl-4 pr-3 font-medium text-fore">{band.label}</td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-copper">
                        {(band.rate * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 pl-3 pr-4 text-right tabular-nums text-fore-2">
                        {cumulativeThreshold[i] === Infinity
                          ? 'Unlimited'
                          : `GH₵ ${fmt(cumulativeThreshold[i])}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Limitations */}
          <div className="rounded-xl border border-copper/20 bg-copper-soft/70 px-4 py-3">
            <p className="text-xs font-semibold text-copper mb-1">Limitations</p>
            <p className="text-xs leading-relaxed text-fore-3">
              This tool does not account for overtime pay, bonuses, back-pay, or other non-standard
              payroll items. Always confirm calculations with the{' '}
              <span className="text-fore-2">Ghana Revenue Authority (GRA)</span> or a licensed tax
              professional before making financial decisions.
            </p>
          </div>

          {/* Credits */}
          <div className="flex items-center justify-between border-t border-edge pt-4">
            <div>
              <p className="text-xs font-semibold text-fore">Ghana PAYE Calculator</p>
              <p className="text-xs text-fore-3">Data source: Ghana Revenue Authority · 2026 tax year</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-fore-3">Built by</p>
              <p className="text-xs font-semibold text-copper">MrrAmissah</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [showAbout, setShowAbout]     = useState(false)
  const [annual, setAnnual]           = useState(false)
  const [basicSalary, setBasicSalary] = useState('')
  const [allowances, setAllowances]   = useState('')
  const [tier3, setTier3]             = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('paye-theme', theme)
  }, [theme])

  const result: PayrollResult | null = useMemo(() => {
    const basic = parseFloat(basicSalary)
    if (!basicSalary || isNaN(basic) || basic < 0) return null
    return computePayroll({
      basicSalary: basic,
      allowances:  parseFloat(allowances) || 0,
      tier3:       parseFloat(tier3)      || 0,
    })
  }, [basicSalary, allowances, tier3])

  const tier3Cap     = result ? Math.round(result.basic * 0.165 * 100) / 100 : 0
  const tier3Capped  = result?.tier3Capped ?? false

  return (
    <div className="min-h-screen bg-canvas/55">
      <header className="sticky top-0 z-10 border-b border-edge/80 bg-panel/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper text-white select-none shadow-md shadow-copper/20 ring-1 ring-white/30">
              <GhanaMark className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-fore">Ghana PAYE Calculator</h1>
              <p className="text-xs text-fore-3">2026 GRA tax bands · Estimate only</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <div className="flex overflow-hidden rounded-lg border border-edge bg-panel text-xs font-semibold shadow-sm">
              <button
                onClick={() => setAnnual(false)}
                className={['px-4 py-2 transition-colors', !annual ? 'bg-copper text-white shadow-sm' : 'text-fore-2 hover:text-fore'].join(' ')}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={['px-4 py-2 transition-colors', annual ? 'bg-copper text-white shadow-sm' : 'text-fore-2 hover:text-fore'].join(' ')}
              >
                Annual
              </button>
            </div>
            <button
              onClick={() => setShowAbout(true)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-edge bg-panel px-3.5 text-xs font-semibold text-fore-3 shadow-sm transition-colors hover:border-copper/40 hover:text-copper focus:outline-none"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="6" y1="5.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6" cy="3.5" r="0.6" fill="currentColor" />
              </svg>
              About
            </button>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-panel text-fore-3 shadow-sm transition-colors hover:border-copper/40 hover:text-copper focus:outline-none"
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
          <SalaryForm
            basicSalary={basicSalary}
            allowances={allowances}
            tier3={tier3}
            onBasicChange={setBasicSalary}
            onAllowancesChange={setAllowances}
            onTier3Change={setTier3}
            tier3Cap={tier3Cap}
            tier3Capped={tier3Capped}
          />
          <PayslipDashboard result={result} annual={annual} />
        </div>

        <div className="mt-6 rounded-xl border border-copper/20 bg-copper-soft/90 px-5 py-4 shadow-sm backdrop-blur">
          <p className="text-xs leading-relaxed text-fore-3">
            <span className="font-semibold text-copper">Estimate only.</span>{' '}
            Based on 2026 GRA monthly income tax bands and the 5.5% SSNIT employee Tier 1 rate.
            Does not account for overtime, bonuses, back-pay, or other non-standard payroll items.
            Always confirm with the <span className="text-fore-2">Ghana Revenue Authority (GRA)</span> or a licensed tax professional.
            Data source: GRA.
          </p>
        </div>
      </main>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  )
}
