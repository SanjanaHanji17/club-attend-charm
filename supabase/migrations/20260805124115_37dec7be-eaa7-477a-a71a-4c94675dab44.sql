REVOKE EXECUTE ON FUNCTION public.assignment_submission_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assignment_submission_stats() TO authenticated;