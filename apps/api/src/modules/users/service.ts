import type { FastifyInstance } from "fastify";
import { UsersRepository } from "./repository.js";

export class UsersService {
  private readonly repository: UsersRepository;

  constructor(app: FastifyInstance) {
    this.repository = new UsersRepository(app);
  }

  listUsers() {
    return this.repository.list();
  }

  getUser(userId: string) {
    return this.repository.getById(userId);
  }
}
