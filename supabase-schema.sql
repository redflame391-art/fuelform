-- Optional cloud-sync foundation for a later iteration.
-- Run only in a new Supabase project after enabling Auth.
-- This schema alone does not connect the current local-only MVP to cloud sync.
create table if not exists public.food_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  entry_time timestamptz not null default now(),
  name text not null,
  meal text not null,
  quantity numeric not null default 1,
  unit text,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric,
  sugar numeric,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  weight_kg numeric not null check(weight_kg > 0),
  created_at timestamptz not null default now(),
  unique(user_id, entry_date)
);
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  targets jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.food_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.user_settings enable row level security;
create policy "Users manage own food logs" on public.food_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own weight logs" on public.weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own settings" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);