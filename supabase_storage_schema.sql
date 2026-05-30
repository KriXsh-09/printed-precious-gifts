-- ============================================
-- GIFTWORLD: Storage Buckets & Policies Schema
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create the Storage Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('user-customizations', 'user-customizations', true)
ON CONFLICT (id) DO NOTHING;

-- Note: In Supabase, RLS is enabled by default on the 'storage.objects' table.


-- ============================================
-- 2. Policies for 'product-images' Bucket
-- ============================================

-- Policy A: Anyone can view product images (public storefront access)
DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy B: Only Admins can upload product images
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy C: Only Admins can update/delete product images
DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;
CREATE POLICY "Admins can manage product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );


-- ============================================
-- 3. Policies for 'user-customizations' Bucket
-- ============================================

-- Policy A: Anyone authenticated can upload customization reference photos
DROP POLICY IF EXISTS "Users can upload customization images" ON storage.objects;
CREATE POLICY "Users can upload customization images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-customizations' AND
    auth.role() = 'authenticated'
  );

-- Policy B: Only the owner (uploader) or admins can view reference photos
-- (Secures personal/couple photos from public harvesting)
DROP POLICY IF EXISTS "Owners and admins can view customization images" ON storage.objects;
CREATE POLICY "Owners and admins can view customization images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-customizations' AND (
      auth.uid() = owner OR
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );

-- Policy C: Only owners or admins can delete reference photos
DROP POLICY IF EXISTS "Owners and admins can delete customization images" ON storage.objects;
CREATE POLICY "Owners and admins can delete customization images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-customizations' AND (
      auth.uid() = owner OR
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );
