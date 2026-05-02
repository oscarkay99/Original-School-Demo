CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'General',
  description TEXT,
  scheduled_date TEXT,
  scheduled_time TEXT DEFAULT '09:00',
  room_name TEXT NOT NULL UNIQUE,
  host_name TEXT,
  status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_meetings"
  ON meetings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_insert_meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_meetings"
  ON meetings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_meetings"
  ON meetings FOR DELETE
  USING (auth.role() = 'authenticated');
