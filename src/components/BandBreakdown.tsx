import type { BandResult } from '../lib/paye'

interface Props {
  bands: BandResult[]
  annual: boolean
}

function fmt(amount: number, annual: boolean) {
  const v = annual ? amount * 12 : amount
  return 'GH₵ ' + v.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BandBreakdown({ bands, annual }: Props) {
  const activeBands = bands.filter(b => b.income > 0)
  const totalIncome = bands.reduce((s, b) => s + b.income, 0)
  const totalTax    = bands.reduce((s, b) => s + b.tax,    0)

  return (
    <div className="overflow-hidden rounded border border-edge bg-panel">
      <div className="border-b border-black/10 bg-paye px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-canvas">
          Tax Band Breakdown
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-edge">
              <th className="px-4 py-2 text-left text-[9px] font-semibold uppercase tracking-widest text-fore-3">Band</th>
              <th className="px-4 py-2 text-right text-[9px] font-semibold uppercase tracking-widest text-fore-3">Rate</th>
              <th className="px-4 py-2 text-right text-[9px] font-semibold uppercase tracking-widest text-fore-3">Income in Band</th>
              <th className="px-4 py-2 text-right text-[9px] font-semibold uppercase tracking-widest text-fore-3">Tax</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((band, i) => {
              const active = band.income > 0
              return (
                <tr
                  key={i}
                  className={[
                    'border-t border-edge/50 transition-colors',
                    active ? 'hover:bg-raised' : 'opacity-40',
                  ].join(' ')}
                >
                  <td className="px-4 py-2.5">
                    <span className={['font-mono text-xs', active ? 'text-fore-2' : 'text-fore-3'].join(' ')}>
                      {band.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={[
                      'rounded px-1.5 py-0.5 font-mono text-[10px] font-medium',
                      band.rate === 0
                        ? 'bg-ok/10 text-ok'
                        : active
                          ? 'bg-paye/10 text-paye'
                          : 'text-fore-3',
                    ].join(' ')}>
                      {(band.rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-fore-2 tabular-nums">
                    {active ? fmt(band.income, annual) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    <span className={active && band.tax > 0 ? 'text-paye' : 'text-fore-3'}>
                      {active ? fmt(band.tax, annual) : '-'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {activeBands.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-edge bg-raised">
                <td colSpan={2} className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-fore-3">
                  Total
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-fore tabular-nums">
                  {fmt(totalIncome, annual)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-paye tabular-nums">
                  {fmt(totalTax, annual)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
