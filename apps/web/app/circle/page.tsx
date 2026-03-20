import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { CircleMap } from "@/components/circle-map";

export const metadata: Metadata = {
  title: "Circle – Begegnungen • PuQ.me",
  description: "Entdecke wer in deiner Nähe war",
  openGraph: {
    title: "Circle – Begegnungen • PuQ.me",
    description: "Entdecke wer in deiner Nähe war",
  },
};

export default function CirclePage() {
  return (
    <AuthGuard>
      <CircleMap />
    </AuthGuard>
  );
}
