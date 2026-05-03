create or replace function public.current_app_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.role
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    ),
    auth.jwt() -> 'user_metadata' ->> 'role',
    'User'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(public.current_app_role()) in ('admin', 'administrator');
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(public.current_app_role()) = 'teacher';
$$;

create or replace function public.is_parent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(public.current_app_role()) = 'parent';
$$;

create or replace function public.is_accountant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(public.current_app_role()) = 'accountant';
$$;

create or replace function public.is_secretary()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(public.current_app_role()) = 'secretary';
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.is_teacher()
    or public.is_accountant()
    or public.is_secretary();
$$;

grant execute on function public.current_app_email() to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.is_parent() to authenticated;
grant execute on function public.is_accountant() to authenticated;
grant execute on function public.is_secretary() to authenticated;
grant execute on function public.is_staff() to authenticated;

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_name text;
  derived_role text;
begin
  derived_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );
  derived_role := coalesce(new.raw_user_meta_data ->> 'role', 'User');

  insert into public.profiles (id, email, full_name, role, status)
  values (new.id, new.email, derived_name, derived_role, 'Active')
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role,
        status = coalesce(public.profiles.status, excluded.status);

  return new;
end;
$$;

drop trigger if exists sync_profile_from_auth on auth.users;
create trigger sync_profile_from_auth
after insert or update on auth.users
for each row execute function public.sync_profile_from_auth();

do $$
begin
  if to_regclass('public.profiles') is not null then
    grant select, insert, update on public.profiles to authenticated;
    alter table public.profiles enable row level security;
    drop policy if exists profiles_select on public.profiles;
    create policy profiles_select on public.profiles
      for select to authenticated
      using (public.is_staff() or id = auth.uid());
    drop policy if exists profiles_insert on public.profiles;
    create policy profiles_insert on public.profiles
      for insert to authenticated
      with check (public.is_admin() or id = auth.uid());
    drop policy if exists profiles_update on public.profiles;
    create policy profiles_update on public.profiles
      for update to authenticated
      using (public.is_admin() or id = auth.uid())
      with check (public.is_admin() or id = auth.uid());
  end if;

  if to_regclass('public.students') is not null then
    grant select, insert, update on public.students to authenticated;
    alter table public.students enable row level security;
    drop policy if exists students_select on public.students;
    create policy students_select on public.students
      for select to authenticated
      using (
        public.is_admin()
        or public.is_teacher()
        or public.is_secretary()
        or public.is_accountant()
        or (
          public.is_parent()
          and lower(coalesce(guardian_email, '')) = public.current_app_email()
        )
      );
    drop policy if exists students_insert on public.students;
    create policy students_insert on public.students
      for insert to authenticated
      with check (public.is_admin() or public.is_secretary());
    drop policy if exists students_update on public.students;
    create policy students_update on public.students
      for update to authenticated
      using (public.is_admin() or public.is_secretary())
      with check (public.is_admin() or public.is_secretary());
  end if;

  if to_regclass('public.teachers') is not null then
    grant select, insert, update on public.teachers to authenticated;
    alter table public.teachers enable row level security;
    drop policy if exists teachers_select on public.teachers;
    create policy teachers_select on public.teachers
      for select to authenticated
      using (
        public.is_admin()
        or public.is_secretary()
        or (
          public.is_teacher()
          and lower(coalesce(email, '')) = public.current_app_email()
        )
      );
    drop policy if exists teachers_insert on public.teachers;
    create policy teachers_insert on public.teachers
      for insert to authenticated
      with check (public.is_admin());
    drop policy if exists teachers_update on public.teachers;
    create policy teachers_update on public.teachers
      for update to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;

  if to_regclass('public.payments') is not null then
    grant select, insert on public.payments to authenticated;
    alter table public.payments enable row level security;
    drop policy if exists payments_select on public.payments;
    create policy payments_select on public.payments
      for select to authenticated
      using (public.is_admin() or public.is_accountant() or public.is_secretary());
    drop policy if exists payments_insert on public.payments;
    create policy payments_insert on public.payments
      for insert to authenticated
      with check (public.is_admin() or public.is_accountant());
  end if;

  if to_regclass('public.attendance') is not null then
    grant select, insert, update on public.attendance to authenticated;
    alter table public.attendance enable row level security;
    drop policy if exists attendance_select on public.attendance;
    create policy attendance_select on public.attendance
      for select to authenticated
      using (
        public.is_admin()
        or public.is_teacher()
        or public.is_secretary()
        or (
          public.is_parent()
          and exists (
            select 1
            from public.students s
            where s.full_name = student
              and lower(coalesce(s.guardian_email, '')) = public.current_app_email()
          )
        )
      );
    drop policy if exists attendance_insert on public.attendance;
    create policy attendance_insert on public.attendance
      for insert to authenticated
      with check (public.is_admin() or public.is_teacher() or public.is_secretary());
    drop policy if exists attendance_update on public.attendance;
    create policy attendance_update on public.attendance
      for update to authenticated
      using (public.is_admin() or public.is_teacher() or public.is_secretary())
      with check (public.is_admin() or public.is_teacher() or public.is_secretary());
  end if;

  if to_regclass('public.events') is not null then
    grant select, insert, update on public.events to authenticated;
    alter table public.events enable row level security;
    drop policy if exists events_select on public.events;
    create policy events_select on public.events
      for select to authenticated
      using (auth.uid() is not null);
    drop policy if exists events_insert on public.events;
    create policy events_insert on public.events
      for insert to authenticated
      with check (public.is_admin() or public.is_secretary());
    drop policy if exists events_update on public.events;
    create policy events_update on public.events
      for update to authenticated
      using (public.is_admin() or public.is_secretary())
      with check (public.is_admin() or public.is_secretary());
  end if;

  if to_regclass('public.inventory') is not null then
    grant select, insert on public.inventory to authenticated;
    alter table public.inventory enable row level security;
    drop policy if exists inventory_select on public.inventory;
    create policy inventory_select on public.inventory
      for select to authenticated
      using (public.is_admin() or public.is_accountant() or public.is_secretary());
    drop policy if exists inventory_insert on public.inventory;
    create policy inventory_insert on public.inventory
      for insert to authenticated
      with check (public.is_admin() or public.is_accountant() or public.is_secretary());
  end if;

  if to_regclass('public.grades') is not null then
    grant select, insert, update on public.grades to authenticated;
    alter table public.grades enable row level security;
    drop policy if exists grades_select on public.grades;
    create policy grades_select on public.grades
      for select to authenticated
      using (
        public.is_admin()
        or (
          public.is_teacher()
          and exists (
            select 1
            from public.teachers t
            where lower(coalesce(t.email, '')) = public.current_app_email()
              and coalesce(t.subject, '') = coalesce(subject, '')
              and coalesce(t.class_name, '') = coalesce(class_name, '')
          )
        )
        or (
          public.is_parent()
          and exists (
            select 1
            from public.students s
            where s.full_name = student
              and lower(coalesce(s.guardian_email, '')) = public.current_app_email()
          )
        )
      );
    drop policy if exists grades_insert on public.grades;
    create policy grades_insert on public.grades
      for insert to authenticated
      with check (
        public.is_admin()
        or (
          public.is_teacher()
          and exists (
            select 1
            from public.teachers t
            where lower(coalesce(t.email, '')) = public.current_app_email()
              and coalesce(t.subject, '') = coalesce(subject, '')
              and coalesce(t.class_name, '') = coalesce(class_name, '')
          )
        )
      );
    drop policy if exists grades_update on public.grades;
    create policy grades_update on public.grades
      for update to authenticated
      using (
        public.is_admin()
        or (
          public.is_teacher()
          and exists (
            select 1
            from public.teachers t
            where lower(coalesce(t.email, '')) = public.current_app_email()
              and coalesce(t.subject, '') = coalesce(subject, '')
              and coalesce(t.class_name, '') = coalesce(class_name, '')
          )
        )
      )
      with check (
        public.is_admin()
        or (
          public.is_teacher()
          and exists (
            select 1
            from public.teachers t
            where lower(coalesce(t.email, '')) = public.current_app_email()
              and coalesce(t.subject, '') = coalesce(subject, '')
              and coalesce(t.class_name, '') = coalesce(class_name, '')
          )
        )
      );
  end if;

  if to_regclass('public.classes') is not null then
    grant select on public.classes to authenticated;
    alter table public.classes enable row level security;
    drop policy if exists classes_select on public.classes;
    create policy classes_select on public.classes
      for select to authenticated
      using (public.is_admin() or public.is_teacher() or public.is_secretary());
  end if;

  if to_regclass('public.notifications') is not null then
    grant select, update on public.notifications to authenticated;
    alter table public.notifications enable row level security;
    drop policy if exists notifications_select on public.notifications;
    create policy notifications_select on public.notifications
      for select to authenticated
      using (auth.uid() is not null);
    drop policy if exists notifications_update on public.notifications;
    create policy notifications_update on public.notifications
      for update to authenticated
      using (auth.uid() is not null)
      with check (auth.uid() is not null);
  end if;

  if to_regclass('public.reports') is not null then
    grant select on public.reports to authenticated;
    alter table public.reports enable row level security;
    drop policy if exists reports_select on public.reports;
    create policy reports_select on public.reports
      for select to authenticated
      using (public.is_admin() or public.is_teacher() or public.is_accountant() or public.is_secretary());
  end if;

  if to_regclass('public.timetable_entries') is not null then
    grant select on public.timetable_entries to authenticated;
    alter table public.timetable_entries enable row level security;
    drop policy if exists timetable_entries_select on public.timetable_entries;
    create policy timetable_entries_select on public.timetable_entries
      for select to authenticated
      using (public.is_admin() or public.is_teacher() or public.is_secretary());
  end if;

  if to_regclass('public.homework_items') is not null then
    grant select on public.homework_items to authenticated;
    alter table public.homework_items enable row level security;
    drop policy if exists homework_items_select on public.homework_items;
    create policy homework_items_select on public.homework_items
      for select to authenticated
      using (public.is_admin() or public.is_teacher());
  end if;

  if to_regclass('public.payroll_entries') is not null then
    grant select on public.payroll_entries to authenticated;
    alter table public.payroll_entries enable row level security;
    drop policy if exists payroll_entries_select on public.payroll_entries;
    create policy payroll_entries_select on public.payroll_entries
      for select to authenticated
      using (public.is_admin() or public.is_accountant());
  end if;

  if to_regclass('public.account_entries') is not null then
    grant select on public.account_entries to authenticated;
    alter table public.account_entries enable row level security;
    drop policy if exists account_entries_select on public.account_entries;
    create policy account_entries_select on public.account_entries
      for select to authenticated
      using (public.is_admin() or public.is_accountant());
  end if;

  if to_regclass('public.school_settings') is not null then
    grant select on public.school_settings to authenticated;
    alter table public.school_settings enable row level security;
    drop policy if exists school_settings_select on public.school_settings;
    create policy school_settings_select on public.school_settings
      for select to authenticated
      using (public.is_admin());
  end if;

  if to_regclass('public.conversations') is not null then
    grant select, insert on public.conversations to authenticated;
    alter table public.conversations enable row level security;
    drop policy if exists conversations_select on public.conversations;
    create policy conversations_select on public.conversations
      for select to authenticated
      using (public.is_admin());
    drop policy if exists conversations_insert on public.conversations;
    create policy conversations_insert on public.conversations
      for insert to authenticated
      with check (public.is_admin());
  end if;
end
$$;
