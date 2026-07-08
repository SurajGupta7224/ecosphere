-- Migration: Create subcategory_variations table
-- Adds supporting tables for sub-category variations with proper foreign keys and display order.

CREATE TABLE IF NOT EXISTS `subcategory_variations` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `subcategory_id` INT NOT NULL,
  `variation_name` VARCHAR(100) NOT NULL,
  `number_of_sr` INT NOT NULL,
  `schedule_after_days` INT NOT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subcategory_variations_subcategory` 
    FOREIGN KEY (`subcategory_id`) REFERENCES `sub_categories` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
