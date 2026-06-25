-- Migration: Add color column to sub_categories table
-- Enables sub-categories to have a custom hex color code.

ALTER TABLE `sub_categories` 
ADD COLUMN `color` VARCHAR(20) DEFAULT NULL AFTER `name`;
