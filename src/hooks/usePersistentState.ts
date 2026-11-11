import { useEffect, useState } from 'react';

export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = () => typeof initial === 'function' ? (initial as () => T)() : initial;
    try {
      const saved = window.localStorage.getItem(key);
      return saved === null ? fallback() : JSON.parse(saved) as T;
    } catch {
      return fallback();
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { console.warn('Unable to save arcade progress', error); }
  }, [key, value]);
  return [value, setValue] as const;
}
