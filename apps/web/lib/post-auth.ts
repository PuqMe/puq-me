"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { fetchMyProfile, type ProfileResponse } from "@/lib/profile";

function hasCompletedProfile(profile: ProfileResponse) {
  return (
    profile.profile.displayName.trim().length >= 2 &&
    profile.interests.length >= 3
  );
}

export function getPostAuthPath(profile: ProfileResponse) {
  if (!hasCompletedProfile(profile)) {
    return "/onboarding";
  }

  return "/nearby";
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
    if (window.location.pathname === "/" || window.location.pathname === "/login" || window.location.pathname === "/register") {
      window.location.assign(nextPath);
    }
  }, 180);
}
