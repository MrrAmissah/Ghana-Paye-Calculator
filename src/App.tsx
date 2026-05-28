import { useState, useEffect, useMemo } from 'react'
import { computePayroll, type PayrollResult } from './lib/paye'
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

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
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
    </div>
  )
}
