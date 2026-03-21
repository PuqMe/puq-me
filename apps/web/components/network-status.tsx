"use client";

import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [status, setStatus] = useState<"online" | "offline" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setStatus("online");
      setMessage("✅ Wieder online");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setStatus("offline");
      setMessage("📡 Du bist offline — zeige zwischengespeicherte Daten");
      setShowToast(true);
    };

    // Set initial status
    setStatus(navigator.onLine ? "online" : "offline");
    if (!navigator.onLine) {
      setMessage("📡 Du bist offline — zeige zwischengespeicherte Daten");
      setShowToast(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      background: "rgba(12, 8, 28, 0.95)",
      border: "1px solid rgba(168, 85, 247, 0.2)",
      borderRadius: 12,
      padding: "12px 20px",
      fontSize: 13,
      color: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px)",
      whiteSpace: "nowrap",
      fontFamily: "system-ui, sans-serif",
    }}>
      {message}
    </div>
  );
}
