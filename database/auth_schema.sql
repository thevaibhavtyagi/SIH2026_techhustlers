-- MPLADS DRISHTI — Auth schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Creates the tables the Node/Express backend (backend/src) uses for
-- custom email+password authentication, JWT refresh tokens, and password resets.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / DROP ... IF EXISTS.

create extension if not exists pgcrypto;

-- There is no public/citizen role — every account is admin-provisioned.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'role') then
    create type role as enum ('admin', 'district_nodal', 'mp');
  end if;
end$$;

-- If this ran previously (when 'citizen' was still a role), the live enum
-- may already contain it. That's harmless to leave in place — Postgres enums
-- can't drop a value without recreating the type, and nothing in the app
-- will ever write it. Uncomment below only if you want a fully clean enum
-- and have confirmed no rows use role = 'citizen'.
-- alter type role rename to role_old;
-- create type role as enum ('admin', 'district_nodal', 'mp');
-- alter table users alter column role type role using role::text::role;
-- drop type role_old;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role role not null,

  phone text,
  designation text,
  department text,
  state text,
  district text,
  constituency text,

  is_active boolean not null default true,
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  user_id uuid not null references users(id) on delete cascade,

  expires_at timestamptz not null,
  revoked_at timestamptz,
  replaced_by_token_hash text,
  created_by_ip text,
  user_agent text,

  created_at timestamptz not null default now()
);
create index if not exists refresh_tokens_user_id_idx on refresh_tokens(user_id);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  user_id uuid not null references users(id) on delete cascade,

  expires_at timestamptz not null,
  used_at timestamptz,

  created_at timestamptz not null default now()
);
create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens(user_id);

-- Keep updated_at current on every UPDATE.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row execute function set_updated_at();

-- RLS is enabled with no policies: only the backend's service-role (secret)
-- key can read/write these tables, bypassing RLS. The anon/publishable key
-- used by the frontend has zero direct access — all reads/writes go through
-- the Express API, which enforces auth + RBAC.
alter table users enable row level security;
alter table refresh_tokens enable row level security;
alter table password_reset_tokens enable row level security;

-- service_role bypasses RLS but still needs base table grants. Grant them
-- explicitly (and for any future table in this schema) so the backend's
-- secret key can actually read/write these tables.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
