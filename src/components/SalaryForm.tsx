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
  id,
  label,
  hint,
  value,
  onChange,
  warning,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  warning?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-fore-3">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-[10px] text-fore-3">{hint}</p>}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-fore-3">
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
            'w-full rounded border bg-raised py-3 pl-12 pr-3 font-mono text-sm text-fore',
            'placeholder-fore-3 outline-none transition-colors focus:ring-1',
            warning
              ? 'border-deduct/60 focus:border-deduct/70 focus:ring-deduct/20'
              : 'border-edge-hi focus:border-gold/60 focus:ring-gold/20',
          ].join(' ')}
        />
      </div>
      {warning && (
        <p className="mt-1 text-[10px] text-deduct">{warning}</p>
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
    <div className="overflow-hidden rounded border border-edge bg-panel">
      <div className="border-b border-black/10 bg-gold px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-canvas">
          Salary Details
        </span>
      </div>

      <div className="flex flex-col gap-5 p-4">
        <Field
          id="basic-salary"
          label="Monthly Basic Salary"
          value={basicSalary}
          onChange={onBasicChange}
        />
        <Field
          id="allowances"
          label="Monthly Allowances"
          hint="Optional — transport, housing, etc."
          value={allowances}
          onChange={onAllowancesChange}
        />
        <Field
          id="tier3"
          label="Voluntary Tier 3 Contribution"
          hint={`Optional — tax-deductible, capped at 16.5% of basic${tier3Cap > 0 ? ` (GH₵ ${tier3Cap.toLocaleString('en-GH', { minimumFractionDigits: 2 })})` : ''}`}
          value={tier3}
          onChange={onTier3Change}
          warning={tier3Capped ? `Capped at GH₵ ${tier3Cap.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (16.5% of basic)` : undefined}
        />

        <div className="rounded border border-edge bg-raised px-3 py-2.5 text-[10px] text-fore-3 leading-relaxed">
          <span className="font-semibold text-gold">SSNIT (Tier 1)</span> — 5.5% of basic salary is deducted automatically. Employer contributes 13%; combined goes to SSNIT.
        </div>
      </div>
    </div>
  )
}
