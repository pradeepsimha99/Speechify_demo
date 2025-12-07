import { createLRUCache } from "../data/cache/lru-cache";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe("LRUCache", () => {
  it("should store and retrieve values", () => {
    const cache = createLRUCache<string>({ itemLimit: 10, ttl: 1000 });
    cache.set("foo", "bar");
    expect(cache.get("foo")).toBe("bar");
  });

  it("should evict oldest when limit exceeded", () => {
    const cache = createLRUCache<string>({ itemLimit: 1, ttl: 1000 });
    cache.set("a", "1");
    cache.set("b", "2");
    expect(cache.has("a")).toBe(false);
    expect(cache.has("b")).toBe(true);
  });

  it("should expire keys after ttl", async () => {
    const cache = createLRUCache<string>({ itemLimit: 10, ttl: 50 });
    cache.set("x", "val");
    expect(cache.has("x")).toBe(true);
    await sleep(60);
    expect(cache.has("x")).toBe(false);
  });
});
