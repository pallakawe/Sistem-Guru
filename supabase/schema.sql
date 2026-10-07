-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: schools
create table if not exists schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  teacher_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table schools enable row level security;
do $ begin
  if not exists (select 1 from pg_policies where tablename='schools' and policyname='Teachers can manage own school') then
    create policy "Teachers can manage own school" on schools
      for all to authenticated
      using ((select auth.uid()) = teacher_id)
      with check ((select auth.uid()) = teacher_id);
  end if;
end $;

-- Table: profiles (Teacher profiles extending auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  nip text,
  nuptk text,
  email text,
  phone text,
  school_id uuid references schools(id),
  subject_specialty text,
  avatar_url text,
  active_academic_year_id uuid, -- Reference added later to avoid circular dependency
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can view own profile') then
    create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
  end if;
end $$;

-- Table: academic_years
create table if not exists academic_years (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g., "2026/2027"
  semester text not null, -- e.g., "Ganjil", "Genap"
  is_active boolean default false,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table academic_years enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='academic_years' and policyname='Users can manage their academic years') then
    create policy "Users can manage their academic years" on academic_years for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Update profiles with academic year foreign key (if not already exists)
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'fk_active_academic_year') then
    alter table profiles add constraint fk_active_academic_year foreign key (active_academic_year_id) references academic_years(id);
  end if;
end $$;

-- Table: classes
create table if not exists classes (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g., "X RPL 1"
  grade_level text not null, -- e.g., "X"
  major text, -- e.g., "RPL"
  homeroom_teacher text,
  academic_year_id uuid references academic_years(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table classes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='classes' and policyname='Users can manage their classes') then
    create policy "Users can manage their classes" on classes for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: students
create table if not exists students (
  id uuid default uuid_generate_v4() primary key,
  nis text,
  nisn text,
  full_name text not null,
  gender text, -- 'L' or 'P'
  student_number integer, -- Nomor absen
  class_id uuid references classes(id) on delete cascade not null,
  avatar_url text,
  is_active boolean default true,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table students enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='students' and policyname='Users can manage their students') then
    create policy "Users can manage their students" on students for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: subjects
create table if not exists subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table subjects enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='subjects' and policyname='Users can manage their subjects') then
    create policy "Users can manage their subjects" on subjects for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: schedules
create table if not exists schedules (
  id uuid default uuid_generate_v4() primary key,
  day_of_week integer not null, -- 1=Monday, 7=Sunday
  start_time time not null,
  end_time time not null,
  class_id uuid references classes(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  room text,
  academic_year_id uuid references academic_years(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table schedules enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='schedules' and policyname='Users can manage their schedules') then
    create policy "Users can manage their schedules" on schedules for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: meetings
create table if not exists meetings (
  id uuid default uuid_generate_v4() primary key,
  meeting_number integer not null,
  date date not null,
  class_id uuid references classes(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  academic_year_id uuid references academic_years(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table meetings enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='meetings' and policyname='Users can manage their meetings') then
    create policy "Users can manage their meetings" on meetings for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: attendance
create table if not exists attendance (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table attendance enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='attendance' and policyname='Users can manage their attendance') then
    create policy "Users can manage their attendance" on attendance for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: attendance_records
create table if not exists attendance_records (
  id uuid default uuid_generate_v4() primary key,
  attendance_id uuid references attendance(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  status text not null, -- 'H', 'S', 'I', 'A'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table attendance_records enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='attendance_records' and policyname='Users can manage their attendance records') then
    create policy "Users can manage their attendance records" on attendance_records for all using (
      exists (select 1 from attendance a where a.id = attendance_id and a.teacher_id = auth.uid())
    );
  end if;
end $$;

-- Table: teaching_journals
create table if not exists teaching_journals (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  topic text not null,
  learning_objectives text,
  activities text,
  method text,
  notes text,
  obstacles text,
  follow_up text,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table teaching_journals enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='teaching_journals' and policyname='Users can manage their teaching journals') then
    create policy "Users can manage their teaching journals" on teaching_journals for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: learning_devices (Perangkat Pembelajaran)
create table if not exists learning_devices (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null, -- 'Modul Ajar', 'ATP', 'CP', etc.
  file_url text,
  file_name text,
  academic_year_id uuid references academic_years(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table learning_devices enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='learning_devices' and policyname='Users can manage their learning devices') then
    create policy "Users can manage their learning devices" on learning_devices for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: learning_materials (Bahan Ajar)
create table if not exists learning_materials (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  subject_id uuid references subjects(id) on delete cascade not null,
  class_id uuid references classes(id) on delete cascade,
  topic text,
  file_url text,
  file_type text, -- 'PDF', 'Video', 'Link', etc.
  meeting_id uuid references meetings(id) on delete set null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table learning_materials enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='learning_materials' and policyname='Users can manage their learning materials') then
    create policy "Users can manage their learning materials" on learning_materials for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: assessments
create table if not exists assessments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  type text not null, -- 'Tugas', 'Kuis', 'UTS', 'UAS'
  weight numeric, -- bobot (0-100)
  class_id uuid references classes(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  academic_year_id uuid references academic_years(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table assessments enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='assessments' and policyname='Users can manage their assessments') then
    create policy "Users can manage their assessments" on assessments for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Table: assessment_scores
create table if not exists assessment_scores (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references assessments(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  score numeric not null,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table assessment_scores enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='assessment_scores' and policyname='Users can manage their assessment scores') then
    create policy "Users can manage their assessment scores" on assessment_scores for all using (
      exists (select 1 from assessments a where a.id = assessment_id and a.teacher_id = auth.uid())
    );
  end if;
end $$;

-- Table: documents
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null, -- 'Surat', 'Laporan', etc.
  file_url text,
  file_name text,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table documents enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='documents' and policyname='Users can manage their documents') then
    create policy "Users can manage their documents" on documents for all using (auth.uid() = teacher_id);
  end if;
end $$;

-- Function to handle new user registration (auto-create profile)
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
$ language plpgsql security definer set search_path = '';

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- Trigger for new user (drop first to avoid duplicate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
