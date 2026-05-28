import type { PayrollResult } from '../lib/paye'

interface Props {
  result: PayrollResult | null
  annual: boolean
}

function fmt(amount: number, annual: boolean) {
  const v = annual ? amount * 12 : amount
  return 'GH₵ ' + v.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Row({
  label,
  value,
  sub = false,
  color,
  bold = false,
  separator = false,
}: {
  label: string
  value: string
  sub?: boolean
  color?: string
  bold?: boolean
  separator?: boolean
}) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-4 px-4 py-2',
        separator ? 'border-t border-edge' : 'border-t border-edge/40',
        'first:border-0',
      ].join(' ')}
    >
      <span className={['text-xs', sub ? 'pl-2 text-fore-3' : 'text-fore-2', bold ? 'font-semibold text-fore' : ''].join(' ')}>
        {label}
      </span>
      <span className={['font-mono text-sm tabular-nums', color ?? 'text-fore', bold ? 'font-bold' : ''].join(' ')}>
        {value}
      </span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded border border-edge bg-raised">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-fore-3">
          <rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="5" y1="10" x2="9" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-fore-2">No results yet</p>
        <p className="mt-0.5 text-xs text-fore-3">Enter a salary to calculate</p>
      </div>
    </div>
  )
}

export default function ResultSummary({ result, annual }: Props) {
  return (
    <div className="overflow-hidden rounded border border-edge bg-panel">
      <div className="flex items-center justify-between border-b border-black/10 bg-gold px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-canvas">
          {annual ? 'Annual' : 'Monthly'} Payslip
        </span>
        {result && (
          <span className="rounded border border-black/15 bg-black/15 px-2 py-0.5 font-mono text-xs font-medium text-canvas">
            Net {fmt(result.netPay, annual)}
          </span>
        )}
      </div>

      {!result ? <EmptyState /> : (
        <div className="py-1">
          {/* Income */}
          <Row label="Basic Salary"     value={fmt(result.basic, annual)} />
          {result.allowances > 0 && (
            <Row label="Allowances"     value={fmt(result.allowances, annual)} sub />
          )}
          <Row
            label="Gross Income"
            value={fmt(result.gross, annual)}
            bold
            separator
          />

          {/* Deductions */}
          <div className="mt-1 px-4 pb-0.5 pt-2">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-fore-3">Deductions</span>
          </div>
          <Row label="SSNIT - Tier 1 (5.5% of basic)" value={`- ${fmt(result.ssnit, annual)}`} color="text-deduct" sub />
          {result.tier3 > 0 && (
            <Row label="Voluntary Tier 3" value={`- ${fmt(result.tier3, annual)}`} color="text-tier3" sub />
          )}
          <Row label="PAYE" value={`- ${fmt(result.paye, annual)}`} color="text-paye" sub />
          <Row
            label="Total Deductions"
            value={`- ${fmt(result.ssnit + result.paye + result.tier3, annual)}`}
            color="text-deduct"
            bold
            separator
          />

          {/* Net */}
          <div className="mx-4 mt-2 mb-1 rounded border border-ok/25 bg-ok/8 px-3 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-ok">Net Take-Home</span>
              <span className="font-mono text-base font-bold tabular-nums text-ok">
                {fmt(result.netPay, annual)}
              </span>
            </div>
            {!annual && (
              <p className="mt-0.5 font-mono text-[10px] text-ok/70">
                Annual: {fmt(result.netPay, true)}
              </p>
            )}
          </div>

          {/* Effective rate */}
          {result.gross > 0 && (
            <div className="border-t border-edge/40 px-4 py-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-fore-3">Effective tax rate (PAYE / gross)</span>
                <span className="font-mono font-medium text-fore-2">
                  {((result.paye / result.gross) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-paye transition-all"
                  style={{ width: `${Math.min((result.paye / result.gross) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
