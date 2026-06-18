-- Schema for Supabase Migration from Firebase
-- Run this in the Supabase SQL Editor

-- 1. Users
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('parent', 'tutor', '')),
  has_profile BOOLEAN DEFAULT false,
  referral_code TEXT,
  referred_by TEXT,
  fcm_token TEXT,
  free_demo_eligible BOOLEAN DEFAULT false
);

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 2. Parents
CREATE TABLE parents (
  uid UUID REFERENCES users(id) NOT NULL PRIMARY KEY,
  area TEXT,
  city TEXT,
  phone TEXT,
  has_student BOOLEAN DEFAULT false
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can read own profile" ON parents FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Parents can update own profile" ON parents FOR UPDATE USING (auth.uid() = uid);

-- 3. Tutors
CREATE TABLE tutors (
  uid UUID REFERENCES users(id) NOT NULL PRIMARY KEY,
  category TEXT,
  name TEXT,
  gender TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  qualification TEXT,
  experience TEXT,
  occupation TEXT,
  subjects TEXT[],
  classes TEXT[],
  boards TEXT[],
  technologies TEXT[],
  languages_taught TEXT[],
  known_languages TEXT[],
  mode TEXT CHECK (mode IN ('online', 'offline', 'both')),
  teaching_approach TEXT,
  student_count TEXT,
  school_names TEXT,
  preferred_locations TEXT,
  preferred_time_range TEXT,
  travel_distance TEXT,
  fee_range TEXT,
  price INT DEFAULT 0,
  rating DOUBLE PRECISION DEFAULT 0.0,
  area TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  has_profile BOOLEAN DEFAULT true
);

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tutors" ON tutors FOR SELECT USING (true);
CREATE POLICY "Tutors can update own profile" ON tutors FOR UPDATE USING (auth.uid() = uid);
CREATE POLICY "Tutors can insert own profile" ON tutors FOR INSERT WITH CHECK (auth.uid() = uid);

-- 4. Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parents(uid) NOT NULL,
  category TEXT,
  name TEXT,
  gender TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  email TEXT,
  address TEXT,
  student_type TEXT,
  class_level TEXT,
  board TEXT,
  subjects TEXT[],
  technologies TEXT[],
  languages TEXT[],
  budget INT DEFAULT 0,
  preferred_mode TEXT,
  guardian_name TEXT,
  hours_per_day TEXT,
  days_per_week TEXT,
  learning_goal TEXT,
  special_requirements TEXT,
  dob TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can read their students" ON students FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can update their students" ON students FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert students" ON students FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can delete their students" ON students FOR DELETE USING (auth.uid() = parent_id);

-- 5. Tuition Requests
CREATE TABLE tuition_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parents(uid) NOT NULL,
  student_id UUID REFERENCES students(id) NOT NULL,
  status TEXT DEFAULT 'open',
  accepted_tutor_id UUID REFERENCES tutors(uid),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tuition_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read open tuition requests" ON tuition_requests FOR SELECT USING (status = 'open' OR auth.uid() = parent_id OR auth.uid() = accepted_tutor_id);
CREATE POLICY "Parents can insert tuition requests" ON tuition_requests FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own tuition requests" ON tuition_requests FOR UPDATE USING (auth.uid() = parent_id);

-- 6. Applications
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(uid) NOT NULL,
  request_id UUID REFERENCES tuition_requests(id),
  parent_id UUID REFERENCES parents(uid) NOT NULL,
  student_id UUID REFERENCES students(id) NOT NULL,
  current_offer INT DEFAULT 0,
  initial_budget INT DEFAULT 0,
  last_updated_by TEXT,
  status TEXT DEFAULT 'applied',
  source TEXT DEFAULT 'post',
  final_price INT DEFAULT 0,
  demo_payment_paid BOOLEAN DEFAULT false,
  demo_payment_link TEXT,
  meeting_link TEXT,
  mode TEXT DEFAULT 'offline',
  meeting_notes TEXT,
  demo_date TEXT,
  demo_time TEXT,
  scheduled_demo_date TEXT,
  scheduled_demo_time TEXT,
  proposed_demo_date TEXT,
  proposed_demo_time TEXT,
  demo_schedule_status TEXT,
  demo_schedule_updated_by TEXT,
  next_payment_date TEXT,
  tuition_payment_status TEXT DEFAULT 'pending',
  tuition_payment_link TEXT,
  last_payment_date TEXT,
  meeting_platform TEXT,
  category TEXT,
  start_date TEXT,
  next_due_date TEXT
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involved parties can read applications" ON applications FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = tutor_id);
CREATE POLICY "Involved parties can update applications" ON applications FOR UPDATE USING (auth.uid() = parent_id OR auth.uid() = tutor_id);
CREATE POLICY "Tutors can insert applications" ON applications FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Parents can insert direct applications" ON applications FOR INSERT WITH CHECK (auth.uid() = parent_id);
