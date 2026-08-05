CREATE OR REPLACE FUNCTION public.assignment_submission_stats()
RETURNS TABLE (assignment_id uuid, submitted_count bigint, total_students bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id,
         (SELECT count(DISTINCT s.student_id) FROM public.submissions s WHERE s.assignment_id = a.id),
         (SELECT count(*) FROM public.profiles p WHERE p.role = 'student')
  FROM public.assignments a;
$$;

GRANT EXECUTE ON FUNCTION public.assignment_submission_stats() TO authenticated;