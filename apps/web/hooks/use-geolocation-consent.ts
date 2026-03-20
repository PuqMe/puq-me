import { useState, useCallback } from "react";

const GEOLOCATION_CONSENT_KEY = "puqme.geolocation-consent";

export type GeolocationConsentStatus = "pending" | "granted" | "denied";

export function useGeolocationConsent() {
  const [status, setStatus] = useState<GeolocationConsentStatus>("pending");
  const [showDialog, setShowDialog] = useState(false);

  const checkConsent = useCallback((): GeolocationConsentStatus => {
    if (typeof window === "undefined") return "pending";

    const stored = localStorage.getItem(GEOLOCATION_CONSENT_KEY) as
      | GeolocationConsentStatus
      | null;
    if (stored) {
      setStatus(stored);
      return stored;
    }

    return "pending";
  }, []);

  const requestGeolocation = useCallback(
    (
      onSuccess: (position: GeolocationPosition) => void,
      onError?: (error: GeolocationPositionError) => void
    ) => {
      const currentStatus = checkConsent();

      if (currentStatus === "denied") {
        onError?.(
          { code: 1, message: "User denied geolocation permission", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError
        );
        return;
      }

      if (currentStatus === "pending") {
        setShowDialog(true);
        // Store callbacks in window for later use
        (window as any).__geolocationCallbacks = {
          onSuccess,
          onError,
        };
        return;
      }

      // Status is "granted", request geolocation
      if (!navigator.geolocation) {
        onError?.(
          { code: 2, message: "Geolocation not supported", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        timeout: 8000,
        maximumAge: 60000,
      });
    },
    [checkConsent]
  );

  const handleAllow = useCallback(() => {
    localStorage.setItem(GEOLOCATION_CONSENT_KEY, "granted");
    setStatus("granted");
    setShowDialog(false);

    const callbacks = (window as any).__geolocationCallbacks;
    if (callbacks?.onSuccess && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        callbacks.onSuccess,
        callbacks.onError,
        { timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleDeny = useCallback(() => {
    localStorage.setItem(GEOLOCATION_CONSENT_KEY, "denied");
    setStatus("denied");
    setShowDialog(false);

    const callbacks = (window as any).__geolocationCallbacks;
    if (callbacks?.onError) {
      callbacks.onError(
        { code: 1, message: "User denied geolocation permission", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError
      );
    }
  }, []);

  return {
    status,
    showDialog,
    checkConsent,
    requestGeolocation,
    handleAllow,
    handleDeny,
  };
}
