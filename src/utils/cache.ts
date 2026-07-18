interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Wraps an async fetcher with cache-aside behavior.
 * NOTE: single-process, in-memory only — fine for one backend instance.
 * Swap for Redis (same get/set shape) if this ever runs multi-instance.
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== undefined) return cached;
  const fresh = await fetcher();
  setCached(key, fresh, ttlMs);
  return fresh;
}