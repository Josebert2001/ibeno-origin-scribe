-- Remove overly permissive public read policy on certificates
DROP POLICY IF EXISTS "Public can view certificates by number" ON public.certificates;

-- (Optional) You can add a more restrictive policy later if needed, but we will route public verification through an Edge Function that returns only non-PII.
