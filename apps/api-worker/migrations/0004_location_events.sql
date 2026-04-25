-- PuQ.me D1 Schema Extension: location_events
-- Coarse location ping persistence for circle/encounter mining
--
-- Privacy: lat/lon are intentionally COARSE (>= 100m accuracy enforced server-side
-- via radius binning when reading; raw values stored only for short-term encounter
-- mining). Old rows (> 30 days) MUST be purged via scheduled cleanup.

CREATE TABLE IF NOT EXISTS location_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    accuracy_meters REAL NOT NULL DEFAULT 250,
    -- Optional client-supplied capture time (ISO 8601). Server fills if absent.
    captured_at TEXT,
    -- Server receive time, never client-controllable.
    server_received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (lat >= -90 AND lat <= 90),
    CHECK (lon >= -180 AND lon <= 180),
    CHECK (accuracy_meters > 0 AND accuracy_meters <= 25000)
);

-- Hot-path index: "most recent N events for user X" (encounter scan)
CREATE INDEX IF NOT EXISTS idx_location_events_user_recent
    ON location_events(user_id, server_received_at DESC);

-- Retention/cleanup index: "all events older than X" for the purge job
CREATE INDEX IF NOT EXISTS idx_location_events_received_at
    ON location_events(server_received_at);
