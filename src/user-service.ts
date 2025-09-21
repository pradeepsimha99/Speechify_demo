import { getDb } from "./db.js";
import { nanoid } from "nanoid";
import { ClientRepository } from "./client-repository.js";
import { User } from "./user.js";
import { createLRUCache } from "./lru-cache.js";

// Cache for users
const userCache = createLRUCache<User>({ ttl: 60_000, itemLimit: 200 });

export class UserService {
  private clientRepo = new ClientRepository();

  async addUser(
    firstname: string,
    surname: string,
    email: string,
    dateOfBirth: Date,
    clientId: string
  ): Promise<boolean> {
    if (!firstname || !surname || !email) return false;

    const db = await getDb();
    if (db.data.users.find(u => u.email === email)) return false;

    const client = await this.clientRepo.getById(clientId);
    if (!client) return false;

    if (this.getAge(dateOfBirth) < 18) return false;

    const user: User = {
      id: nanoid(),
      client,
      dateOfBirth,
      email,
      firstname,
      surname,
      hasCreditLimit: false,
      creditLimit: 0,
    };

    db.data.users.push(user);
    await db.write();

    userCache.set(user.id, user);
    return true;
  }

  async getUserById(id: string): Promise<User | null> {
    if (userCache.has(id)) return userCache.get(id)!;

    const db = await getDb();
    const user = db.data.users.find(u => u.id === id) || null;

    if (user) userCache.set(id, user);
    return user;
  }

  async updateUser(user: User): Promise<boolean> {
    const db = await getDb();
    const index = db.data.users.findIndex(u => u.id === user.id);

    if (index === -1) return false;

    db.data.users[index] = user;
    await db.write();
    userCache.set(user.id, user);

    return true;
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = await getDb();
    const before = db.data.users.length;

    db.data.users = db.data.users.filter(u => u.id !== id);
    await db.write();

    if (db.data.users.length < before) {
      userCache.delete(id);
      return true;
    }
    return false;
  }

  private getAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    return age;
  }
}
