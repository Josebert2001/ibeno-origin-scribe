-- Create a function to extract year from date for indexing
CREATE OR REPLACE FUNCTION public.get_certificate_year(date_issued DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM date_issued);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create unique index to prevent duplicate certificates per bearer per year
CREATE UNIQUE INDEX unique_bearer_per_year_idx 
ON public.certificates (LOWER(bearer_name), get_certificate_year(date_issued))
WHERE status = 'valid';

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