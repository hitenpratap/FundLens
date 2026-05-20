import { useTheme } from '../../theme/ThemeContext';
import type { SchemeReturns, PortfolioMonth } from '../../types';

interface Props {
  schemes: SchemeReturns[];
  portfolio: PortfolioMonth[];
}

function ReturnCell({
  value,
  gainINR,
  theme,
}: { value: number | null; gainINR?: number | null; theme: 'dark' | 'light' }) {
  if (value === null) return <td className="px-3 py-2 text-center text-ink-muted text-xs font-mono">—</td>;
  const intensity = Math.min(Math.abs(value) / 5, 1);
  const positive = value >= 0;
  const baseAlpha = theme === 'dark' ? 0.08 : 0.06;
  const peakAlpha = theme === 'dark' ? 0.32 : 0.22;
  const alpha = baseAlpha + intensity * (peakAlpha - baseAlpha);
  const rgb = positive ? '0, 229, 153' : '255, 77, 109';
  const textColor = positive ? 'var(--positive)' : 'var(--negative)';
  return (
    <td
      className="px-3 py-2 text-center text-[11px] font-mono tnum"
      style={{ background: `rgba(${rgb}, ${alpha})`, color: textColor }}
    >
      <div className="font-semibold">{positive ? '+' : ''}{value.toFixed(2)}%</div>
      {gainINR != null && (
        <div className="text-[10px] opacity-70 mt-0.5">
          {gainINR >= 0 ? '+' : '−'}₹{Math.round(Math.abs(gainINR)).toLocaleString('en-IN')}
        </div>
      )}
    </td>
  );
}

export function MonthlyTable({ schemes, portfolio }: Props) {
  const { theme } = useTheme();
  const allMonths = portfolio.map(p => p.month);
  const portfolioByMonth = new Map(portfolio.map(p => [p.month, p]));
  const schemeByMonth = new Map(
    schemes.map(s => [s.schemeCode, new Map(s.monthlyNavs.map(n => [n.month, n]))])
  );

  const hasSIP = schemes.some(s => s.sipAmount > 0);

  const totalValueByMonth = new Map<string, number>();
  if (hasSIP) {
    for (const month of allMonths) {
      let total = 0;
      let anyData = false;
      for (const s of schemes) {
        if (s.sipAmount <= 0) continue;
        const n = schemeByMonth.get(s.schemeCode)?.get(month);
        if (n) { total += n.fundValueToDate; anyData = true; }
      }
      if (anyData) totalValueByMonth.set(month, total);
    }
  }

  if (allMonths.length === 0) return null;

  return (
    <div className="card p-5 lg:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink tracking-tight">Monthly heatmap</h2>
        <p className="text-xs text-ink-muted mt-0.5 font-mono">
          MoM % change · {allMonths.length} months
          {hasSIP ? ' · ₹ shows market gain on existing units' : ''}
        </p>
      </div>

      <div className="overflow-x-auto -mx-5 lg:-mx-6 px-5 lg:px-6">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-ink-muted sticky left-0 z-10" style={{ background: 'var(--surface)' }}>
                Month
              </th>
              {schemes.map(s => (
                <th key={s.schemeCode} className="px-3 py-2.5 text-center text-[10px] font-mono uppercase tracking-wider whitespace-nowrap" style={{ color: s.color }}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    {s.schemeName.split(' ').slice(0, 3).join(' ')}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2.5 text-center text-[10px] font-mono uppercase tracking-wider text-accent">
                Portfolio
              </th>
              {hasSIP && (
                <th className="px-3 py-2.5 text-right text-[10px] font-mono uppercase tracking-wider text-ink-muted whitespace-nowrap">
                  Total value
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {allMonths.map(month => {
              const p = portfolioByMonth.get(month);
              const totalValue = totalValueByMonth.get(month);
              return (
                <tr key={month} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-surface-2 transition-colors">
                  <td
                    className="px-3 py-2 text-[11px] font-mono text-ink-secondary sticky left-0 z-10 whitespace-nowrap"
                    style={{ background: 'var(--surface)' }}
                  >
                    {p?.label ?? month}
                  </td>
                  {schemes.map(s => {
                    const n = schemeByMonth.get(s.schemeCode)?.get(month);
                    return (
                      <ReturnCell
                        key={s.schemeCode}
                        value={n?.monthlyReturn ?? null}
                        gainINR={s.sipAmount > 0 ? (n?.marketGainINR ?? null) : undefined}
                        theme={theme}
                      />
                    );
                  })}
                  <ReturnCell value={p?.monthlyReturn ?? null} theme={theme} />
                  {hasSIP && (
                    <td className="px-3 py-2 text-right text-[11px] font-mono font-semibold tnum text-ink whitespace-nowrap">
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
