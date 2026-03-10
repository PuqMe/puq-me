import { env } from "./env";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class AdminApiClient {
  constructor(private readonly baseUrl = env.apiBaseUrl) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`${options.method ?? "GET"} ${path} failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string, options: RequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options: RequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T>(path: string, body?: unknown, options: RequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    });
  }
}

export const adminApiClient = new AdminApiClient();
