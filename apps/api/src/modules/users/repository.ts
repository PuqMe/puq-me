import type { FastifyInstance } from "fastify";

export class UsersRepository {
  constructor(private readonly app: FastifyInstance) {}

  async list() {
    return [
      { id: "user-1", displayName: "Lina" },
      { id: "user-2", displayName: "Maya" }
    ];
  }

  async getById(userId: string) {
    return { id: userId, displayName: "Demo User" };
  }
}
