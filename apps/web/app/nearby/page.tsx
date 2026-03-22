"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "@/app/loading";

const RadarMap = dynamic(
  () => import("@/components/radar-map").then((m) => ({ default: m.RadarMap })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function NearbyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RadarMap />
    </Suspense>
  );
}
