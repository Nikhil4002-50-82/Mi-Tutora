-- FULL EXACT SCHEMA FROM DATABASE_ARCHITECTURE.PDF
-- Run this in the Supabase SQL Editor

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT '',
  hasProfile BOOLEAN DEFAULT false,
  referralCode TEXT DEFAULT '',
  referredBy TEXT DEFAULT '',
  fcmToken TEXT DEFAULT '',
  freeDemoEligible BOOLEAN DEFAULT false,
  walletBalance INT DEFAULT 0
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 2. parents
CREATE TABLE IF NOT EXISTS parents (
  id UUID REFERENCES users(id) NOT NULL PRIMARY KEY,
  name TEXT,
  area TEXT,
  city TEXT,
  phone TEXT,
  hasStudent BOOLEAN DEFAULT false
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can insert own profile" ON parents FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Parents can read own profile" ON parents FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parents can update own profile" ON parents FOR UPDATE USING (auth.uid() = id);

-- 3. tutors
CREATE TABLE IF NOT EXISTS tutors (
  id UUID REFERENCES users(id) NOT NULL PRIMARY KEY,
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
  languagesTaught TEXT[],
  knownLanguages TEXT[],
  mode TEXT CHECK (mode IN ('online', 'offline', 'both')),
  teachingApproach TEXT,
  studentCount TEXT,
  schoolNames TEXT,
  preferredLocations TEXT,
  preferredTimeRange TEXT,
  travelDistance TEXT,
  feeRange TEXT,
  price INT DEFAULT 0,
  rating DOUBLE PRECISION DEFAULT 0.0,
  area TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  hasProfile BOOLEAN DEFAULT true
);

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can insert own profile" ON tutors FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can read tutors" ON tutors FOR SELECT USING (true);
CREATE POLICY "Tutors can update own profile" ON tutors FOR UPDATE USING (auth.uid() = id);

-- 4. students
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parentId UUID REFERENCES parents(id) NOT NULL,
  category TEXT DEFAULT '',
  name TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  phoneNumber TEXT DEFAULT '',
  whatsappNumber TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  studentType TEXT DEFAULT '',
  classLevel TEXT DEFAULT '',
  board TEXT DEFAULT '',
  subjects TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  budget INT DEFAULT 0,
  preferredMode TEXT DEFAULT '',
  guardianName TEXT DEFAULT '',
  hoursPerDay TEXT DEFAULT '',
  daysPerWeek TEXT DEFAULT '',
  learningGoal TEXT DEFAULT '',
  specialRequirements TEXT DEFAULT '',
  dob TEXT DEFAULT '',
  createdAt BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can insert students" ON students FOR INSERT WITH CHECK (auth.uid() = parentId);
CREATE POLICY "Parents can read their students" ON students FOR SELECT USING (auth.uid() = parentId);
CREATE POLICY "Parents can update their students" ON students FOR UPDATE USING (auth.uid() = parentId);

-- 5. tuition_requests
CREATE TABLE IF NOT EXISTS tuition_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parentId UUID REFERENCES parents(id) NOT NULL,
  category TEXT DEFAULT '',
  studentId TEXT DEFAULT '',
  studentName TEXT DEFAULT '',
  classLevel TEXT DEFAULT '',
  board TEXT DEFAULT '',
  subjects TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  budget INT DEFAULT 0,
  mode TEXT DEFAULT '',
  preferredTimeRange TEXT DEFAULT '',
  latitude DOUBLE PRECISION DEFAULT 0.0,
  longitude DOUBLE PRECISION DEFAULT 0.0,
  area TEXT DEFAULT '',
  city TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  acceptedTutorId TEXT DEFAULT '',
  createdAt BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

-- 6. tutor_requests
CREATE TABLE IF NOT EXISTS tutor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorId TEXT DEFAULT '',
  tutorName TEXT DEFAULT '',
  parentId TEXT DEFAULT '',
  tuitionRequestId TEXT DEFAULT '',
  studentId TEXT DEFAULT '',
  studentName TEXT DEFAULT '',
  classLevel TEXT DEFAULT '',
  category TEXT DEFAULT '',
  subjects TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  budget INT DEFAULT 0,
  mode TEXT DEFAULT '',
  preferredTimeRange TEXT DEFAULT '',
  area TEXT DEFAULT '',
  city TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  createdAt BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

-- 7. applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorId TEXT DEFAULT '',
  tutorName TEXT DEFAULT '',
  requestId TEXT DEFAULT '',
  parentId TEXT DEFAULT '',
  studentId TEXT DEFAULT '',
  studentName TEXT DEFAULT '',
  currentOffer INT DEFAULT 0,
  initialBudget INT DEFAULT 0,
  lastUpdatedBy TEXT DEFAULT '',
  status TEXT DEFAULT 'applied',
  source TEXT DEFAULT 'post',
  finalPrice INT DEFAULT 0,
  demoPaymentPaid BOOLEAN DEFAULT false,
  demoPaymentLink TEXT DEFAULT '',
  meetingLink TEXT DEFAULT '',
  mode TEXT DEFAULT 'offline',
  meetingNotes TEXT DEFAULT '',
  demoDate TEXT DEFAULT '',
  demoTime TEXT DEFAULT '',
  studentLatitude DOUBLE PRECISION DEFAULT 0.0,
  studentLongitude DOUBLE PRECISION DEFAULT 0.0,
  studentAddress TEXT DEFAULT '',
  scheduledDemoDate TEXT DEFAULT '',
  scheduledDemoTime TEXT DEFAULT '',
  proposedDemoDate TEXT DEFAULT '',
  proposedDemoTime TEXT DEFAULT '',
  demoScheduleStatus TEXT DEFAULT '',
  demoScheduleUpdatedBy TEXT DEFAULT '',
  nextPaymentDate TEXT DEFAULT '',
  tuitionPaymentStatus TEXT DEFAULT 'pending',
  tuitionPaymentLink TEXT DEFAULT '',
  lastPaymentDate TEXT DEFAULT '',
  meetingPlatform TEXT DEFAULT '',
  category TEXT DEFAULT '',
  startDate TEXT DEFAULT '',
  nextDueDate TEXT DEFAULT ''
);

-- 8. direct_requests
CREATE TABLE IF NOT EXISTS direct_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorId TEXT DEFAULT '',
  tutorName TEXT DEFAULT '',
  parentId TEXT DEFAULT '',
  studentId TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  price INT DEFAULT 0,
  createdAt BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

-- 9. referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrerId TEXT DEFAULT '',
  referrerName TEXT DEFAULT '',
  referredUserId TEXT DEFAULT '',
  referredUserName TEXT DEFAULT '',
  referralCode TEXT DEFAULT '',
  referralType TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  estimatedReward INT DEFAULT 0,
  applicationId TEXT DEFAULT '',
  createdAt BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

-- 10. withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId TEXT DEFAULT '',
  amount INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  upiId TEXT DEFAULT '',
  createdAt BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

-- 11. global_config
CREATE TABLE IF NOT EXISTS global_config (
  id TEXT PRIMARY KEY DEFAULT 'app',
  appEnabled BOOLEAN DEFAULT true,
  maintenanceMode BOOLEAN DEFAULT false,
  maintenanceTitle TEXT DEFAULT '',
  maintenanceMessage TEXT DEFAULT '',
  disabledTitle TEXT DEFAULT '',
  disabledMessage TEXT DEFAULT '',
  minSupportedVersionCode BIGINT DEFAULT 0,
  recommendedVersionCode BIGINT DEFAULT 0,
  latestVersionName TEXT DEFAULT '',
  announcementEnabled BOOLEAN DEFAULT false,
  announcementTitle TEXT DEFAULT '',
  announcementMessage TEXT DEFAULT ''
);

-- Insert default global config
INSERT INTO global_config (id) VALUES ('app') ON CONFLICT (id) DO NOTHING;
