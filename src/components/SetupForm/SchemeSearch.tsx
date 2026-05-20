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
  const listRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(schemes, {
        keys: ['schemeName'],
        threshold: 0.35,
        distance: 200,
      }),
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
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Search scheme name…"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKey}
      />
      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-auto max-h-64"
        >
          {results.map((scheme, i) => (
            <button
              key={scheme.schemeCode}
              type="button"
              className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 last:border-0 transition-colors ${
                i === highlighted ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
              onMouseDown={() => pick(scheme)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <div className="font-medium truncate">{scheme.schemeName}</div>
              <div className="text-xs text-slate-400 mt-0.5">Code: {scheme.schemeCode}</div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl px-4 py-3 text-sm text-slate-400">
          No schemes found
        </div>
      )}
    </div>
  );
}
