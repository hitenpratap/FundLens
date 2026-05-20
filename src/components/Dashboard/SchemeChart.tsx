import { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SchemeReturns } from '../../types';

interface Props {
  schemes: SchemeReturns[];
}

function inr(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function SchemeChart({ schemes }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const scheme = schemes[activeTab];

  if (!scheme || scheme.monthlyNavs.length === 0) return null;

  const hasSIP = scheme.sipAmount > 0;

  const data = scheme.monthlyNavs.map(n => ({
    label: n.label,
    nav: parseFloat(n.nav.toFixed(2)),
    fundValue: hasSIP ? Math.round(n.fundValueToDate) : undefined,
    invested: hasSIP ? Math.round(n.investedToDate) : undefined,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold text-slate-800 mb-3">Individual Scheme NAV</h2>
      <div className="flex gap-2 flex-wrap mb-4">
        {schemes.map((s, i) => (
          <button
            key={s.schemeCode}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === i ? 'text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={activeTab === i ? { backgroundColor: s.color } : {}}
          >
            {s.schemeName.length > 35 ? s.schemeName.slice(0, 35) + '…' : s.schemeName}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: hasSIP ? 55 : 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="schemeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={scheme.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={scheme.color} stopOpacity={0} />
            </linearGradient>
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
            yAxisId="nav"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v}`}
            domain={['auto', 'auto']}
          />
          {hasSIP && (
            <YAxis
              yAxisId="value"
              orientation="right"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
              width={48}
            />
          )}
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(v: unknown, name: string | number | undefined) => {
              const val = Number(v ?? 0);
              if (name === 'nav') return [`₹${val.toFixed(2)}`, 'NAV'];
              if (name === 'fundValue') return [`₹${inr(val)}`, 'Fund Value'];
              if (name === 'invested') return [`₹${inr(val)}`, 'Invested'];
              return [`${v}`, `${name ?? ''}`];
            }}
          />
          <Area
            yAxisId="nav"
            type="monotone"
            dataKey="nav"
            stroke={scheme.color}
            strokeWidth={2}
            fill="url(#schemeGrad)"
            dot={false}
          />
          {hasSIP && (
            <>
              <Line
                yAxisId="value"
                type="monotone"
                dataKey="fundValue"
                stroke={scheme.color}
                strokeWidth={2}
                dot={false}
                name="Fund Value"
              />
              <Line
                yAxisId="value"
                type="monotone"
                dataKey="invested"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                name="Invested"
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {hasSIP && (
        <div className="flex gap-5 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded" style={{ backgroundColor: scheme.color }} />
            <span>Fund Value (right axis)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="24" height="2" viewBox="0 0 24 2">
              <line x1="0" y1="1" x2="24" y2="1" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
            </svg>
            <span>Invested (right axis)</span>
          </div>
        </div>
      )}
    </div>
  );
}
