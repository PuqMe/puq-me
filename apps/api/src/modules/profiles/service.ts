import type { FastifyInstance } from "fastify";
import { ProfilesRepository } from "./repository.js";
import type {
  UpdateInterestsBody,
  UpdateLocationBody,
  UpdatePreferencesBody,
  UpdateProfileBody,
  UpdateVisibilityBody
} from "./schema.js";

export class ProfilesService {
  private readonly repository: ProfilesRepository;

  constructor(app: FastifyInstance) {
    this.repository = new ProfilesRepository(app);
  }

  getCurrentProfile(userId: string) {
    return this.repository.getCurrentProfile(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileBody) {
    await this.repository.updateProfile(userId, input);
    return this.repository.getCurrentProfile(userId);
  }

  async updateVisibility(userId: string, input: UpdateVisibilityBody) {
    await this.repository.updateVisibility(userId, input);
    return this.repository.getCurrentProfile(userId);
  }

  async replaceInterests(userId: string, input: UpdateInterestsBody) {
    await this.repository.replaceInterests(userId, input);
    return this.repository.getCurrentProfile(userId);
  }

  async updatePreferences(userId: string, input: UpdatePreferencesBody) {
    await this.repository.upsertPreferences(userId, input);
    return this.repository.getCurrentProfile(userId);
  }

  async updateLocation(userId: string, input: UpdateLocationBody) {
    await this.repository.upsertLocation(userId, input);
    return this.repository.getCurrentProfile(userId);
  }
}
