import { createLRUCache } from "./lru-cache.js";
import type { Client } from "../../domain/models/client.js";
import type { User } from "../../domain/models/user.js";

export const clientCache = createLRUCache<Client>({ ttl: 60000, itemLimit: 100 });
export const userCache = createLRUCache<User>({ ttl: 60000, itemLimit: 200 });

export const keys = {
  client: (id: string) => `client:${id}`,
  user: (id: string) => `user:${id}`,
  usersAll: "users:all"
};
