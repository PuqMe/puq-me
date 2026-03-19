"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { fetchMyProfile, type ProfileResponse } from "@/lib/profile";

function hasCompletedOnboarding(profile: ProfileResponse) {
  return Boolean(profile.location) && profile.interests.length > 0 && profile.preferences.interestedIn.length > 0;
}

function hasCompletedProfile(profile: ProfileResponse) {
  return (
    profile.profile.displayName.trim().length >= 2 &&
    Boolean(profile.profile.birthDate) &&
    Boolean(profile.profile.bio?.trim()) &&
    Boolean((profile.profile.city ?? profile.location?.city ?? "").trim())
  );
}

export function getPostAuthPath(profile: ProfileResponse) {
  if (!hasCompletedOnboarding(profile)) {
    return "/onboarding";
  }

  if (!hasCompletedProfile(profile)) {
    return "/profile/create";
  }

  return "/discover";
}

export async function resolvePostAuthPath() {
  const profile = await fetchMyProfile();
  return getPostAuthPath(profile);
}

export async function navigateToPostAuthPath(router: AppRouterInstance) {
  let nextPath = "/onboarding";

  try {
    nextPath = await resolvePostAuthPath();
  } catch {
    nextPath = "/onboarding";
  }

  router.push(nextPath);
  window.setTimeout(() => {
    if (window.location.pathname === "/login" || window.location.pathname === "/register") {
      window.location.assign(nextPath);
    }
  }, 180);
}
