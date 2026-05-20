import type { SchemeReturns, PortfolioMonth } from '../../types';

interface Props {
  schemes: SchemeReturns[];
  portfolio: PortfolioMonth[];
}

function ReturnCell({ value, gainINR }: { value: number | null; gainINR?: number | null }) {
  if (value === null) return <td className="px-3 py-2 text-center text-slate-300 text-xs">—</td>;
  const intensity = Math.min(Math.abs(value) / 5, 1);
  const bg = value >= 0
    ? `rgba(16,185,129,${0.1 + intensity * 0.35})`
    : `rgba(239,68,68,${0.1 + intensity * 0.35})`;
  const color = value >= 0 ? '#065f46' : '#7f1d1d';
  return (
    <td
      className="px-3 py-2 text-center text-xs font-medium tabular-nums"
      style={{ backgroundColor: bg, color }}
    >
      <div>{value >= 0 ? '+' : ''}{value.toFixed(2)}%</div>
      {gainINR != null && (
        <div className="text-[10px] opacity-75 mt-0.5">
          {gainINR >= 0 ? '+' : '−'}₹{Math.round(Math.abs(gainINR)).toLocaleString('en-IN')}
        </div>
      )}
    </td>
  );
}

export function MonthlyTable({ schemes, portfolio }: Props) {
  const allMonths = portfolio.map(p => p.month);
  const portfolioByMonth = new Map(portfolio.map(p => [p.month, p]));
  const schemeByMonth = new Map(
    schemes.map(s => [s.schemeCode, new Map(s.monthlyNavs.map(n => [n.month, n]))])
  );

  const hasSIP = schemes.some(s => s.sipAmount > 0);

  // Total portfolio value per month = sum of all schemes' fundValueToDate
  const totalValueByMonth = new Map<string, number>();
  if (hasSIP) {
    for (const month of allMonths) {
      let total = 0;
      let anySchemeHasData = false;
      for (const s of schemes) {
        if (s.sipAmount <= 0) continue;
        const n = schemeByMonth.get(s.schemeCode)?.get(month);
        if (n) { total += n.fundValueToDate; anySchemeHasData = true; }
      }
      if (anySchemeHasData) totalValueByMonth.set(month, total);
    }
  }

  if (allMonths.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold text-slate-800 mb-1">Monthly Returns</h2>
      <p className="text-xs text-slate-400 mb-4">
        Month-over-month % change in NAV{hasSIP ? ' · ₹ shows market gain on units held' : ''}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 sticky left-0 bg-white">Month</th>
              {schemes.map(s => (
                <th key={s.schemeCode} className="px-3 py-2.5 text-center text-xs font-semibold" style={{ color: s.color }}>
                  {s.schemeName.split(' ').slice(0, 4).join(' ')}&hellip;
                </th>
              ))}
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-indigo-600">Portfolio</th>
              {hasSIP && <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">Total Value</th>}
            </tr>
          </thead>
          <tbody>
            {allMonths.map(month => {
              const p = portfolioByMonth.get(month);
              const totalValue = totalValueByMonth.get(month);
              return (
                <tr key={month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium text-slate-600 sticky left-0 bg-white whitespace-nowrap">
                    {p?.label ?? month}
                  </td>
                  {schemes.map(s => {
                    const n = schemeByMonth.get(s.schemeCode)?.get(month);
                    return (
                      <ReturnCell
                        key={s.schemeCode}
                        value={n?.monthlyReturn ?? null}
                        gainINR={s.sipAmount > 0 ? (n?.marketGainINR ?? null) : undefined}
                      />
                    );
                  })}
                  <ReturnCell value={p?.monthlyReturn ?? null} />
                  {hasSIP && (
                    <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-slate-700 whitespace-nowrap">
                      {totalValue != null ? `₹${Math.round(totalValue).toLocaleString('en-IN')}` : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
