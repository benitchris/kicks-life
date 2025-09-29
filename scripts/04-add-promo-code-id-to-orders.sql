-- Migration: Add promo_code_id column to orders table
ALTER TABLE orders ADD COLUMN promo_code_id INTEGER;
