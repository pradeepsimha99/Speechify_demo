import { nanoid } from "nanoid";
import { UserRepository } from "../../data/repositories/user-repository.js";
import { ClientRepository } from "../../data/repositories/client-repository.js";
import type { User } from "../models/user.js";

export class UserService {
  private repo = new UserRepository();
  private clientRepo = new ClientRepository();

  async addUser(
    firstname: string,
    surname: string,
    email: string,
    dob: Date,
    clientId: string
  ): Promise<boolean> {
    if (!firstname || !surname || !email) return false;

    const exists = await this.repo.findByEmail(email);
    if (exists) return false;

    const client = await this.clientRepo.getById(clientId);
    if (!client) return false;

    if (this.getAge(dob) < 18) return false;

    const user: User = {
      id: nanoid(),
      firstname,
      surname,
      email,
      dateOfBirth: dob.toISOString(),
      client,
      hasCreditLimit: false,
      creditLimit: 0
    };

    await this.repo.create(user);
    return true;
  }

  async getUserById(id: string) {
    return this.repo.getById(id);
  }

  async findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async updateUser(user: User) {
    return this.repo.update(user);
  }

  async deleteUser(id: string) {
    return this.repo.delete(id);
  }

  private getAge(dob: Date) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    )
      age--;
    return age;
  }
}
