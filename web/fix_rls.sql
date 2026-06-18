-- Fix RLS policies to allow inserts during signup
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Parents can insert own profile" ON parents FOR INSERT WITH CHECK (auth.uid() = uid);

-- Fix role constraints since frontend uses 'student' and 'teacher' instead of 'parent' and 'tutor'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('parent', 'tutor', 'student', 'teacher', ''));

