import { useEffect, useState } from 'react';

/**
 * Debounce a fast-changing value (e.g. a search box) so downstream work (a
 * query, a navigation) only runs once the value settles for `ms` milliseconds.
 * Each change resets the timer.
 */
export function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
