-- ============================================================================
-- Campus Lost & Found — Supabase database setup
-- ============================================================================
-- Run this entire file once in the Supabase SQL Editor (Project → SQL Editor
-- → New query) on a fresh project. It is safe to re-run: every statement is
-- idempotent (uses IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS).
--
-- This script does NOT need to be split up — everything here can run in a
-- single query. The only thing you must do outside of SQL is create the
-- "item-images" Storage bucket's policies, which this script also creates,
-- but the bucket's *public* toggle must be confirmed once in the dashboard
-- (Storage → item-images → Settings) if you create the bucket manually.
-- If you let this script create the bucket (it does, below), the public flag
-- is already set correctly and there is nothing left to do.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  department text,
  level text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile + role for every registered user.';

-- ----------------------------------------------------------------------------
-- 2. ITEMS TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('lost', 'found')),
  title text not null check (char_length(title) <= 120),
  category text not null check (
    category in (
      'Electronics', 'Documents', 'Books', 'Clothing', 'Keys',
      'Bags', 'Jewelry', 'Wallet/Purse', 'ID Card', 'Other'
    )
  ),
  description text not null check (char_length(description) <= 2000),
  location text not null,
  date_occurred date not null,
  image_url text,
  status text not null default 'active' check (status in ('active', 'recovered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.items is 'Lost and found item reports.';

create index if not exists items_status_idx on public.items (status);
create index if not exists items_type_idx on public.items (type);
create index if not exists items_category_idx on public.items (category);
create index if not exists items_user_id_idx on public.items (user_id);
create index if not exists items_created_at_idx on public.items (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. AUTO-CREATE PROFILE ON SIGN-UP (role is always 'student' — there is no
--    public admin registration path)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent a student from ever promoting themselves to admin (or anyone
-- changing another user's role) through the normal profile-update path.
-- Role changes must be done directly in the SQL editor (see section 7 below).
-- Only blocks role changes coming from the normal signed-in app client
-- (where auth.uid() is set). Requests made with the service-role key or
-- directly in the SQL Editor have no auth.uid() and are left untouched, so
-- the admin-promotion command in section 7 below still works.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profiles_prevent_role_change on public.profiles;
create trigger on_profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Keep items.updated_at current on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists on_items_set_updated_at on public.items;
create trigger on_items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.items enable row level security;

-- PROFILES -------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Needed so a logged-in student can see the poster's name/email/phone on an
-- item's detail page, and so the item ⇄ poster join works at all. Anonymous
-- (not-logged-in) visitors do NOT get this, so they can browse items but
-- must sign in to see contact details.
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policies for regular users: profiles are created only by
-- the on_auth_user_created trigger (which runs as SECURITY DEFINER and
-- bypasses RLS), and are never deleted directly (they cascade from
-- auth.users deletion). Admin listing uses the service-role client, which
-- bypasses RLS entirely, so no extra "admin can view all" policy is needed.

-- ITEMS ------------------------------------------------------------------
-- Public can see active items; an owner can always see their own items
-- (including recovered ones, for their "My Reports" page). No `to` clause,
-- so this applies to both anon and authenticated roles.
drop policy if exists "items_select" on public.items;
create policy "items_select"
  on public.items for select
  using (status = 'active' or auth.uid() = user_id);

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own"
  on public.items for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own"
  on public.items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own"
  on public.items for delete
  to authenticated
  using (auth.uid() = user_id);

-- Admin reads/deletes (getAllItemsAdmin, getAdminStats, getRecentItemsAdmin,
-- adminDeleteItem, getAllUsersAdmin) go through the service-role client in
-- lib/supabase/admin.ts, which bypasses RLS after requireAdmin() has already
-- verified the caller's role server-side — so no separate "admin" RLS policy
-- is required for those.

-- ----------------------------------------------------------------------------
-- 5. STORAGE — item images
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  5242880, -- 5MB, matches lib/constants.ts MAX_IMAGE_BYTES
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Anyone can view images (bucket is public) — this policy lets the public
-- URL work without an auth token.
drop policy if exists "item_images_public_read" on storage.objects;
create policy "item_images_public_read"
  on storage.objects for select
  using (bucket_id = 'item-images');

-- A signed-in student may only upload into a folder named after their own
-- user id, matching the `${userId}/...` path used in lib/actions.ts.
drop policy if exists "item_images_insert_own_folder" on storage.objects;
create policy "item_images_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "item_images_delete_own_folder" on storage.objects;
create policy "item_images_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 6. VERIFY (optional) — run these separately after the block above to
--    confirm everything was created.
-- ============================================================================
-- select * from public.profiles;
-- select * from public.items;
-- select * from storage.buckets where id = 'item-images';

-- ============================================================================
-- 7. PROMOTING THE FIRST ADMIN ACCOUNT
-- ============================================================================
-- There is intentionally no admin sign-up form. To create your first admin:
--   1. Register a normal account through the app's /auth/sign-up page.
--   2. Confirm the email and make sure you can log in as a student.
--   3. In the Supabase SQL Editor, run (replacing the email):
--
--      update public.profiles set role = 'admin' where email = 'you@school.edu';
--
--   The prevent_role_change trigger above only blocks role changes made
--   through the app's normal update path (auth.uid() = id); running UPDATE
--   directly in the SQL editor as the postgres role is unaffected by it.
-- ============================================================================
