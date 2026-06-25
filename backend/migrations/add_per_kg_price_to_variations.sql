-- Migration: Add per_kg_price column to subcategory_variations table
-- Allows variations to specify a custom price per kg.

ALTER TABLE `subcategory_variations` 
ADD COLUMN `per_kg_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `schedule_after_days`;
