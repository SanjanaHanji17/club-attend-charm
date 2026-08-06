ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS important boolean NOT NULL DEFAULT false;
DROP POLICY IF EXISTS "Admins can manage comments" ON public.comments;
CREATE POLICY "Admins can delete any comment" ON public.comments FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'::app_role));