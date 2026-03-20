"use client";

// Watch-Time Tracking with Intersection Observer
// Tracks how long a user views each profile/card element

export type WatchTimeEvent = {
  targetId: string;
  targetType: 'profile' | 'card' | 'encounter' | 'match' | 'group';
  watchMs: number;
  visiblePercent: number;
  scrollDepth: number;
  timestamp: string;
};

// Storage key for events
const EVENTS_KEY = 'puqme.watchtime.events.v1';
const SESSIONS_KEY = 'puqme.watchtime.sessions.v1';

// Session tracking
export type WatchSession = {
  sessionId: string;
  startedAt: string;
  lastActiveAt: string;
  totalWatchMs: number;
  eventsCount: number;
  pagesViewed: string[];
};

// Create unique session ID
function generateSessionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Get or create current session
export function getCurrentSession(): WatchSession {
  if (typeof window === 'undefined') return createNewSession();

  const raw = localStorage.getItem(SESSIONS_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw) as WatchSession;
      // Session expires after 30 min inactivity
      const lastActive = new Date(session.lastActiveAt).getTime();
      if (Date.now() - lastActive < 30 * 60 * 1000) {
        return session;
      }
    } catch {}
  }
  return createNewSession();
}

function createNewSession(): WatchSession {
  const session: WatchSession = {
    sessionId: generateSessionId(),
    startedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    totalWatchMs: 0,
    eventsCount: 0,
    pagesViewed: [],
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(session));
  }
  return session;
}

function updateSession(watchMs: number, page?: string) {
  if (typeof window === 'undefined') return;
  const session = getCurrentSession();
  session.lastActiveAt = new Date().toISOString();
  session.totalWatchMs += watchMs;
  session.eventsCount += 1;
  if (page && !session.pagesViewed.includes(page)) {
    session.pagesViewed.push(page);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(session));
}

// Store watch event
export function recordWatchEvent(event: WatchTimeEvent) {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(EVENTS_KEY);
  let events: WatchTimeEvent[] = [];
  try { events = raw ? JSON.parse(raw) : []; } catch {}

  events.push(event);
  // Keep last 500 events
  if (events.length > 500) events = events.slice(-500);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

  updateSession(event.watchMs, event.targetType);
}

// Get recent events for analysis
export function getRecentEvents(limit = 100): WatchTimeEvent[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(EVENTS_KEY);
  try {
    const events = raw ? JSON.parse(raw) as WatchTimeEvent[] : [];
    return events.slice(-limit);
  } catch { return []; }
}

// Intersection Observer manager for tracking visible elements
export class WatchTimeTracker {
  private observers: Map<string, IntersectionObserver> = new Map();
  private timers: Map<string, { startTime: number; totalMs: number; visible: boolean }> = new Map();
  private onEvent: (event: WatchTimeEvent) => void;

  constructor(onEvent?: (event: WatchTimeEvent) => void) {
    this.onEvent = onEvent || recordWatchEvent;
  }

  observe(element: HTMLElement, targetId: string, targetType: WatchTimeEvent['targetType']) {
    if (this.observers.has(targetId)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const timer = this.timers.get(targetId) || { startTime: 0, totalMs: 0, visible: false };

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Start timing
            timer.startTime = performance.now();
            timer.visible = true;
          } else if (timer.visible) {
            // Stop timing
            const elapsed = performance.now() - timer.startTime;
            timer.totalMs += elapsed;
            timer.visible = false;

            // Record event if watched for at least 500ms
            if (elapsed >= 500) {
              this.onEvent({
                targetId,
                targetType,
                watchMs: Math.round(elapsed),
                visiblePercent: Math.round(entry.intersectionRatio * 100),
                scrollDepth: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) || 0,
                timestamp: new Date().toISOString(),
              });
            }
          }

          this.timers.set(targetId, timer);
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    );

    observer.observe(element);
    this.observers.set(targetId, observer);
  }

  // Flush all pending timers (call on unmount)
  flush() {
    this.timers.forEach((timer, targetId) => {
      if (timer.visible && timer.startTime > 0) {
        const elapsed = performance.now() - timer.startTime;
        timer.totalMs += elapsed;
        timer.visible = false;

        if (elapsed >= 500) {
          this.onEvent({
            targetId,
            targetType: 'profile',
            watchMs: Math.round(elapsed),
            visiblePercent: 100,
            scrollDepth: 0,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  }

  disconnect() {
    this.flush();
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.timers.clear();
  }
}

// React hook for watch-time tracking
export function createWatchTimeRef(tracker: WatchTimeTracker, targetId: string, targetType: WatchTimeEvent['targetType']) {
  return (element: HTMLElement | null) => {
    if (element) {
      tracker.observe(element, targetId, targetType);
    }
  };
}
