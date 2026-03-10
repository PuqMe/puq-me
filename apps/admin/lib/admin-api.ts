import { adminApiClient } from "./api-client";

export type AdminOverviewResponse = {
  openReports: number;
  highRiskUsers: number;
  messagesToday: number;
  matchesToday: number;
  newUsersToday: number;
};

export type AdminReport = {
  id: string;
  target: string;
  reason: string;
  priority: string;
  status: string;
};

export type AdminUser = {
  userId: string;
  status: string;
  riskScore: number;
  city: string | null;
};

export const adminApi = {
  getOverview(token?: string | null) {
    return adminApiClient.get<AdminOverviewResponse>("/v1/admin/stats/overview", { token });
  },
  listReports(token?: string | null) {
    return adminApiClient.get<{ items: AdminReport[] }>("/v1/admin/reports", { token });
  },
  listUsers(token?: string | null) {
    return adminApiClient.get<{ items: AdminUser[] }>("/v1/admin/users", { token });
  },
  suspendUser(userId: string, token?: string | null) {
    return adminApiClient.post(`/v1/admin/users/${userId}/suspend`, undefined, { token });
  },
  unsuspendUser(userId: string, token?: string | null) {
    return adminApiClient.post(`/v1/admin/users/${userId}/unban`, undefined, { token });
  },
  disableProfile(userId: string, token?: string | null) {
    return adminApiClient.post(`/v1/admin/users/${userId}/disable-profile`, undefined, { token });
  }
};
