create table if not exists conversations (
  id          uuid        primary key default gen_random_uuid(),
  session_id  text        not null,
  role        text        not null check (role in ('user', 'assistant')),
  content     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists conversations_session_created_idx
  on conversations (session_id, created_at desc);
