import { env } from "@/lib/env";

export class ApiClient {
  constructor(private readonly baseUrl = env.apiBaseUrl) {}

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();
