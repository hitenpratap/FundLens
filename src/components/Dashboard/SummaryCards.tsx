import { useCountUp } from '../../hooks/useCountUp';
import type { SchemeReturns } from '../../types';

interface Props {
  schemes: SchemeReturns[];
  portfolioReturn: number;
  portfolioCagr: number;
  portfolioXirr: number | null;
  years: number;
  portfolioTotalInvested: number;
  portfolioCurrentValue: number;
}

function inr(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={positive ? 'text-positive' : 'text-negative'} aria-hidden>
      {positive ? '▲' : '▼'}
    </span>
  );
}

export function SummaryCards({
  schemes,
  portfolioReturn,
  portfolioCagr,
  portfolioXirr,
  years,
  portfolioTotalInvested,
  portfolioCurrentValue,
}: Props) {
  const portfolioGain = portfolioCurrentValue - portfolioTotalInvested;
  const hasSIP = portfolioTotalInvested > 0;
  const positive = portfolioReturn >= 0;

  const returnAnim = useCountUp(portfolioReturn, { duration: 1100, decimals: 2 });
  const cagrAnim = useCountUp(portfolioCagr, { duration: 1100, decimals: 2 });
  const xirrAnim = useCountUp(portfolioXirr ?? 0, { duration: 1100, decimals: 2 });
  const valueAnim = useCountUp(portfolioCurrentValue, { duration: 1100, decimals: 0 });
  const investedAnim = useCountUp(portfolioTotalInvested, { duration: 1100, decimals: 0 });
  const gainAnim = useCountUp(portfolioGain, { duration: 1100, decimals: 0 });

  return (
    <div className="space-y-4">
      {/* Hero block */}
      <div
        className="card-elevated p-7 relative overflow-hidden"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <div
          className="absolute -top-32 -right-20 w-96 h-96 rounded-full"
          style={{
            background: positive
              ? 'radial-gradient(circle, var(--accent-soft), transparent 70%)'
              : 'radial-gradient(circle, var(--negative-soft), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-end gap-8 justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-muted font-mono mb-3">
              <span>Portfolio return</span>
              <span className="text-ink-muted/60">·</span>
              <span>{years}Y</span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <div
                className="font-mono font-semibold tnum"
                style={{
                  fontSize: 'clamp(56px, 9vw, 96px)',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.95,
                  color: positive ? 'var(--positive)' : 'var(--negative)',
                }}
              >
                {positive ? '+' : ''}{returnAnim.toFixed(2)}
                <span className="text-ink-muted font-normal" style={{ fontSize: '0.4em' }}>%</span>
              </div>
              <Trend value={portfolioReturn} />
            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-2 mt-6 font-mono text-sm text-ink-secondary">
              <Metric label="CAGR" value={`${cagrAnim >= 0 ? '+' : ''}${cagrAnim.toFixed(2)}%`} suffix="p.a." />
              {portfolioXirr != null && (
                <Metric label="XIRR" value={`${xirrAnim >= 0 ? '+' : ''}${xirrAnim.toFixed(2)}%`} suffix="p.a." />
              )}
            </div>
          </div>

          {hasSIP && (
            <div
              className="grid grid-cols-3 gap-5 lg:gap-7 lg:border-l lg:pl-7 shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <KPI label="Invested" value={`₹${inr(investedAnim)}`} />
              <KPI label="Value" value={`₹${inr(valueAnim)}`} accent />
              <KPI
                label="Gain"
                value={`${gainAnim >= 0 ? '+' : '−'}₹${inr(Math.abs(gainAnim))}`}
                tone={gainAnim >= 0 ? 'positive' : 'negative'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Per-scheme cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {schemes.map(s => (
          <SchemeCard key={s.schemeCode} scheme={s} />
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</span>
      <span className="text-ink">{value}</span>
      {suffix && <span className="text-[11px] text-ink-muted">{suffix}</span>}
    </div>
  );
}

function KPI({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: 'positive' | 'negative';
}) {
  const color = tone === 'positive' ? 'var(--positive)' : tone === 'negative' ? 'var(--negative)' : accent ? 'var(--accent)' : 'var(--ink)';
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted font-mono mb-1">{label}</div>
      <div className="font-mono font-semibold tnum text-base lg:text-lg truncate" style={{ color }} title={value}>
        {value}
      </div>
    </div>
  );
}

function SchemeCard({ scheme }: { scheme: SchemeReturns }) {
  const positive = scheme.absoluteReturn >= 0;
  const sparkData = scheme.monthlyNavs.map(n => n.normalizedValue);
  return (
    <div className="card p-5 group transition-all duration-200 hover:-translate-y-0.5" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start gap-2.5 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
          style={{ background: scheme.color, boxShadow: `0 0 12px ${scheme.color}80` }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-mono truncate">{scheme.fundHouse}</div>
          <div className="text-sm font-semibold text-ink leading-snug mt-1 line-clamp-2">{scheme.schemeName}</div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mb-3">
        <div className="font-mono tnum">
          <span
            className="text-2xl font-semibold"
            style={{ color: positive ? 'var(--positive)' : 'var(--negative)' }}
          >
            {positive ? '+' : ''}{scheme.absoluteReturn.toFixed(2)}%
          </span>
        </div>
        <Sparkline data={sparkData} color={scheme.color} positive={positive} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div>
          <div className="text-ink-muted">CAGR</div>
          <div className="text-ink-secondary tnum">{scheme.cagr.toFixed(2)}%</div>
        </div>
        {scheme.xirr != null ? (
          <div>
            <div className="text-ink-muted">XIRR</div>
            <div className="text-accent tnum">{scheme.xirr.toFixed(2)}%</div>
          </div>
        ) : (
          <div>
            <div className="text-ink-muted">NAV</div>
            <div className="text-ink-secondary tnum">₹{scheme.currentNav.toFixed(2)}</div>
          </div>
        )}
        <div>
          <div className="text-ink-muted">{scheme.xirr != null ? 'NAV' : 'Start'}</div>
          <div className="text-ink-secondary tnum">
            ₹{(scheme.xirr != null ? scheme.currentNav : scheme.startNav).toFixed(2)}
          </div>
        </div>
      </div>

      {scheme.sipAmount > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <div className="text-ink-muted">Invested</div>
            <div className="text-ink-secondary tnum">₹{inr(scheme.totalInvested)}</div>
          </div>
          <div>
            <div className="text-ink-muted">Value</div>
            <div className="text-ink-secondary tnum">₹{inr(scheme.currentValue)}</div>
          </div>
          <div>
            <div className="text-ink-muted">Gain</div>
            <div
              className="tnum"
              style={{ color: scheme.absoluteGainINR >= 0 ? 'var(--positive)' : 'var(--negative)' }}
            >
              {scheme.absoluteGainINR >= 0 ? '+' : '−'}₹{inr(Math.abs(scheme.absoluteGainINR))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  if (data.length < 2) return null;
  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(' L ')}`;
  const areaPath = `${path} L ${w},${h} L 0,${h} Z`;
  const gradId = `spark-${color.replace('#', '')}`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? color : 'var(--negative)'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? color : 'var(--negative)'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={positive ? color : 'var(--negative)'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="200"
        strokeDashoffset="200"
        style={{ animation: 'draw 900ms cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards' }}
      />
    </svg>
  );
}
