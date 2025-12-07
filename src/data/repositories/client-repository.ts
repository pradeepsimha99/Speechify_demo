import { getDb } from "../db.js";
import type { Client } from "../../domain/models/client.js";
import { clientCache, keys } from "../cache/index.js";

export class ClientRepository {
  async getById(id: string): Promise<Client | null> {
    const key = keys.client(id);
    if (clientCache.has(key)) return clientCache.get(key)!;

    const db = await getDb();
    const client = db.data!.clients.find(c => c.id === id) || null;

    if (client) clientCache.set(key, client);
    return client;
  }

  async getAll(): Promise<Client[]> {
    const db = await getDb();
    return [...db.data!.clients];
  }

  async save(client: Client): Promise<void> {
    const db = await getDb();
    const idx = db.data!.clients.findIndex(c => c.id === client.id);
    if (idx >= 0) db.data!.clients[idx] = client;
    else db.data!.clients.push(client);

    await db.write();
    clientCache.set(keys.client(client.id), client);
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const before = db.data!.clients.length;
    db.data!.clients = db.data!.clients.filter(c => c.id !== id);
    await db.write();

    clientCache.delete(keys.client(id));
    return before !== db.data!.clients.length;
  }
}
