-- ============================================
-- GIFTWORLD: Orders Table Razorpay Payment Integration Migration
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Add payment-related columns to the orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- 2. Mark all existing orders as 'paid' to ensure backward compatibility
UPDATE orders SET payment_status = 'paid' WHERE payment_status IS NULL;

-- 3. Add constraint to restrict values for payment_status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- 4. Create index on razorpay_order_id for faster lookup during verification and webhook events
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
