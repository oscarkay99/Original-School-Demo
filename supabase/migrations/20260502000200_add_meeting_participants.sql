alter table if exists public.meetings
  add column if not exists participant_emails text;
