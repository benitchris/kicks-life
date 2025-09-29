-- Migration: Add subtotal column to orders table
ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
