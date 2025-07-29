-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  -- For now, return false. This can be updated when admin roles are implemented
  SELECT false;
$$;