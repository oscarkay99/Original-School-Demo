alter table if exists public.events
add column if not exists description text;
