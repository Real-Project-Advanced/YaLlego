create table if not exists driver_locations (
  id uuid default gen_random_uuid() primary key,
  driver_id text not null,
  driver_code text not null unique,
  route_name text not null,
  lat float not null,
  lng float not null,
  is_active boolean default false,
  updated_at timestamptz default now()
);

create table if not exists ride_requests (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  user_name text,
  driver_id text not null,
  driver_code text not null,
  route_name text,
  user_lat float not null,
  user_lng float not null,
  nearest_stop text,
  stop_name text,
  stop_lat float,
  stop_lng float,
  destination_name text,
  destination_lat float,
  destination_lng float,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_favorite_routes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  route_name text not null,
  driver_code text,
  price integer default 3800,
  created_at timestamptz default now()
);

create table if not exists driver_routes (
  id uuid default gen_random_uuid() primary key,
  driver_id text not null unique,
  driver_code text not null,
  route_name text not null,
  estimated_duration integer,
  total_distance float,
  price integer default 3800,
  updated_at timestamptz default now()
);

create table if not exists push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  token text not null,
  platform text,
  updated_at timestamptz default now()
);

create table if not exists push_notifications (
  id uuid default gen_random_uuid() primary key,
  ride_request_id uuid,
  driver_id text,
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

do $$
begin
  alter publication supabase_realtime add table driver_locations;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table ride_requests;
exception
  when duplicate_object then null;
end $$;
