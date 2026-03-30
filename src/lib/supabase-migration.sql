-- ============================================================
-- Life RPG - Supabase Migration
-- Paste this entire file into Supabase SQL Editor and run it.
-- ============================================================

-- 1. PROFILES (player state)
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_name text default '冒险者',
  total_exp integer default 0,
  stardust integer default 100,
  stamina integer default 100,
  max_stamina integer default 100,
  overflow_stamina integer default 150,
  streak_days integer default 0,
  achievement_points integer default 0,
  attribute_exp jsonb default '{"body":0,"mind":0,"craft":0,"social":0,"spirit":0,"wealth":0}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TASKS
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 3. TASK COMPLETIONS
create table task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 4. ACHIEVEMENTS
create table achievements (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

-- 5. EQUIPMENT
create table equipment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 6. SHOP DATA
create table shop_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  custom_rewards jsonb default '[]',
  inventory jsonb default '[]',
  monthly_purchases jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. BOSSES
create table bosses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 8. CALENDAR DATA
create table calendar_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  events jsonb default '[]',
  semester_config jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. PRINCIPLES DATA
create table principles_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  principles jsonb default '[]',
  decision_logs jsonb default '[]',
  goals jsonb default '[]',
  five_step_flows jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. MAINLINE QUESTS
create table mainline_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 11. GACHA DATA
create table gacha_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pools jsonb default '[]',
  history jsonb default '[]',
  pity jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

alter table profiles enable row level security;
create policy "Users can manage own profile" on profiles for all using (auth.uid() = user_id);

alter table tasks enable row level security;
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);

alter table task_completions enable row level security;
create policy "Users can manage own task_completions" on task_completions for all using (auth.uid() = user_id);

alter table achievements enable row level security;
create policy "Users can manage own achievements" on achievements for all using (auth.uid() = user_id);

alter table equipment enable row level security;
create policy "Users can manage own equipment" on equipment for all using (auth.uid() = user_id);

alter table shop_data enable row level security;
create policy "Users can manage own shop_data" on shop_data for all using (auth.uid() = user_id);

alter table bosses enable row level security;
create policy "Users can manage own bosses" on bosses for all using (auth.uid() = user_id);

alter table calendar_data enable row level security;
create policy "Users can manage own calendar_data" on calendar_data for all using (auth.uid() = user_id);

alter table principles_data enable row level security;
create policy "Users can manage own principles_data" on principles_data for all using (auth.uid() = user_id);

alter table mainline_quests enable row level security;
create policy "Users can manage own mainline_quests" on mainline_quests for all using (auth.uid() = user_id);

alter table gacha_data enable row level security;
create policy "Users can manage own gacha_data" on gacha_data for all using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE ROWS ON USER SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id) values (new.id);
  insert into public.shop_data (user_id) values (new.id);
  insert into public.calendar_data (user_id) values (new.id);
  insert into public.principles_data (user_id) values (new.id);
  insert into public.gacha_data (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
