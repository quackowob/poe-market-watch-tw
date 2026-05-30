"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import defaultFavorites from "@/config/favorites.json";

export const FAVORITES_KEY = "poe-market-watch:favorites";
export const DASHBOARD_ORDER_KEY = "poe-market-watch:dashboard-order";
export const NAV_ORDER_KEY = "poe-market-watch:nav-order";
export const FAVORITES_CHANGED_EVENT = "poe-market-watch:favorites-changed";

function readStringArray(key: string, fallback: string[]) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStringArray(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useStoredOrder<T extends string>(key: string, defaults: readonly T[]) {
  const defaultsKey = defaults.join("|");
  const defaultOrder = useMemo(() => [...defaults], [defaultsKey]);
  const [order, setOrder] = useState<T[]>(defaultOrder);

  useEffect(() => {
    const stored = readStringArray(key, defaultOrder) as T[];
    setOrder(normalizeOrder(stored, defaultOrder));
  }, [defaultOrder, key]);

  const commit = useCallback(
    (next: T[]) => {
      const normalized = normalizeOrder(next, defaultOrder);
      setOrder(normalized);
      writeStringArray(key, normalized);
    },
    [defaultOrder, key]
  );

  const move = useCallback(
    (id: T, direction: -1 | 1) => {
      const index = order.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= order.length) return;
      const next = [...order];
      [next[index], next[target]] = [next[target], next[index]];
      commit(next);
    },
    [commit, order]
  );

  const reset = useCallback(() => commit(defaultOrder), [commit, defaultOrder]);

  return { order, move, reset };
}

export function useFavoriteNames() {
  const defaults = useMemo(() => defaultFavorites as string[], []);
  const [favorites, setFavorites] = useState<string[]>(defaults);

  useEffect(() => {
    setFavorites(readStringArray(FAVORITES_KEY, defaults));

    const sync = () => setFavorites(readStringArray(FAVORITES_KEY, defaults));
    window.addEventListener("storage", sync);
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
    };
  }, [defaults]);

  const toggleFavorite = useCallback(
    (name: string) => {
      setFavorites((current) => {
        const exists = current.includes(name);
        const next = exists ? current.filter((item) => item !== name) : [...current, name];
        writeStringArray(FAVORITES_KEY, next);
        window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
        return next;
      });
    },
    []
  );

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  return { favorites, favoriteSet, toggleFavorite };
}

function normalizeOrder<T extends string>(stored: T[], defaults: T[]) {
  const allowed = new Set(defaults);
  const uniqueStored = stored.filter((item, index) => allowed.has(item) && stored.indexOf(item) === index);
  return [...uniqueStored, ...defaults.filter((item) => !uniqueStored.includes(item))];
}
