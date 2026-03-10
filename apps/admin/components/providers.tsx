"use client";

import type { PropsWithChildren } from "react";
import { AdminAuthProvider } from "@/lib/admin-auth";

export function Providers({ children }: PropsWithChildren) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
