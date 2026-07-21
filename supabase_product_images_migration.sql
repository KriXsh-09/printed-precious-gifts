-- Migration: Add images array and size-specific prices to products table
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Multi-image array column
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Size-specific price columns (4", 6", 8")
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_4in NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_6in NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_8in NUMERIC(10, 2);
