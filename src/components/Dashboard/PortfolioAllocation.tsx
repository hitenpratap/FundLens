import { useEffect, useState } from 'react';
import type { SchemeReturns } from '../../types';

interface Props {
  schemes: SchemeReturns[];
}

function inr(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const SIZE = 200;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function PortfolioAllocation({ schemes }: Props) {
  const [mode, setMode] = useState<'value' | 'invested'>('value');
  const [hovered, setHovered] = useState<number | null>(null);
  const [drawProgress, setDrawProgress] = useState(0);

  const hasSIP = schemes.some(s => s.sipAmount > 0);

  useEffect(() => {
    if (!hasSIP) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1100, 1);
      setDrawProgress(1 - Math.pow(2, -10 * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasSIP, mode]);

  if (!hasSIP) return null;

  const data = schemes.map(s => ({
    name: s.schemeName,
    short: s.schemeName.split(' ').slice(0, 4).join(' '),
    value: mode === 'value' ? s.currentValue : s.totalInvested,
    gain: s.absoluteGainINR,
    color: s.color,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  let runningOffset = 0;
  const segments = data.map((d, i) => {
    const fraction = total > 0 ? d.value / total : 0;
    const length = fraction * CIRC;
    const offset = runningOffset;
    runningOffset += length;
    return { ...d, fraction, length, offset, index: i };
  });

  const focusItem = hovered != null ? segments[hovered] : null;
  const centerValue = focusItem ? focusItem.value : total;
  const centerLabel = focusItem ? focusItem.short : 'Total';

  return (
    <div className="card p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-ink tracking-tight">Allocation</h2>
          <p className="text-xs text-ink-muted mt-0.5 font-mono">By {mode}</p>
        </div>
        <div
          className="inline-flex p-1 rounded-lg gap-0.5"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {(['value', 'invested'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all"
              style={{
                background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                color: mode === m ? 'var(--ink)' : 'var(--ink-muted)',
                boxShadow: mode === m ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <div className="relative shrink-0 w-40 h-40 sm:w-[200px] sm:h-[200px] mx-auto sm:mx-0">
          <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--surface-2)"
              strokeWidth={STROKE}
            />
            {segments.map(seg => {
              const isHovered = hovered === seg.index;
              const isDimmed = hovered != null && !isHovered;
              return (
                <circle
                  key={seg.index}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? STROKE + 2 : STROKE}
                  strokeDasharray={`${seg.length * drawProgress} ${CIRC}`}
                  strokeDashoffset={-seg.offset * drawProgress}
                  strokeLinecap="butt"
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    transition: 'opacity 200ms ease, stroke-width 200ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHovered(seg.index)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-mono">{centerLabel}</div>
            <div className="text-lg font-mono font-semibold text-ink tnum mt-1">
              ₹{inr(centerValue)}
            </div>
            {focusItem && (
              <div className="text-[11px] text-ink-tertiary font-mono mt-0.5">
                {(focusItem.fraction * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        <div className="w-full sm:flex-1 sm:min-w-[200px] space-y-2.5">
          {segments.map(seg => {
            const isHovered = hovered === seg.index;
            const pct = seg.fraction * 100;
            return (
              <div
                key={seg.index}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-all rounded-md -mx-2 px-2 py-1"
                style={{ background: isHovered ? 'var(--surface-2)' : 'transparent' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}88` }}
                  />
                  <div className="text-xs text-ink-secondary flex-1 truncate font-medium" title={seg.name}>
                    {seg.short}
                  </div>
                  <div className="text-xs font-mono font-semibold text-ink tnum">{pct.toFixed(1)}%</div>
                </div>
                <div className="ml-4 flex items-center gap-3 text-[10px] font-mono text-ink-muted tnum">
                  <span>₹{inr(seg.value)}</span>
                  {seg.gain !== 0 && (
                    <span style={{ color: seg.gain >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {seg.gain >= 0 ? '+' : ''}₹{inr(seg.gain)}
                    </span>
                  )}
                </div>
                <div
                  className="ml-4 mt-1 h-0.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--surface-3)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct * drawProgress}%`,
                      background: seg.color,
                      transitionDuration: '900ms',
                    }}
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
