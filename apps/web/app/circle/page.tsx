import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { CircleMap } from "@/components/circle-map";

export const metadata: Metadata = {
  title: "Circle • Deine Begegnungen"
};

export default function CirclePage() {
  return (
    <AuthGuard>
      <CircleMap />
    </AuthGuard>
  );
}
