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
  const positive = scheme.absoluteReturn >= 0;

  const data = scheme.monthlyNavs.map(n => ({
    label: n.label,
    nav: parseFloat(n.nav.toFixed(2)),
    fundValue: hasSIP ? Math.round(n.fundValueToDate) : undefined,
    invested: hasSIP ? Math.round(n.investedToDate) : undefined,
  }));

  return (
    <div className="card p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="text-base font-semibold text-ink tracking-tight">Per-scheme detail</h2>
          <p className="text-xs text-ink-muted mt-0.5 font-mono">NAV history{hasSIP ? ' + invested vs value' : ''}</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-5 -mx-0.5">
        {schemes.map((s, i) => {
          const isActive = activeTab === i;
          return (
            <button
              key={s.schemeCode}
              onClick={() => setActiveTab(i)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5"
              style={{
                background: isActive ? s.color + '20' : 'var(--surface-2)',
                color: isActive ? s.color : 'var(--ink-tertiary)',
                border: '1px solid ' + (isActive ? s.color + '60' : 'var(--border)'),
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                {s.schemeName.length > 35 ? s.schemeName.slice(0, 35) + '…' : s.schemeName}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="rounded-xl p-3 sm:p-4 mb-5 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <Stat label="Current NAV" value={`₹${scheme.currentNav.toFixed(2)}`} />
        <Stat label="Start NAV" value={`₹${scheme.startNav.toFixed(2)}`} />
        <Stat
          label="Return"
          value={`${positive ? '+' : ''}${scheme.absoluteReturn.toFixed(2)}%`}
          tone={positive ? 'positive' : 'negative'}
        />
        <Stat label="CAGR" value={`${scheme.cagr.toFixed(2)}%`} />
        {scheme.xirr != null && <Stat label="XIRR" value={`${scheme.xirr.toFixed(2)}%`} tone="accent" />}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: hasSIP ? 50 : 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`schemeGrad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scheme.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={scheme.color} stopOpacity={0} />
            </linearGradient>
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
            yAxisId="nav"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v}`}
            domain={['auto', 'auto']}
            width={48}
          />
          {hasSIP && (
            <YAxis
              yAxisId="value"
              orientation="right"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
              width={42}
            />
          )}
          <Tooltip
            cursor={{ stroke: scheme.color, strokeOpacity: 0.4, strokeDasharray: '3 3' }}
            formatter={(v: unknown, name: string | number | undefined) => {
              const val = Number(v ?? 0);
              if (name === 'nav') return [`₹${val.toFixed(2)}`, 'NAV'];
              if (name === 'fundValue') return [`₹${inr(val)}`, 'Fund value'];
              if (name === 'invested') return [`₹${inr(val)}`, 'Invested'];
              return [`${v}`, `${name ?? ''}`];
            }}
          />
          <Area
            yAxisId="nav"
            type="monotone"
            dataKey="nav"
            stroke={scheme.color}
            strokeWidth={2.25}
            fill={`url(#schemeGrad-${activeTab})`}
            dot={false}
            isAnimationActive
            animationDuration={900}
          />
          {hasSIP && (
            <>
              <Line
                yAxisId="value"
                type="monotone"
                dataKey="fundValue"
                stroke={scheme.color}
                strokeWidth={1.8}
                strokeOpacity={0.85}
                dot={false}
                isAnimationActive
                animationDuration={900}
              />
              <Line
                yAxisId="value"
                type="monotone"
                dataKey="invested"
                stroke="var(--ink-muted)"
                strokeWidth={1.4}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive
                animationDuration={900}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {hasSIP && (
        <div className="flex gap-5 mt-3 pt-3 text-[11px] font-mono flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="flex items-center gap-1.5 text-ink-secondary">
            <span className="w-3 h-0.5" style={{ background: scheme.color }} />
            NAV (left)
          </span>
          <span className="flex items-center gap-1.5 text-ink-secondary">
            <span className="w-3 h-0.5 opacity-85" style={{ background: scheme.color }} />
            Fund value (right)
          </span>
          <span className="flex items-center gap-1.5 text-ink-tertiary">
            <svg width="20" height="2" viewBox="0 0 20 2">
              <line x1="0" y1="1" x2="20" y2="1" stroke="var(--ink-muted)" strokeWidth="1.4" strokeDasharray="4 3" />
            </svg>
            Invested (right)
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: { label: string; value: string; tone?: 'positive' | 'negative' | 'accent' }) {
  const color =
    tone === 'positive' ? 'var(--positive)' :
    tone === 'negative' ? 'var(--negative)' :
    tone === 'accent' ? 'var(--accent)' : 'var(--ink)';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-mono mb-0.5">{label}</div>
      <div className="text-sm font-mono font-semibold tnum" style={{ color }}>{value}</div>
    </div>
  );
}
