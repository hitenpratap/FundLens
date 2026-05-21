import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SchemeReturns, PortfolioMonth } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  schemes: SchemeReturns[];
  portfolio: PortfolioMonth[];
}

interface ChartPoint {
  label: string;
  portfolio: number;
  [key: string]: number | string;
}

export function PortfolioChart({ schemes, portfolio }: Props) {
  const { theme } = useTheme();
  const [showSchemes, setShowSchemes] = useState(true);

  const data = useMemo(() => {
    const monthMap = new Map<string, ChartPoint>();
    for (const p of portfolio) {
      monthMap.set(p.month, {
        label: p.label,
        portfolio: parseFloat(p.portfolioValue.toFixed(2)),
      });
    }
    for (const s of schemes) {
      for (const n of s.monthlyNavs) {
        const existing = monthMap.get(n.month);
        if (existing) {
          existing[`scheme_${s.schemeCode}`] = parseFloat(n.normalizedValue.toFixed(2));
        }
      }
    }
    return Array.from(monthMap.values());
  }, [schemes, portfolio]);

  const accent = theme === 'dark' ? '#00E599' : '#00A36C';
  const last = portfolio[portfolio.length - 1];
  const first = portfolio[0];
  const delta = last && first ? ((last.portfolioValue - first.portfolioValue) / first.portfolioValue) * 100 : 0;

  return (
    <div className="card p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-base font-semibold text-ink tracking-tight">Portfolio growth</h2>
          <p className="text-xs text-ink-muted mt-0.5 font-mono">
            Normalized to ₹100 · {data.length} months · {delta >= 0 ? '+' : ''}{delta.toFixed(2)}%
          </p>
        </div>
        <button
          onClick={() => setShowSchemes(s => !s)}
          className="text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors"
          style={{
            background: showSchemes ? 'var(--accent-soft)' : 'var(--surface-2)',
            color: showSchemes ? 'var(--accent)' : 'var(--ink-tertiary)',
            border: '1px solid ' + (showSchemes ? 'var(--accent-soft)' : 'var(--border)'),
          }}
        >
          {showSchemes ? '✓ ' : ''}Schemes
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.32} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
            {schemes.map(s => (
              <linearGradient key={s.schemeCode} id={`grad_${s.schemeCode}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval={Math.max(1, Math.floor(data.length / 8))}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}`}
            domain={['auto', 'auto']}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.4, strokeDasharray: '3 3' }}
            formatter={(value: unknown, name: unknown) => {
              const key = String(name ?? '');
              const label =
                key === 'portfolio'
                  ? 'Portfolio'
                  : schemes.find(s => `scheme_${s.schemeCode}` === key)?.schemeName.slice(0, 30) ?? key;
              return [Number(value ?? 0).toFixed(2), label];
            }}
          />
          {showSchemes &&
            schemes.map(s => (
              <Area
                key={s.schemeCode}
                type="monotone"
                dataKey={`scheme_${s.schemeCode}`}
                stroke={s.color}
                strokeWidth={1.25}
                strokeOpacity={0.55}
                fill={`url(#grad_${s.schemeCode})`}
                dot={false}
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              />
            ))}
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke={accent}
            strokeWidth={2.5}
            fill="url(#portfolioGrad)"
            dot={false}
            activeDot={{ r: 5, fill: accent, stroke: 'var(--bg)', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 text-[11px] font-mono" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="flex items-center gap-1.5 text-ink-secondary">
          <span className="w-3 h-0.5" style={{ background: accent }} />
          Portfolio
        </span>
        {showSchemes && schemes.map(s => (
          <span key={s.schemeCode} className="flex items-center gap-1.5 text-ink-tertiary">
            <span className="w-3 h-0.5 opacity-60" style={{ background: s.color }} />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{s.schemeName}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
