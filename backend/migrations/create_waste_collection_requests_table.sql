-- Migration: Create waste_collection_requests table
CREATE TABLE IF NOT EXISTS `waste_collection_requests` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `subcategory_id` INT NOT NULL,
  `variation_id` BIGINT NOT NULL,
  `suggested_weight` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `suggested_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `manual_weight` DECIMAL(10, 2) DEFAULT NULL,
  `final_weight` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `pickup_notes` TEXT DEFAULT NULL,
  `pickup_date` DATE NOT NULL,
  `pickup_time` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('Pending', 'Verified', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
  `images` TEXT DEFAULT NULL,
  `generated_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_waste_collection_requests_customer` 
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_collection_requests_category` 
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_collection_requests_subcategory` 
    FOREIGN KEY (`subcategory_id`) REFERENCES `sub_categories` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_collection_requests_variation` 
    FOREIGN KEY (`variation_id`) REFERENCES `subcategory_variations` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_collection_requests_creator` 
    FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
