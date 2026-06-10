-- Tollytics — Tabel Analytics
-- Jalankan SQL ini di Supabase SQL Editor
-- =========================================

CREATE TABLE IF NOT EXISTS analytics_weekly (
    id BIGSERIAL PRIMARY KEY,
    week_start DATE NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    completed_transactions INT DEFAULT 0,
    total_revenue NUMERIC(14,2) DEFAULT 0,
    avg_fee NUMERIC(10,2) DEFAULT 0,
    avg_distance_km NUMERIC(8,2) DEFAULT 0,
    avg_duration_min NUMERIC(8,2) DEFAULT 0,
    unique_cards INT DEFAULT 0,
    unique_vehicles INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_monthly (
    id BIGSERIAL PRIMARY KEY,
    month DATE NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    total_revenue NUMERIC(14,2) DEFAULT 0,
    avg_fee NUMERIC(10,2) DEFAULT 0,
    avg_distance_km NUMERIC(8,2) DEFAULT 0,
    unique_cards INT DEFAULT 0,
    unique_vehicles INT DEFAULT 0,
    active_gates INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
