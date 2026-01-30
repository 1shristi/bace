-- Create profiles table with role support
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null check (role in ('patient', 'doctor')),
  created_at timestamp with time zone default now()
);

-- Create patient_doctor relationship table
create table if not exists public.patient_doctor (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(patient_id, doctor_id)
);

-- Create daily entries table for BACE tracking
create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  behavior_score integer not null check (behavior_score between 1 and 5),
  activity_score integer not null check (activity_score between 1 and 5),
  cognition_score integer not null check (cognition_score between 1 and 5),
  emotion_score integer not null check (emotion_score between 1 and 5),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(patient_id, entry_date)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.patient_doctor enable row level security;
alter table public.daily_entries enable row level security;

-- Profiles RLS policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_doctor_patients" on public.profiles for select using (
  auth.uid() in (
    select doctor_id from public.patient_doctor where patient_id = profiles.id
  )
);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Patient-doctor relationship RLS policies
create policy "patient_doctor_select_own" on public.patient_doctor for select using (
  auth.uid() = patient_id or auth.uid() = doctor_id
);
create policy "patient_doctor_insert_own" on public.patient_doctor for insert with check (
  auth.uid() = patient_id or auth.uid() = doctor_id
);

-- Daily entries RLS policies
create policy "daily_entries_select_own" on public.daily_entries for select using (auth.uid() = patient_id);
create policy "daily_entries_select_doctor" on public.daily_entries for select using (
  auth.uid() in (
    select doctor_id from public.patient_doctor where patient_id = daily_entries.patient_id
  )
);
create policy "daily_entries_insert_own" on public.daily_entries for insert with check (auth.uid() = patient_id);
create policy "daily_entries_update_own" on public.daily_entries for update using (auth.uid() = patient_id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'patient')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
