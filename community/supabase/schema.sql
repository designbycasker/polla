-- Users
create table public.users (
  id text primary key,
  email text unique not null,
  name text,
  avatar_url text,
  bio text,
  provider text not null default 'kakao',
  -- 인구통계 (온보딩 시 수집)
  gender text check (gender in ('male', 'female', 'other')),
  age_group text check (age_group in ('10s', '20s', '30s', '40s', '50s', '60s+')),
  region text,
  political_leaning text check (political_leaning in ('progressive', 'moderate', 'conservative', 'none')),
  onboarding_completed boolean not null default false,
  created_at timestamptz default now()
);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default '자유',
  like_count int not null default 0,
  comment_count int not null default 0,
  view_count int not null default 0,
  is_poll boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id text references public.users(id) on delete cascade,
  content text not null,
  like_count int not null default 0,
  created_at timestamptz default now()
);

-- Likes
create table public.likes (
  user_id text references public.users(id) on delete cascade,
  target_id uuid not null,
  target_type text not null check (target_type in ('post', 'comment')),
  created_at timestamptz default now(),
  primary key (user_id, target_id, target_type)
);

-- Polls (posts에 1:1 첨부)
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid unique references public.posts(id) on delete cascade,
  question text,
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- Poll options
create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade,
  text text not null,
  display_order int not null default 0
);

-- Poll votes (투표 시점 인구통계 스냅샷 포함)
create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade,
  option_id uuid references public.poll_options(id) on delete cascade,
  user_id text references public.users(id) on delete cascade,
  gender text,
  age_group text,
  region text,
  political_leaning text,
  created_at timestamptz default now(),
  unique (poll_id, user_id)
);

-- Auto-update comment_count on posts
create or replace function update_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trg_comment_count
after insert or delete on comments
for each row execute function update_comment_count();

-- RLS
alter table public.users        enable row level security;
alter table public.posts        enable row level security;
alter table public.comments     enable row level security;
alter table public.likes        enable row level security;
alter table public.polls        enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes   enable row level security;

create policy "public read users"        on public.users        for select using (true);
create policy "public read posts"        on public.posts        for select using (true);
create policy "public read comments"     on public.comments     for select using (true);
create policy "public read likes"        on public.likes        for select using (true);
create policy "public read polls"        on public.polls        for select using (true);
create policy "public read poll_options" on public.poll_options for select using (true);
create policy "public read poll_votes"   on public.poll_votes   for select using (true);
