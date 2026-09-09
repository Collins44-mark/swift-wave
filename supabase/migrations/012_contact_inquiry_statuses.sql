-- Contact inquiry status workflow (corporate contact form)
ALTER TABLE public.inquiries
  DROP CONSTRAINT IF EXISTS inquiries_status_check;

ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_status_check
  CHECK (status IN (
    'new',
    'read',
    'replied',
    'resolved',
    'contacted',
    'in_progress',
    'completed',
    'cancelled'
  ));
