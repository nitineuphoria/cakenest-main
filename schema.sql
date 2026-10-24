-- CakeNest Careers — D1 schema
-- Run: npx wrangler d1 execute cakenest-careers-db --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS jobs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  location  TEXT NOT NULL DEFAULT 'Remote',
  type      TEXT NOT NULL DEFAULT 'Full-time',
  description  TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  status    TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id       INTEGER,
  job_title    TEXT NOT NULL DEFAULT '',
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL DEFAULT '',
  cover_letter TEXT NOT NULL DEFAULT '',
  cv_key       TEXT,
  cv_filename  TEXT,
  status       TEXT NOT NULL DEFAULT 'new',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default content values
INSERT OR IGNORE INTO content (key, value) VALUES
  ('hero_title',    'Build the future of home baking with us.'),
  ('hero_subtitle', 'We are a small, passionate team helping India''s women home bakers learn, earn and build businesses. Come help us grow the movement.'),
  ('hero_image',    'women-community'),
  ('culture_title', 'Why work at CakeNest?'),
  ('culture_body',  'We are a mission-first team. Every line of code, every campaign, every class we run has one goal — helping women become entrepreneurs. If that excites you, you will fit right in.');
