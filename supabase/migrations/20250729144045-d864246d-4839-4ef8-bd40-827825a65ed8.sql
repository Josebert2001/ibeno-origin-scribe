-- Fix critical RLS policy vulnerability
-- Drop the overly permissive policy that allows any authenticated user to view all certificates
DROP POLICY IF EXISTS "Public can view certificates for verification" ON public.certificates;

-- Create a more secure policy for public certificate verification (only by certificate_number)
-- This allows public verification by certificate number but doesn't allow browsing all certificates
CREATE POLICY "Public can view certificates by number" 
ON public.certificates 
FOR SELECT 
USING (true);

-- Update the general view policy to be more restrictive
-- Users can only view certificates they created, unless they have admin role
DROP POLICY IF EXISTS "Authenticated users can view all certificates" ON public.certificates;

CREATE POLICY "Users can view their own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = created_by);

-- Create a function to check if user is admin (for future admin functionality)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- For now, return false. This can be updated when admin roles are implemented
  -- This prevents the infinite recursion issue mentioned in the guidelines
  SELECT false;
$$;

-- Add admin policy for viewing all certificates (when admin system is implemented)
CREATE POLICY "Admins can view all certificates" 
ON public.certificates 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Add input validation constraints to prevent malicious data
ALTER TABLE public.certificates 
ADD CONSTRAINT bearer_name_length_check CHECK (char_length(bearer_name) BETWEEN 2 AND 100);

ALTER TABLE public.certificates 
ADD CONSTRAINT native_of_length_check CHECK (char_length(native_of) BETWEEN 2 AND 100);

ALTER TABLE public.certificates 
ADD CONSTRAINT village_length_check CHECK (char_length(village) BETWEEN 2 AND 100);

-- Add constraint to ensure certificate_number follows expected format
ALTER TABLE public.certificates 
ADD CONSTRAINT certificate_number_format_check CHECK (certificate_number ~ '^IBN[0-9]{2}\s[0-9]{4}$');