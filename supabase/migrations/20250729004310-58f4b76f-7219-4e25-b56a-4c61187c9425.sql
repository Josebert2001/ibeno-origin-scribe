-- Add unique constraint to prevent duplicate certificates for the same bearer
-- This ensures one certificate per person per year
ALTER TABLE public.certificates 
ADD CONSTRAINT unique_bearer_per_year 
UNIQUE (bearer_name, EXTRACT(YEAR FROM date_issued));

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