import { env } from "@/lib/env";

export class ApiClient {
  constructor(private readonly baseUrl = env.apiBaseUrl) {}

  async get<T>(path: string, init?: globalThis.RequestInit): Promise<T> {
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

  async post<T>(path: string, body?: unknown, init?: globalThis.RequestInit): Promise<T> {
    const requestInit: globalThis.RequestInit = {
      ...init,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    };

    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...requestInit
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();
