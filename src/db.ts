import { JSONFilePreset } from "lowdb/node";
import { Client } from "./client.js";
import { User } from "./user.js";

// Initialize LowDB with defaults
export const getDb = async () => {
  return JSONFilePreset("db.json", {
    clients: [] as Client[],
    users: [] as User[],
  });
};
