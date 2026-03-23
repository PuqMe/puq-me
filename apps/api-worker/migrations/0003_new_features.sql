-- PuQ.me D1 Schema Extension: Neue Features
-- Intents, Micro Cards, Followers, Groups, Visibility, Buzz, Calm Mode, Auto-Vanish, Encounters

-- ========== FOLLOWERS ==========

CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (follower_user_id, following_user_id),
    CHECK (follower_user_id <> following_user_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_user_id, created_at);

-- ========== INTENTS ==========

CREATE TABLE IF NOT EXISTS intents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('kaffee', 'sport', 'coworking', 'netzwerken', 'essen', 'chillen', 'events', 'sonstiges')),
    note TEXT,
    duration_hours REAL NOT NULL DEFAULT 2,
    latitude REAL,
    longitude REAL,
    is_active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_intents_user_active ON intents(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_intents_active_expires ON intents(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_intents_category_active ON intents(category, is_active);

-- ========== MICRO CARDS ==========

CREATE TABLE IF NOT EXISTS micro_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL DEFAULT '📋',
    action TEXT NOT NULL,
    description TEXT,
    latitude REAL,
    longitude REAL,
    max_participants INTEGER DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS micro_card_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES micro_cards(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'join' CHECK (reaction_type IN ('join', 'like', 'wave')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (card_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_micro_cards_user_active ON micro_cards(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_micro_cards_active_expires ON micro_cards(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_micro_card_reactions_card ON micro_card_reactions(card_id);

-- ========== GROUPS (Gruppen-Intent) ==========

CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '👥',
    location_name TEXT,
    latitude REAL,
    longitude REAL,
    max_participants INTEGER NOT NULL DEFAULT 10,
    scheduled_at TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'member')),
    joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_groups_active ON groups(is_active, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- ========== ENCOUNTERS (Begegnungen) ==========

CREATE TABLE IF NOT EXISTS encounters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encountered_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude REAL,
    longitude REAL,
    distance_meters REAL,
    encounter_count INTEGER NOT NULL DEFAULT 1,
    first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (user_id, encountered_user_id)
);

CREATE INDEX IF NOT EXISTS idx_encounters_user ON encounters(user_id, last_seen_at);
CREATE INDEX IF NOT EXISTS idx_encounters_pair ON encounters(user_id, encountered_user_id);

-- ========== VISIBILITY SETTINGS ==========

CREATE TABLE IF NOT EXISTS visibility_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'global' CHECK (mode IN ('global', 'region', 'phantom', 'zero', 'freunde', 'nur_diese_freunde', 'ausser_freunde', 'gruppe')),
    region_type TEXT CHECK (region_type IN ('stadt', 'bezirk', 'strasse')),
    selected_friends TEXT DEFAULT '[]',
    selected_group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    scan_radius_km REAL NOT NULL DEFAULT 5,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ========== BUZZ SETTINGS ==========

CREATE TABLE IF NOT EXISTS buzz_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vibration_enabled INTEGER NOT NULL DEFAULT 1,
    buzz_radius_meters INTEGER NOT NULL DEFAULT 200,
    only_matching_intents INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS buzz_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT CHECK (action IN ('wave', 'ignore', 'pending')),
    distance_meters REAL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_buzz_events_user ON buzz_events(user_id, created_at);

-- ========== AUTO-VANISH SETTINGS ==========

CREATE TABLE IF NOT EXISTS auto_vanish_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    profile_visible INTEGER NOT NULL DEFAULT 1,
    profile_expires_at TEXT,
    intent_expires_at TEXT,
    card_expires_at TEXT,
    next_activation_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ========== CALM MODE SETTINGS ==========

CREATE TABLE IF NOT EXISTS calm_mode_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    daily_limit_enabled INTEGER NOT NULL DEFAULT 0,
    daily_limit_encounters INTEGER NOT NULL DEFAULT 3,
    night_mode_enabled INTEGER NOT NULL DEFAULT 0,
    night_mode_start TEXT DEFAULT '22:00',
    night_mode_end TEXT DEFAULT '07:00',
    weekly_report_enabled INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS calm_mode_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    encounters_count INTEGER NOT NULL DEFAULT 0,
    conversations_count INTEGER NOT NULL DEFAULT 0,
    minutes_active INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_calm_mode_stats_user ON calm_mode_stats(user_id, date);

-- ========== INTERESTS / HOBBIES ==========

CREATE TABLE IF NOT EXISTS user_interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (user_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest);

-- ========== BADGES ==========

CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'level', 'streak', 'explorer', 'connector', 'early_adopter')),
    badge_level INTEGER NOT NULL DEFAULT 1,
    earned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- ========== CIRCLES (Freundeskreise) ==========

CREATE TABLE IF NOT EXISTS circles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '👥',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS circle_members (
    circle_id INTEGER NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_circles_creator ON circles(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);
