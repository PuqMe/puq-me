import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { RadarMap } from "@/components/radar-map";

export const metadata: Metadata = {
  title: "In der Nähe • Entdecke Menschen um dich herum"
};

export default function NearbyPage() {
  return (
    <AuthGuard>
      <RadarMap />
    </AuthGuard>
  );
}
