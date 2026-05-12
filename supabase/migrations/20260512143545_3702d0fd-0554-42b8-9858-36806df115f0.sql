-- Create roles type
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  full_name TEXT NOT NULL,
  usn TEXT NOT NULL UNIQUE,
  department TEXT,
  year TEXT,
  phone TEXT,
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  resource_person TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Admins can create sessions" ON public.sessions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update sessions" ON public.sessions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete sessions" ON public.sessions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  present BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendance viewable by admins and the student themselves" ON public.attendance FOR SELECT USING (
  student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);