type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>) {
  const now = Date.now();
  const hit = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  const value = await loader();
  memoryCache.set(key, {
    value,
    expiresAt: now + ttlMs
  });

  return value;
}
