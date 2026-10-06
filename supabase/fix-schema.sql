-- Script minimal: Buat tabel profiles dan trigger auto-create profile
-- Jalankan ini jika tabel lain (schools, dll.) sudah ada

-- Buat tabel profiles jika belum ada
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  nip text,
  nuptk text,
  email text,
  phone text,
  school_id uuid,
  subject_specialty text,
  avatar_url text,
  active_academic_year_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Buat policies jika belum ada
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='profiles' and policyname='Users can view own profile'
  ) then
    create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename='profiles' and policyname='Users can update own profile'
  ) then
    create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
  end if;
end $$;

-- Fungsi auto-buat profile saat user baru mendaftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Hapus trigger lama jika ada, lalu buat ulang
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
