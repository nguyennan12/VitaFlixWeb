-- VitaFlix PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    movie_name VARCHAR(255) NOT NULL,
    origin_name VARCHAR(255),
    poster_url TEXT,
    thumb_url TEXT,
    episode_index INT NOT NULL DEFAULT 0,
    episode_name VARCHAR(100),
    current_time_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_slug)
);

CREATE INDEX IF NOT EXISTS idx_watch_history_user_updated ON watch_history(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    movie_name VARCHAR(255) NOT NULL,
    origin_name VARCHAR(255),
    poster_url TEXT,
    thumb_url TEXT,
    year INT,
    quality VARCHAR(50),
    episode_current VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_slug)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites(user_id, created_at DESC);
