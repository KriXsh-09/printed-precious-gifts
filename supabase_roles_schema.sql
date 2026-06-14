-- ============================================
-- GIFTWORLD: User Roles Table Schema for Supabase
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create the user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create is_admin() helper function to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_email TEXT := 'giftworldonlineofficial@gmail.com';
BEGIN
  -- First quick check: designated admin email in JWT
  IF lower(coalesce(auth.jwt() ->> 'email', '')) = lower(admin_email) THEN
    RETURN TRUE;
  END IF;

  -- Second check: check user_roles table (runs as security definer, bypassing RLS recursion)
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Users can view their own role
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Policy: Admins can view all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (public.is_admin());

-- 5. Trigger to automatically assign the 'customer' role on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Seeding Fallback/Instruction:
-- To promote an existing user to admin, run the following SQL inside Supabase:
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'YOUR_USER_UUID';
-- Or, if the role record doesn't exist yet:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
