-- Fix the function to have proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';