type Options = { ttl: number; itemLimit: number };

export function createLRUCache<T>({ ttl, itemLimit }: Options) {
  const map = new Map<string, { value: T; expiry: number }>();

  const has = (key: string) => {
    const item = map.get(key);
    if (!item || Date.now() > item.expiry) {
      map.delete(key);
      return false;
    }
    return true;
  };

  const get = (key: string) => (has(key) ? map.get(key)!.value : undefined);

  const set = (key: string, value: T) => {
    if (map.size >= itemLimit) {
      const oldest = map.keys().next().value;
      map.delete(oldest);
    }
    if (map.has(key)) map.delete(key);
    map.set(key, { value, expiry: Date.now() + ttl });
  };

  const del = (key: string) => map.delete(key);

  return { has, get, set, delete: del };
}
