-- Fix security warnings by setting search_path for all functions

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the generate_certificate_number function
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PNG ' || LPAD(nextval('certificate_number_seq')::text, 6, '0') || ' 1';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the generate_our_ref function
CREATE OR REPLACE FUNCTION public.generate_our_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ILG/AD/G/304/' || LPAD(nextval('certificate_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the generate_your_ref function
CREATE OR REPLACE FUNCTION public.generate_your_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NO1.42/' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) - 2000)::text, 2, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;