import { useState, useEffect, useMemo } from 'react'
import { computePayroll, type PayrollResult } from './lib/paye'
import SalaryForm from './components/SalaryForm'
import ResultSummary from './components/ResultSummary'
import BandBreakdown from './components/BandBreakdown'

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
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('paye-theme') as 'dark' | 'light') ?? 'dark'
  )
  const [annual, setAnnual]         = useState(false)
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

  const tier3Cap = result ? Math.round(result.basic * 0.165 * 100) / 100 : 0

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-panel sticky top-0 z-10 border-b border-edge">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gold text-xs font-bold text-canvas select-none">
              GH
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight text-fore">Ghana PAYE Calculator</h1>
              <p className="text-[10px] text-fore-3">2026 GRA Tax Bands · Estimate only</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded border border-edge text-[10px] font-medium">
              <button
                onClick={() => setAnnual(false)}
                className={['px-3 py-1.5 transition-colors', !annual ? 'bg-gold text-canvas' : 'text-fore-3 hover:text-fore'].join(' ')}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={['px-3 py-1.5 transition-colors', annual ? 'bg-gold text-canvas' : 'text-fore-3 hover:text-fore'].join(' ')}
              >
                Annual
              </button>
            </div>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="flex h-7 w-7 items-center justify-center rounded border border-edge text-fore-3 transition-colors hover:border-gold/40 hover:text-gold focus:outline-none"
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <SalaryForm
            basicSalary={basicSalary}
            allowances={allowances}
            tier3={tier3}
            onBasicChange={setBasicSalary}
            onAllowancesChange={setAllowances}
            onTier3Change={setTier3}
            tier3Cap={tier3Cap}
            tier3Capped={result?.tier3Capped ?? false}
          />

          <div className="flex flex-col gap-5">
            <ResultSummary result={result} annual={annual} />
            {result && <BandBreakdown bands={result.bands} annual={annual} />}
          </div>
        </div>

        <div className="mt-6 rounded border border-gold/20 bg-gold/5 px-4 py-3">
          <p className="text-[11px] leading-relaxed text-fore-3">
            <span className="font-semibold text-gold">Estimate only.</span>{' '}
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
