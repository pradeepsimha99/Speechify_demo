import { getDb } from "./db.js";
import { Client } from "./client.js";
import { createLRUCache } from "./lru-cache.js";

// Cache for clients
const clientCache = createLRUCache<Client>({ ttl: 60_000, itemLimit: 100 });

export class ClientRepository {
  async getById(id: string): Promise<Client | null> {
    if (clientCache.has(id)) return clientCache.get(id)!;

    const db = await getDb();
    const client = db.data.clients.find(c => c.id === id) || null;

    if (client) clientCache.set(id, client);
    return client;
  }

  async getAll(): Promise<Client[]> {
    const db = await getDb();
    return [...db.data.clients];
  }

  async save(client: Client): Promise<void> {
    const db = await getDb();
    const index = db.data.clients.findIndex(c => c.id === client.id);

    if (index >= 0) db.data.clients[index] = client;
    else db.data.clients.push(client);

    await db.write();
    clientCache.set(client.id, client);
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    db.data.clients = db.data.clients.filter(c => c.id !== id);
    await db.write();
    clientCache.delete(id);
  }
}
