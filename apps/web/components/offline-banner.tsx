"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-ink px-4 py-3 text-center text-sm text-white">
      Offline mode active. Cached screens remain available.
    </div>
  );
}
