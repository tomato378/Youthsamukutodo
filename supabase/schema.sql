-- ============================================================
-- Supabase schema for YouthSamuku event task manager
-- ============================================================
-- Run this in the Supabase SQL editor to set up the database.
-- After running, replace lib/storage.ts with a Supabase client
-- implementation using the same function signatures.
--
-- Future auth: enable RLS policies when you add login.
-- Future LINE notifications: use Supabase Edge Functions
--   triggered by database webhooks on task status changes
--   and scheduled cron jobs for due-date reminders.
-- ============================================================

-- Events table
create table if not exists events (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  date          date not null,
  time          text not null,          -- stored as HH:MM string
  venue         text not null,
  description   text,
  recruitment_start_date date,
  recruitment_deadline   date,
  members       text[] not null,        -- array of 3 member names
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Tasks table
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  title         text not null,
  assignee      text,                   -- member name, null = unassigned
  due_date      date not null,
  status        text not null default 'not_started'
                check (status in ('not_started', 'in_progress', 'waiting_review', 'done')),
  memo          text not null default '',
  template_key  text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes for common query patterns
create index if not exists tasks_event_id_idx on tasks(event_id);
create index if not exists tasks_status_idx   on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists tasks_assignee_idx on tasks(assignee);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security (enable when adding auth)
-- ============================================================
-- alter table events enable row level security;
-- alter table tasks  enable row level security;
--
-- Example policies (after adding user auth):
-- create policy "authenticated users can read events"
--   on events for select using (auth.role() = 'authenticated');
--
-- create policy "authenticated users can manage events"
--   on events for all using (auth.role() = 'authenticated');
--
-- create policy "authenticated users can manage tasks"
--   on tasks for all using (auth.role() = 'authenticated');

-- ============================================================
-- LINE Notification design notes
-- ============================================================
-- Recommended approach: Supabase Edge Functions + pg_cron
--
-- 1. Create a Supabase Edge Function `send-line-notification`
--    that accepts a message and calls the LINE Messaging API.
--
-- 2. Schedule a daily cron job (pg_cron) at 09:00 JST:
--    select cron.schedule('daily-task-reminders', '0 0 * * *', $$
--      select net.http_post(
--        url := 'https://<project>.supabase.co/functions/v1/send-line-notification',
--        body := json_build_object(
--          'overdue', (
--            select json_agg(t) from tasks t
--            where t.due_date < current_date and t.status != 'done'
--          ),
--          'due_today', (
--            select json_agg(t) from tasks t
--            where t.due_date = current_date and t.status != 'done'
--          ),
--          'unassigned', (
--            select json_agg(t) from tasks t
--            where t.assignee is null and t.status != 'done'
--          )
--        )::text,
--        headers := '{"Content-Type":"application/json"}'::jsonb
--      );
--    $$);
--
-- 3. Add a database webhook trigger on tasks.status for
--    'waiting_review' to notify all members immediately.
