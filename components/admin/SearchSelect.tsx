'use client';

import { useRef, useState } from 'react';

// Type-to-search combobox for admin forms — pick an entity by name instead of
// pasting a MongoDB ObjectId. Fully controlled: the parent owns the query string
// (usually debounced into a search hook) and the list of options.

export interface SearchOption {
  id: string;
  label: string;
  sub?: string;
  image?: string | null;
}

interface SearchSelectProps {
  query: string;
  onQueryChange: (q: string) => void;
  options: SearchOption[];
  selected: SearchOption | null;
  onSelect: (opt: SearchOption) => void;
  onClear: () => void;
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
}

export default function SearchSelect({
  query,
  onQueryChange,
  options,
  selected,
  onSelect,
  onClear,
  loading,
  placeholder = 'Type to search…',
  emptyText = 'No matches',
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (selected) {
    return (
      <div className="flex items-center gap-2.5 rounded-[11px] border border-line bg-white/70 px-3 py-2">
        {selected.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.image} alt="" className="h-8 w-8 flex-none rounded-[7px] object-cover" />
        ) : (
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[7px] bg-indigo/10 text-[12px] font-bold text-indigo">
            {selected.label.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{selected.label}</span>
          {selected.sub && <span className="block truncate text-xs text-muted">{selected.sub}</span>}
        </span>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="flex-none rounded-lg px-2 py-1 text-xs font-semibold text-slate transition-colors hover:bg-black/5 hover:text-ink"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { onQueryChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
        className="w-full rounded-[11px] border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {open && query.trim().length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-[12px] border border-line bg-white shadow-[0_20px_50px_rgba(22,23,58,.18)]">
          {loading ? (
            <p className="px-3 py-3 text-sm text-muted">Searching…</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">{emptyText}</p>
          ) : (
            <ul>
              {options.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    // onMouseDown fires before the input's onBlur, so the pick isn't lost.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (blurTimer.current) clearTimeout(blurTimer.current);
                      onSelect(opt);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[#f5f6fb]"
                  >
                    {opt.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={opt.image} alt="" className="h-8 w-8 flex-none rounded-[7px] object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[7px] bg-indigo/10 text-[12px] font-bold text-indigo">
                        {opt.label.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{opt.label}</span>
                      {opt.sub && <span className="block truncate text-xs text-muted">{opt.sub}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
