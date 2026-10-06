-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: schools
create table schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: profiles (Teacher profiles extending auth.users)
create table profiles (
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
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Table: academic_years
create table academic_years (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g., "2026/2027"
  semester text not null, -- e.g., "Ganjil", "Genap"
  is_active boolean default false,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table academic_years enable row level security;
create policy "Users can manage their academic years" on academic_years for all using (auth.uid() = teacher_id);

-- Update profiles with academic year
alter table profiles add constraint fk_active_academic_year foreign key (active_academic_year_id) references academic_years(id);

-- Table: classes
create table classes (
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
create policy "Users can manage their classes" on classes for all using (auth.uid() = teacher_id);

-- Table: students
create table students (
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
create policy "Users can manage their students" on students for all using (auth.uid() = teacher_id);

-- Table: subjects
create table subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table subjects enable row level security;
create policy "Users can manage their subjects" on subjects for all using (auth.uid() = teacher_id);

-- Table: schedules
create table schedules (
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
create policy "Users can manage their schedules" on schedules for all using (auth.uid() = teacher_id);

-- Table: meetings
create table meetings (
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
create policy "Users can manage their meetings" on meetings for all using (auth.uid() = teacher_id);

-- Table: attendance
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table attendance enable row level security;
create policy "Users can manage their attendance" on attendance for all using (auth.uid() = teacher_id);

-- Table: attendance_records
create table attendance_records (
  id uuid default uuid_generate_v4() primary key,
  attendance_id uuid references attendance(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  status text not null, -- 'H', 'S', 'I', 'A'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table attendance_records enable row level security;
create policy "Users can manage their attendance records" on attendance_records for all using (
  exists (select 1 from attendance a where a.id = attendance_id and a.teacher_id = auth.uid())
);

-- Table: teaching_journals
create table teaching_journals (
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
create policy "Users can manage their teaching journals" on teaching_journals for all using (auth.uid() = teacher_id);

-- Table: learning_devices (Perangkat Pembelajaran)
create table learning_devices (
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
create policy "Users can manage their learning devices" on learning_devices for all using (auth.uid() = teacher_id);

-- Table: learning_materials (Bahan Ajar)
create table learning_materials (
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
create policy "Users can manage their learning materials" on learning_materials for all using (auth.uid() = teacher_id);

-- Table: assessments
create table assessments (
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
create policy "Users can manage their assessments" on assessments for all using (auth.uid() = teacher_id);

-- Table: assessment_scores
create table assessment_scores (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references assessments(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  score numeric not null,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table assessment_scores enable row level security;
create policy "Users can manage their assessment scores" on assessment_scores for all using (
  exists (select 1 from assessments a where a.id = assessment_id and a.teacher_id = auth.uid())
);

-- Table: documents
create table documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null, -- 'Surat', 'Laporan', etc.
  file_url text,
  file_name text,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table documents enable row level security;
create policy "Users can manage their documents" on documents for all using (auth.uid() = teacher_id);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
