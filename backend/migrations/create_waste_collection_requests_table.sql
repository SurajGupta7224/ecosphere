-- Migration: Create waste_collection_requests table with new schema
CREATE TABLE IF NOT EXISTS `waste_collection_requests` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `lead_id` VARCHAR(50) NOT NULL,
  `user_id` INT DEFAULT NULL,
  `customer_type` VARCHAR(50) DEFAULT NULL,
  `authorized_person_name` VARCHAR(255) DEFAULT NULL,
  `mobile_number` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `waste_generator_name` VARCHAR(255) DEFAULT NULL,
  `area_sqm` DECIMAL(10, 2) DEFAULT NULL,
  `dwelling_units` INT DEFAULT NULL,
  `complete_address` TEXT DEFAULT NULL,
  `category_id` INT NOT NULL,
  `subcategory_id` INT NOT NULL,
  `variation_id` BIGINT NOT NULL,
  `expected_waste` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `agreed_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `suggested_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `monthly_waste` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `yearly_waste` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `monthly_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `yearly_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `registered_rwa` VARCHAR(255) DEFAULT NULL,
  `gst_number` VARCHAR(50) DEFAULT NULL,
  `pan_number` VARCHAR(50) DEFAULT NULL,
  `trade_license` VARCHAR(255) DEFAULT NULL,
  `pickup_date` DATE NOT NULL,
  `time_slot_id` BIGINT DEFAULT NULL,
  
  -- Additional fields for compatibility
  `pickup_notes` TEXT DEFAULT NULL,
  `pickup_time` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Pending', 'Verified', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
  `images` TEXT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_by_type` VARCHAR(50) DEFAULT NULL,
  `request_source` VARCHAR(50) DEFAULT NULL,
  `generated_by` INT DEFAULT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_waste_requests_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_requests_category` 
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_requests_subcategory` 
    FOREIGN KEY (`subcategory_id`) REFERENCES `sub_categories` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_requests_variation` 
    FOREIGN KEY (`variation_id`) REFERENCES `subcategory_variations` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_requests_time_slot` 
    FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_requests_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_requests_generated_by` 
    FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
