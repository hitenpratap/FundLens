import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { SchemeReturns } from '../../types';

interface Props {
  schemes: SchemeReturns[];
}

function inr(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function PortfolioAllocation({ schemes }: Props) {
  const [mode, setMode] = useState<'value' | 'invested'>('value');

  const hasSIP = schemes.some(s => s.sipAmount > 0);
  if (!hasSIP) return null;

  const data = schemes.map(s => ({
    name: s.schemeName,
    shortName: s.schemeName.split(' ').slice(0, 4).join(' '),
    value: mode === 'value' ? s.currentValue : s.totalInvested,
    gain: s.absoluteGainINR,
    color: s.color,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">Portfolio Allocation</h2>
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('value')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'value' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            By Value
          </button>
          <button
            onClick={() => setMode('invested')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'invested' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            By Invested
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="shrink-0" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: unknown) => [`₹${inr(Number(v))}`, '']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.shortName ?? ''}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-48 space-y-3">
          {data.map((d, i) => {
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <div className="text-xs text-slate-600 flex-1 truncate" title={d.name}>{d.shortName}</div>
                  <div className="text-xs font-semibold text-slate-800 tabular-nums">{pct.toFixed(1)}%</div>
                </div>
                <div className="ml-4.5 flex items-center gap-3 text-[11px] text-slate-400 tabular-nums">
                  <span>₹{inr(d.value)}</span>
                  {d.gain !== 0 && (
                    <span className={d.gain >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {d.gain >= 0 ? '+' : ''}₹{inr(d.gain)}
                    </span>
                  )}
                </div>
                <div className="ml-4.5 mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
