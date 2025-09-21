type LRUCacheOptions = {
  ttl: number;       // time-to-live in ms
  itemLimit: number; // max number of items
};

type LRUCache<T> = {
  has: (key: string) => boolean;
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => void;
  delete: (key: string) => void;
};

export function createLRUCache<T>({ ttl, itemLimit }: LRUCacheOptions): LRUCache<T> {
  const cache = new Map<string, { value: T; expiry: number }>();

  const has = (key: string): boolean => {
    const item = cache.get(key);
    if (!item || Date.now() > item.expiry) {
      cache.delete(key);
      return false;
    }
    return true;
  };

  const get = (key: string): T | undefined => (has(key) ? cache.get(key)?.value : undefined);

  const set = (key: string, value: T): void => {
    if (cache.size >= itemLimit) {
      const oldest = cache.keys().next();
      if (!oldest.done) {
        cache.delete(oldest.value);
      }
    }
    if (cache.has(key)) {
      cache.delete(key); // refresh order
    }
    cache.set(key, { value, expiry: Date.now() + ttl });
  };

  const remove = (key: string): void => {
    cache.delete(key);
  };

  return { has, get, set, delete: remove };
}
