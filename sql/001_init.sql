CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(80) NOT NULL,
    birth_date DATE NOT NULL,
    bio TEXT,
    gender VARCHAR(32),
    interested_in VARCHAR(32),
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_photos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE,
    cdn_url TEXT,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    width INT,
    height INT,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (moderation_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS profile_photo_variants (
    id BIGSERIAL PRIMARY KEY,
    photo_id BIGINT NOT NULL REFERENCES profile_photos(id) ON DELETE CASCADE,
    variant_name VARCHAR(20) NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    cdn_url TEXT,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    width INT,
    height INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (photo_id, variant_name)
);

CREATE TABLE IF NOT EXISTS swipes (
    id BIGSERIAL,
    actor_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right', 'super')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (actor_user_id, id),
    UNIQUE (actor_user_id, target_user_id)
) PARTITION BY HASH (actor_user_id);

CREATE TABLE IF NOT EXISTS swipes_p0 PARTITION OF swipes
FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE IF NOT EXISTS swipes_p1 PARTITION OF swipes
FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE IF NOT EXISTS swipes_p2 PARTITION OF swipes
FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE IF NOT EXISTS swipes_p3 PARTITION OF swipes
FOR VALUES WITH (MODULUS 4, REMAINDER 3);

CREATE TABLE IF NOT EXISTS matches (
    id BIGSERIAL PRIMARY KEY,
    user_low_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_high_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user_low_id < user_high_id),
    UNIQUE (user_low_id, user_high_id)
);

CREATE TABLE IF NOT EXISTS match_participants (
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_threads (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL,
    thread_id BIGINT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    body TEXT,
    image_url TEXT,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    PRIMARY KEY (id, sent_at)
) PARTITION BY RANGE (sent_at);

CREATE TABLE IF NOT EXISTS messages_2026_03 PARTITION OF messages
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'in_app',
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    priority VARCHAR(20) NOT NULL DEFAULT 'active',
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (channel IN ('push', 'web_push', 'in_app', 'email')),
    CHECK (status IN ('queued', 'sent', 'failed', 'read')),
    CHECK (priority IN ('active', 'silent'))
);

CREATE TABLE IF NOT EXISTS notification_devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    token TEXT NOT NULL,
    endpoint TEXT,
    p256dh TEXT,
    auth_secret TEXT,
    user_agent TEXT,
    locale VARCHAR(16),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, token),
    CHECK (platform IN ('web', 'ios', 'android')),
    CHECK (provider IN ('web_push', 'fcm', 'apns'))
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    new_match BOOLEAN NOT NULL DEFAULT TRUE,
    new_message BOOLEAN NOT NULL DEFAULT TRUE,
    message_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    profile_approved BOOLEAN NOT NULL DEFAULT TRUE,
    safety_warning BOOLEAN NOT NULL DEFAULT TRUE,
    product_updates BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start SMALLINT,
    quiet_hours_end SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_outbox (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(80) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (channel IN ('push', 'web_push', 'in_app', 'email')),
    CHECK (priority IN ('active', 'silent')),
    CHECK (status IN ('pending', 'processed', 'failed'))
);

CREATE TABLE IF NOT EXISTS billing_products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    product_type VARCHAR(20) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (product_type IN ('subscription', 'consumable'))
);

CREATE TABLE IF NOT EXISTS billing_prices (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES billing_products(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    provider_price_id VARCHAR(120),
    currency CHAR(3) NOT NULL,
    amount_cents INT NOT NULL,
    interval_unit VARCHAR(20),
    interval_count INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (provider IN ('stripe', 'app_store', 'google_play', 'manual')),
    CHECK (interval_unit IS NULL OR interval_unit IN ('week', 'month', 'year'))
);

CREATE TABLE IF NOT EXISTS billing_provider_customers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    provider_customer_id VARCHAR(150) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_customer_id),
    UNIQUE (user_id, provider),
    CHECK (provider IN ('stripe', 'app_store', 'google_play', 'manual'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES billing_products(id) ON DELETE RESTRICT,
    provider VARCHAR(20) NOT NULL,
    provider_subscription_id VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_subscription_id),
    CHECK (provider IN ('stripe', 'app_store', 'google_play', 'manual')),
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete'))
);

CREATE TABLE IF NOT EXISTS user_entitlements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_code VARCHAR(50) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    source_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (feature_code IN ('unlimited_likes', 'boost', 'super_likes', 'advanced_filters', 'passport_mode', 'profile_visitors')),
    CHECK (source_type IN ('subscription', 'purchase', 'grant')),
    CHECK (status IN ('active', 'expired', 'revoked'))
);

CREATE TABLE IF NOT EXISTS user_feature_overrides (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_code VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL,
    reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, feature_code),
    CHECK (feature_code IN ('unlimited_likes', 'boost', 'super_likes', 'advanced_filters', 'passport_mode', 'profile_visitors'))
);

CREATE TABLE IF NOT EXISTS user_credit_wallets (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    boost_credits INT NOT NULL DEFAULT 0,
    super_like_credits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_checkout_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_id BIGINT NOT NULL REFERENCES billing_prices(id) ON DELETE RESTRICT,
    provider VARCHAR(20) NOT NULL,
    provider_checkout_id VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    success_url TEXT NOT NULL,
    cancel_url TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (provider IN ('stripe', 'app_store', 'google_play', 'manual')),
    CHECK (status IN ('pending', 'ready', 'completed', 'expired', 'failed'))
);

CREATE TABLE IF NOT EXISTS billing_provider_events (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    external_event_id VARCHAR(180) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, external_event_id),
    CHECK (provider IN ('stripe', 'app_store', 'google_play', 'manual')),
    CHECK (status IN ('pending', 'processed', 'failed'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    anonymous_id VARCHAR(128),
    session_id VARCHAR(128),
    event_name VARCHAR(80) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    country_code CHAR(2),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    experiment_key VARCHAR(80),
    experiment_variant VARCHAR(80),
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (event_name IN (
      'auth.registered',
      'onboarding.abandoned',
      'profile.completed',
      'media.photo_uploaded',
      'swipe.created',
      'match.created',
      'chat.message_sent',
      'retention.app_opened',
      'billing.premium_converted',
      'experiment.exposed',
      'feature_flag.evaluated'
    )),
    CHECK (platform IN ('web', 'ios', 'android', 'server'))
);

CREATE TABLE IF NOT EXISTS analytics_daily_kpis (
    day DATE PRIMARY KEY,
    registrations INT NOT NULL DEFAULT 0,
    onboarding_abandons INT NOT NULL DEFAULT 0,
    profile_completions INT NOT NULL DEFAULT 0,
    photo_uploads INT NOT NULL DEFAULT 0,
    swipes INT NOT NULL DEFAULT 0,
    matches INT NOT NULL DEFAULT 0,
    messages INT NOT NULL DEFAULT 0,
    retention_opens INT NOT NULL DEFAULT 0,
    premium_conversions INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_retention_cohorts (
    cohort_day DATE NOT NULL,
    retention_day INT NOT NULL,
    retained_users INT NOT NULL DEFAULT 0,
    cohort_size INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cohort_day, retention_day)
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(80) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    audience_type VARCHAR(20) NOT NULL DEFAULT 'all',
    audience_value VARCHAR(80),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (type IN ('release', 'ops', 'permission')),
    CHECK (audience_type IN ('all', 'authenticated', 'premium', 'country'))
);

CREATE TABLE IF NOT EXISTS feature_flag_user_overrides (
    id BIGSERIAL PRIMARY KEY,
    feature_flag_id BIGINT NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (feature_flag_id, user_id)
);

CREATE TABLE IF NOT EXISTS experiments (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(80) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    audience_type VARCHAR(20) NOT NULL DEFAULT 'all',
    audience_value VARCHAR(80),
    hypothesis TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    CHECK (audience_type IN ('all', 'authenticated', 'premium', 'country'))
);

CREATE TABLE IF NOT EXISTS experiment_variants (
    id BIGSERIAL PRIMARY KEY,
    experiment_id BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    key VARCHAR(80) NOT NULL,
    variant_key VARCHAR(80) NOT NULL,
    weight INT NOT NULL DEFAULT 1,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (experiment_id, variant_key)
);

CREATE TABLE IF NOT EXISTS experiment_assignments (
    id BIGSERIAL PRIMARY KEY,
    experiment_id BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_key VARCHAR(80) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exposed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (experiment_id, user_id)
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL DEFAULT 'user',
    target_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    target_message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    resolution TEXT,
    assigned_admin_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (target_type IN ('user', 'profile', 'message')),
    CHECK (status IN ('open', 'in_review', 'resolved', 'rejected')),
    CHECK (
      (target_type IN ('user', 'profile') AND target_user_id IS NOT NULL AND target_message_id IS NULL)
      OR (target_type = 'message' AND target_message_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS blocked_users (
    blocker_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_user_id, blocked_user_id),
    CHECK (blocker_user_id <> blocked_user_id)
);

CREATE TABLE IF NOT EXISTS report_admin_notes (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    admin_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_risk_scores (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
    review_status VARCHAR(20) NOT NULL DEFAULT 'clear',
    auto_action VARCHAR(30) NOT NULL DEFAULT 'none',
    reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    last_evaluated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    CHECK (review_status IN ('clear', 'watch', 'needs_review', 'restricted')),
    CHECK (auto_action IN ('none', 'watch', 'throttle', 'verification_required', 'manual_review'))
);

CREATE TABLE IF NOT EXISTS user_risk_signals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_type VARCHAR(40) NOT NULL,
    signal_key VARCHAR(80) NOT NULL,
    score_delta NUMERIC(5,2) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (signal_type IN ('registration_speed', 'swipe_behavior', 'message_duplication', 'profile_text', 'photo_pattern', 'report_spike')),
    CHECK (severity IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS moderation_escalations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(40) NOT NULL,
    reason VARCHAR(120) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    recommended_action VARCHAR(30) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (source IN ('registration', 'swipe', 'chat', 'profile_update', 'photo_upload', 'report_spike', 'manual')),
    CHECK (status IN ('open', 'acknowledged', 'resolved')),
    CHECK (recommended_action IN ('none', 'watch', 'throttle', 'verification_required', 'manual_review'))
);

CREATE TABLE IF NOT EXISTS user_communication_risk_scores (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    last_message_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    review_status VARCHAR(20) NOT NULL DEFAULT 'clear',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (review_status IN ('clear', 'watch', 'needs_review'))
);

CREATE TABLE IF NOT EXISTS message_risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    user_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    action VARCHAR(30) NOT NULL,
    labels TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    dangerous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (action IN ('allow', 'mark_review', 'throttle_sender', 'block_message', 'escalate_moderation'))
);

CREATE INDEX IF NOT EXISTS idx_photos_user_order ON photos(user_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS uq_photos_primary ON photos(user_id) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_order ON profile_photos(user_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_photos_primary ON profile_photos(user_id) WHERE is_primary = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_status ON profile_photos(user_id, moderation_status, sort_order);
CREATE INDEX IF NOT EXISTS idx_profile_photo_variants_photo ON profile_photo_variants(photo_id, variant_name);
CREATE INDEX IF NOT EXISTS idx_swipes_actor_created ON swipes(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_target_direction_created ON swipes(target_user_id, direction, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_low_matched ON matches(user_low_id, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_high_matched ON matches(user_high_id, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_participants_user ON match_participants(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message ON chat_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_sent ON messages(thread_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_status ON messages(thread_id, delivery_status, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status_created ON notifications(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_devices_user_active ON notification_devices(user_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_status_created ON notification_outbox(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_user_created ON notification_outbox(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_prices_product_active ON billing_prices(product_id, is_active, amount_cents);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_end ON subscriptions(user_id, status, current_period_end DESC);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_status_feature ON user_entitlements(user_id, status, feature_code);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user_feature ON user_feature_overrides(user_id, feature_code);
CREATE INDEX IF NOT EXISTS idx_billing_checkout_sessions_user_created ON billing_checkout_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_provider_events_status_created ON billing_provider_events(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_occurred ON analytics_events(event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_occurred ON analytics_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_anonymous_occurred ON analytics_events(anonymous_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_platform_occurred ON analytics_events(platform, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_active_key ON feature_flags(is_active, key);
CREATE INDEX IF NOT EXISTS idx_feature_flag_user_overrides_user ON feature_flag_user_overrides(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_experiments_status_key ON experiments(status, key);
CREATE INDEX IF NOT EXISTS idx_experiment_variants_experiment_active ON experiment_variants(experiment_id, is_active);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_user_experiment ON experiment_assignments(user_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_created ON reports(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target_message_created ON reports(target_message_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_admin_notes_report_created ON report_admin_notes(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_entity_created ON moderation_audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_risk_scores_level_updated ON user_risk_scores(risk_level, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_risk_signals_user_occurred ON user_risk_signals(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_escalations_status_created ON moderation_escalations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_communication_risk_scores_review_updated ON user_communication_risk_scores(review_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_risk_assessments_message_created ON message_risk_assessments(message_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_risk_assessments_user_created ON message_risk_assessments(user_id, created_at DESC);
