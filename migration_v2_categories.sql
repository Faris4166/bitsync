-- SAFE MIGRATION: Add category column to products
-- Run this in your Supabase SQL Editor

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='products' AND column_name='category'
    ) THEN
        ALTER TABLE products ADD COLUMN category text;
    END IF;
END $$;

-- Optional: Update receipts items to ensure category is stored (if using raw JSON items)
-- This depends on how items are stored, but the current schema uses jsonb items in receipts.
