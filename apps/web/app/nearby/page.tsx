import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { RadarMap } from "@/components/radar-map";

export const metadata: Metadata = {
  title: "Nearby • Find people near you"
};

export default function NearbyPage() {
  return (
    <AuthGuard>
      <RadarMap />
    </AuthGuard>
  );
}
