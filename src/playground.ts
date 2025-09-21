import { UserService } from "./user-service.js";
import { ClientRepository } from "./client-repository.js";

const run = async () => {
  const userService = new UserService();
  const clientRepo = new ClientRepository();

  await clientRepo.save({ id: "c1", name: "Test Client" });

  const added = await userService.addUser("Alice", "Doe", "alice@example.com", new Date(1990, 1, 1), "c1");
  console.log("User added:", added);

  const first = await userService.getUserById("alice@example.com");
  const second = await userService.getUserById("alice@example.com");

  console.log("First fetch:", first);
  console.log("Second fetch (from cache):", second);
};

run();
