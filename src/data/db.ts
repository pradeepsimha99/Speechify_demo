import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import type { Client } from "../domain/models/client.js";
import type { User } from "../domain/models/user.js";

type Schema = {
  clients: Client[];
  users: User[];
};

let db: Low<Schema>;

export const getDb = async () => {
  if (!db) {
    const adapter = new JSONFile<Schema>("db.json");
    db = new Low(adapter);
    await db.read();
    db.data ||= { clients: [], users: [] };
  }
  return db;
};
