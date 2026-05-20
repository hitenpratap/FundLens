import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SchemeReturns, PortfolioMonth } from '../../types';

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
  // Build unified dataset: join all schemes on same month labels
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

  const data = Array.from(monthMap.values());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any) => [`${Number(value).toFixed(2)}`, ''];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold text-slate-800 mb-1">Portfolio Growth</h2>
      <p className="text-xs text-slate-400 mb-4">Normalized to ₹100 at start date</p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            {schemes.map(s => (
              <linearGradient key={s.schemeCode} id={`grad_${s.schemeCode}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            interval={Math.floor(data.length / 8)}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={formatTooltip}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
          {/* Portfolio line */}
          <Area
            type="monotone"
            dataKey="portfolio"
            name="Portfolio (avg)"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#portfolioGrad)"
            dot={false}
          />
          {/* Individual schemes */}
          {schemes.map(s => (
            <Area
              key={s.schemeCode}
              type="monotone"
              dataKey={`scheme_${s.schemeCode}`}
              name={s.schemeName.length > 40 ? s.schemeName.slice(0, 40) + '…' : s.schemeName}
              stroke={s.color}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill={`url(#grad_${s.schemeCode})`}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
