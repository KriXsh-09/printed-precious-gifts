-- ============================================
-- GIFTWORLD: Auto-Seed Admin Role Function
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================
-- This SECURITY DEFINER function bypasses RLS to ensure
-- the admin user always has a 'admin' row in user_roles.
-- It is safe because it only promotes the hardcoded admin email.

CREATE OR REPLACE FUNCTION public.ensure_admin_role()
RETURNS void AS $$
DECLARE
  admin_email TEXT := 'giftworldonlineofficial@gmail.com';
  current_email TEXT;
BEGIN
  -- Get the email of the currently authenticated user
  SELECT email INTO current_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Only promote if the email matches the designated admin
  IF lower(current_email) = lower(admin_email) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_admin_role() TO authenticated;
