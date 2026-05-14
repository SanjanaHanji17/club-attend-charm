CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  student_id UUID NOT NULL,
  rating INTEGER,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view own feedback"
  ON public.feedback FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Students can delete own feedback"
  ON public.feedback FOR DELETE
  USING (student_id = auth.uid());

CREATE INDEX idx_feedback_session ON public.feedback(session_id);
CREATE INDEX idx_feedback_student ON public.feedback(student_id);
