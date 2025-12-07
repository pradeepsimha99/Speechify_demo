import { getDb } from "../db.js";
import type { User } from "../../domain/models/user.js";
import { userCache, keys } from "../cache/index.js";

export class UserRepository {
  async getById(id: string): Promise<User | null> {
    const key = keys.user(id);
    if (userCache.has(key)) return userCache.get(key)!;

    const db = await getDb();
    const user = db.data!.users.find(u => u.id === id) || null;

    if (user) userCache.set(key, user);
    return user;
  }

  async getAll(): Promise<User[]> {
    if (userCache.has(keys.usersAll)) {
      return userCache.get(keys.usersAll) as unknown as User[];
    }

    const db = await getDb();
    const users = [...db.data!.users];

    userCache.set(keys.usersAll, users as unknown as User);

    users.forEach(u => userCache.set(keys.user(u.id), u));

    return users;
  }

  async create(user: User): Promise<void> {
    const db = await getDb();
    db.data!.users.push(user);
    await db.write();

    userCache.set(keys.user(user.id), user);

    if (userCache.has(keys.usersAll)) {
      const all = userCache.get(keys.usersAll) as unknown as User[];
      userCache.set(keys.usersAll, [...all, user] as unknown as User);
    }
  }

  async update(user: User): Promise<boolean> {
    const db = await getDb();
    const idx = db.data!.users.findIndex(u => u.id === user.id);
    if (idx === -1) return false;

    db.data!.users[idx] = user;
    await db.write();

    userCache.set(keys.user(user.id), user);

    if (userCache.has(keys.usersAll)) {
      const all = userCache.get(keys.usersAll) as unknown as User[];
      userCache.set(
        keys.usersAll,
        all.map(u => (u.id === user.id ? user : u)) as unknown as User
      );
    }

    return true;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const before = db.data!.users.length;

    db.data!.users = db.data!.users.filter(u => u.id !== id);
    await db.write();

    userCache.delete(keys.user(id));

    if (userCache.has(keys.usersAll)) {
      const all = userCache.get(keys.usersAll) as unknown as User[];
      userCache.set(keys.usersAll, all.filter(u => u.id !== id) as unknown as User);
    }

    return before !== db.data!.users.length;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const user = db.data!.users.find(u => u.email === email) || null;

    if (user) userCache.set(keys.user(user.id), user);
    return user;
  }
}
