-- Update the certificate number generation function to use IBN25 format
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'IBN25 ' || LPAD(nextval('certificate_number_seq')::text, 4, '0');
END;
$function$;