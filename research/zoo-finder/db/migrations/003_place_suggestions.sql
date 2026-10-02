-- Suggestions from the "Don't see your place?" form on /zoos/ (Pages Function functions/api/suggest-place.js writes here). Reviewed by hand before anything is added to places.
CREATE TABLE IF NOT EXISTS place_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  establishment TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  animal TEXT,
  address TEXT NOT NULL,
  website TEXT,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new'   -- new | added | declined | duplicate
);
