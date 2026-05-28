interface Props {
  basicSalary: string
  allowances: string
  tier3: string
  onBasicChange: (v: string) => void
  onAllowancesChange: (v: string) => void
  onTier3Change: (v: string) => void
  tier3Cap: number
  tier3Capped: boolean
}

function Field({
  number,
  id,
  label,
  hint,
  value,
  onChange,
  warning,
  optional = false,
}: {
  number: number
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  warning?: string
  optional?: boolean
}) {
  return (
    <div className="rounded-xl border border-edge/70 bg-panel/70 p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-copper/10 text-xs font-bold text-copper">
          {number}
        </span>
        <label htmlFor={id} className="text-sm font-semibold text-fore">
          {label}
          {optional && <span className="ml-2 text-xs font-medium text-fore-3">optional</span>}
        </label>
      </div>
      {hint && <p className="mb-2 pl-8 text-xs leading-relaxed text-fore-3">{hint}</p>}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-fore-2">
          GH₵
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0.00"
          className={[
            'w-full rounded-lg border py-3.5 pl-16 pr-4 text-lg font-semibold tabular-nums text-fore',
            'placeholder:text-fore-3 bg-panel outline-none transition-all shadow-sm',
            'focus:ring-2',
            warning
              ? 'border-tax/50 focus:border-tax/60 focus:ring-tax/15'
              : 'border-edge-hi focus:border-copper/50 focus:ring-copper/15',
          ].join(' ')}
        />
      </div>
      {warning && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-tax">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1L13 12H1L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="7" cy="10.5" r="0.7" fill="currentColor" />
          </svg>
          {warning}
        </p>
      )}
    </div>
  )
}

export default function SalaryForm({
  basicSalary,
  allowances,
  tier3,
  onBasicChange,
  onAllowancesChange,
  onTier3Change,
  tier3Cap,
  tier3Capped,
}: Props) {
  return (
    <div className="no-print overflow-hidden rounded-2xl border border-edge bg-panel/92 shadow-xl shadow-copper/5 backdrop-blur">
      <div className="border-b border-edge px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-copper/25 bg-copper-soft text-copper">
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="4" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="4" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="4" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-fore">Salary Details</h2>
            <p className="text-xs text-fore-3">Enter monthly payroll figures before PAYE.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <Field
          number={1}
          id="basic-salary"
          label="Monthly Basic Salary"
          hint="Your fixed monthly salary before deductions."
          value={basicSalary}
          onChange={onBasicChange}
        />
        <Field
          number={2}
          id="allowances"
          label="Monthly Allowances"
          hint="Transport, housing, and other allowances"
          value={allowances}
          onChange={onAllowancesChange}
          optional
        />
        <Field
          number={3}
          id="tier3"
          label="Voluntary Tier 3 Contribution"
          hint={
            tier3Cap > 0
              ? `Tax-deductible · cap GH₵ ${tier3Cap.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
              : 'Tax-deductible · capped at 16.5% of basic'
          }
          value={tier3}
          onChange={onTier3Change}
          warning={
            tier3Capped
              ? `Capped at GH₵ ${tier3Cap.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (16.5% of basic)`
              : undefined
          }
          optional
        />
      </div>

      <div className="mx-5 mb-5 rounded-xl border border-copper/20 bg-copper-soft/70 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <line x1="5" y1="4.5" x2="5" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="5" cy="3" r="0.5" fill="currentColor" />
            </svg>
          </div>
          <p className="text-xs leading-relaxed text-fore-3">
            <span className="font-semibold text-copper">SSNIT Tier 1</span> — 5.5% of your basic
            salary is deducted automatically. Your employer contributes an additional 13.0%.
          </p>
        </div>
      </div>
    </div>
  )
}
