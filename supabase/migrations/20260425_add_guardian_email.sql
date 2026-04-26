alter table students add column if not exists guardian_email text;
create index if not exists idx_students_guardian_email on students (guardian_email);
