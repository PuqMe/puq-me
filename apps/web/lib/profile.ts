"use client";

import { env } from "@/lib/env";
import { fetchWithSession } from "@/lib/auth";
import {
  fetchFallbackProfile,
  shouldUseLocalAppFallback,
  shouldUseLocalAppFallbackForError,
  updateFallbackInterests,
  updateFallbackLocation,
  updateFallbackPreferences,
  updateFallbackProfile,
  updateFallbackVisibility
} from "@/lib/local-app-fallback";

export type ProfileResponse = {
  userId: string;
  profile: {
    displayName: string;
    birthDate: string;
    bio: string | null;
    gender: string | null;
    datingIntent: string | null;
    occupation: string | null;
    city: string | null;
    countryCode: string | null;
    isVisible: boolean;
  };
  interests: string[];
  preferences: {
    interestedIn: string[];
    minAge: number;
    maxAge: number;
    maxDistanceKm: number;
    showMeGlobally: boolean;
    onlyVerifiedProfiles: boolean;
  };
  location: {
    latitude: number;
    longitude: number;
    city: string | null;
    countryCode: string | null;
  } | null;
};

export type UpdateProfileInput = {
  displayName?: string;
  birthDate?: string;
  bio?: string;
  occupation?: string;
  city?: string;
};

export type UpdatePreferencesInput = {
  interestedIn: Array<"men" | "women" | "non_binary" | "everyone">;
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  showMeGlobally?: boolean;
  onlyVerifiedProfiles?: boolean;
};

export type UpdateLocationInput = {
  latitude: number;
  longitude: number;
  city?: string;
  countryCode?: string;
};

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      details?: {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
    };

    if (payload.details?.formErrors?.[0]) {
      return payload.details.formErrors[0];
    }

    const firstFieldError = Object.values(payload.details?.fieldErrors ?? {}).flat().find(Boolean);
    if (firstFieldError) {
      return firstFieldError;
    }

    if (payload.message) {
      return payload.message;
    }

    if (payload.error) {
      return payload.error.replaceAll("_", " ");
    }
  } catch {
    return "Request failed.";
  }

  return "Request failed.";
}

export async function fetchMyProfile() {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me`);

    if (!response.ok) {
      if (shouldUseLocalAppFallback(response)) {
        return fetchFallbackProfile() as ProfileResponse;
      }

      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ProfileResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fetchFallbackProfile() as ProfileResponse;
    }

    throw error;
  }
}

export async function updateMyProfile(input: UpdateProfileInput) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      if (shouldUseLocalAppFallback(response)) {
        return updateFallbackProfile(input) as ProfileResponse;
      }

      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ProfileResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return updateFallbackProfile(input) as ProfileResponse;
    }

    throw error;
  }
}

export async function updateMyInterests(interests: string[]) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me/interests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests })
    });

    if (!response.ok) {
      if (shouldUseLocalAppFallback(response)) {
        return updateFallbackInterests(interests) as ProfileResponse;
      }

      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ProfileResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return updateFallbackInterests(interests) as ProfileResponse;
    }

    throw error;
  }
}

export async function updateMyPreferences(input: UpdatePreferencesInput) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      if (shouldUseLocalAppFallback(response)) {
        return updateFallbackPreferences(input as ProfileResponse["preferences"]) as ProfileResponse;
      }

      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ProfileResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return updateFallbackPreferences(input as ProfileResponse["preferences"]) as ProfileResponse;
    }

    throw error;
  }
}

export async function updateMyLocation(input: UpdateLocationInput) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me/location`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      if (shouldUseLocalAppFallback(response)) {
        return updateFallbackLocation(input as NonNullable<ProfileResponse["location"]>) as ProfileResponse;
      }

      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ProfileResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return updateFallbackLocation(input as NonNullable<ProfileResponse["location"]>) as ProfileResponse;
    }

    throw error;
  }
}

export async function updateMyVisibility(isVisible: boolean) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible })
    });

    if (!response.ok) {
      if (shouldUseLocalAppFallback(response)) {
        return updateFallbackVisibility(isVisible) as ProfileResponse;
      }

      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ProfileResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return updateFallbackVisibility(isVisible) as ProfileResponse;
    }

    throw error;
  }
}
