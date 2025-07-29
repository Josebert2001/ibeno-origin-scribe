-- First, let's see what status values are allowed and add 'superseded' to the constraint
ALTER TABLE public.certificates 
DROP CONSTRAINT IF EXISTS certificates_status_check;

-- Add new constraint with 'superseded' status
ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_status_check 
CHECK (status IN ('valid', 'invalid', 'revoked', 'superseded'));

-- Now mark older duplicate certificates as 'superseded' to keep only the latest one per person per year
WITH ranked_certificates AS (
  SELECT 
    id,
    bearer_name,
    date_issued,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(bearer_name), EXTRACT(YEAR FROM date_issued) 
      ORDER BY created_at DESC
    ) as rn
  FROM public.certificates
  WHERE status = 'valid'
)
UPDATE public.certificates 
SET status = 'superseded'
WHERE id IN (
  SELECT id FROM ranked_certificates WHERE rn > 1
);

-- Add a function to check if bearer already has a certificate this year
CREATE OR REPLACE FUNCTION public.check_bearer_certificate_exists(bearer_name_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.certificates 
    WHERE LOWER(bearer_name) = LOWER(bearer_name_input)
    AND EXTRACT(YEAR FROM date_issued) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND status = 'valid'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;