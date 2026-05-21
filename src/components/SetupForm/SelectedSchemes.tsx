import { getSchemeColor } from '../../utils/returns';
import type { SchemeListItem } from '../../types';

interface Props {
  schemes: SchemeListItem[];
  onRemove: (code: number) => void;
  sipAmounts: Record<number, number>;
  onSipChange: (code: number, amount: number) => void;
}

export function SelectedSchemes({ schemes, onRemove, sipAmounts, onSipChange }: Props) {
  if (schemes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-4">
      {schemes.map((s, i) => (
        <div
          key={s.schemeCode}
          className="group fade-in flex flex-col gap-2.5 p-3.5 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold"
                style={{ background: getSchemeColor(i) + '22', color: getSchemeColor(i) }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-medium text-ink truncate">{s.schemeName}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(s.schemeCode)}
              className="shrink-0 w-7 h-7 rounded-md text-ink-muted hover:text-negative hover:bg-negative-soft transition-all flex items-center justify-center"
              aria-label="Remove"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 pl-10">
            <span className="text-[11px] uppercase tracking-wider text-ink-muted font-mono shrink-0">SIP</span>
            <div className="relative flex-1 max-w-32 sm:max-w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted font-mono">₹</span>
              <input
                type="number"
                min={0}
                step={500}
                value={sipAmounts[s.schemeCode] || ''}
                onChange={e => onSipChange(s.schemeCode, Math.max(0, Number(e.target.value)))}
                placeholder="optional"
                className="w-full pl-7 pr-3 py-1.5 text-xs font-mono outline-none transition-all rounded-md"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <span className="text-[11px] text-ink-muted">/month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
