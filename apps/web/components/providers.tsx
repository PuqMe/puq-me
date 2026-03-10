"use client";

import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
