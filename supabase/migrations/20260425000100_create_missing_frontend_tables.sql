create table if not exists public.timetable_entries (
  id text primary key,
  class_name text not null,
  day_of_week text not null,
  period_label text not null,
  subject text not null,
  teacher_name text,
  room text,
  created_at timestamp with time zone default now()
);

create table if not exists public.homework_items (
  id text primary key,
  title text not null,
  class_name text not null,
  subject text not null,
  due_date date,
  status text default 'Assigned',
  description text,
  created_at timestamp with time zone default now()
);

create table if not exists public.payroll_entries (
  id text primary key,
  staff_name text not null,
  role text,
  salary numeric default 0,
  allowance numeric default 0,
  deduction numeric default 0,
  status text default 'Pending',
  pay_date date,
  created_at timestamp with time zone default now()
);

create table if not exists public.account_entries (
  id text primary key,
  account_name text not null,
  account_type text not null,
  balance numeric default 0,
  currency text default 'GHS',
  status text default 'Active',
  created_at timestamp with time zone default now()
);

create table if not exists public.school_settings (
  id text primary key,
  school_name text not null,
  motto text,
  email text,
  phone text,
  address text,
  notifications_enabled boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
