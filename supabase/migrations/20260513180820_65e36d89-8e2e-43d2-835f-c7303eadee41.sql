-- Add file_url to assignments and submissions
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS file_url text;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies: assignments (admins upload, anyone reads)
CREATE POLICY "Assignments files are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'assignments');

CREATE POLICY "Admins can upload assignment files"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'assignments' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete assignment files"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'assignments' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage policies: submissions (students upload own, admins can read all, students read own)
CREATE POLICY "Submission files publicly readable to authed users"
  ON storage.objects FOR SELECT USING (bucket_id = 'submissions' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload submissions"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'submissions' AND auth.uid() IS NOT NULL
  );

-- Allow students to update their own submissions (for re-upload before deadline)
CREATE POLICY "Students can update own submissions in DB"
  ON public.submissions FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Students can delete own submissions in DB"
  ON public.submissions FOR DELETE USING (student_id = auth.uid());