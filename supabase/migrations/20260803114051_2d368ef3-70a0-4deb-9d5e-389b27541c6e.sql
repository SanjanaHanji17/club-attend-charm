ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS important boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_usn_role_unique ON public.profiles (lower(usn), role);

CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Admins can manage comments"
ON public.comments FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'::app_role));