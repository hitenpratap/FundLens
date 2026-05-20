import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { SchemeListItem } from '../../types';

interface Props {
  schemes: SchemeListItem[];
  selected: SchemeListItem[];
  onSelect: (scheme: SchemeListItem) => void;
  disabled?: boolean;
}

export function SchemeSearch({ schemes, selected, onSelect, disabled }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () => new Fuse(schemes, { keys: ['schemeName'], threshold: 0.35, distance: 200 }),
    [schemes]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse
      .search(query.trim())
      .slice(0, 8)
      .map(r => r.item)
      .filter(s => !selected.find(sel => sel.schemeCode === s.schemeCode));
  }, [query, fuse, selected]);

  useEffect(() => setHighlighted(0), [results]);

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && results[highlighted]) {
      e.preventDefault();
      pick(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function pick(scheme: SchemeListItem) {
    onSelect(scheme);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          placeholder="Search scheme name…"
          className="input-base"
          style={{ paddingLeft: 44 }}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKey}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors w-6 h-6 rounded-md flex items-center justify-center"
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 overflow-hidden fade-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.6)',
          }}
        >
          {results.map((scheme, i) => (
            <button
              key={scheme.schemeCode}
              type="button"
              className="w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3"
              style={{
                background: i === highlighted ? 'var(--surface-2)' : 'transparent',
                color: i === highlighted ? 'var(--ink)' : 'var(--ink-secondary)',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
              }}
              onMouseDown={() => pick(scheme)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{scheme.schemeName}</div>
                <div className="text-[11px] text-ink-muted mt-0.5 font-mono">#{scheme.schemeCode}</div>
              </div>
              <div className="text-ink-muted shrink-0">+</div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div
          className="absolute z-50 w-full mt-2 px-4 py-3 text-sm text-ink-muted fade-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          No schemes match "{query}"
        </div>
      )}
    </div>
  );
}
