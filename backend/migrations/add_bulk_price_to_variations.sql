-- Migration: Add bulk_price column to subcategory_variations table
ALTER TABLE `subcategory_variations`
ADD COLUMN `bulk_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `per_kg_price`;
