"use client";

// Web Vitals tracking — CLS, LCP, FID, INP, FCP, TTFB
// Uses PerformanceObserver API (no external dependency needed)

export type WebVitalMetric = {
  name: "CLS" | "LCP" | "FID" | "INP" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
};

const THRESHOLDS: Record<string, [number, number]> = {
  CLS: [0.1, 0.25],
  LCP: [2500, 4000],
  FID: [100, 300],
  INP: [200, 500],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function getRating(name: string, value: number): WebVitalMetric["rating"] {
  const t = THRESHOLDS[name];
  if (!t) return "good";
  if (value <= t[0]) return "good";
  if (value <= t[1]) return "needs-improvement";
  return "poor";
}

function generateId() {
  return `v1-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const STORAGE_KEY = "puqme.webvitals.v1";

function storeMetric(metric: WebVitalMetric) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const metrics: WebVitalMetric[] = raw ? JSON.parse(raw) : [];
    metrics.push(metric);
    // Keep last 100 entries
    if (metrics.length > 100) metrics.splice(0, metrics.length - 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch {}
}

export function getStoredVitals(): WebVitalMetric[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function onMetric(name: string, value: number) {
  const metric: WebVitalMetric = {
    name: name as WebVitalMetric["name"],
    value,
    rating: getRating(name, value),
    delta: value,
    id: generateId(),
  };
  storeMetric(metric);

  // Log poor metrics for debugging
  if (metric.rating === "poor") {
    console.warn(`[PuQ.me WebVital] ${name}: ${value.toFixed(2)} (${metric.rating})`);
  }
}

export function initWebVitals() {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;

  // CLS
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // Report on page hide
    const reportCLS = () => onMetric("CLS", clsValue);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") reportCLS();
    });
  } catch {}

  // LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) onMetric("LCP", last.startTime);
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  // FID
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      if (entry) onMetric("FID", (entry as any).processingStart - entry.startTime);
    });
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch {}

  // FCP
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          onMetric("FCP", entry.startTime);
        }
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {}

  // TTFB
  try {
    const navObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as PerformanceNavigationTiming;
      if (entry) onMetric("TTFB", entry.responseStart - entry.requestStart);
    });
    navObserver.observe({ type: "navigation", buffered: true });
  } catch {}
}
