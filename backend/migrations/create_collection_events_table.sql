-- Migration: Create collection_events table
CREATE TABLE IF NOT EXISTS `collection_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `corporation_id` INT NOT NULL,
  `zone_id` INT NOT NULL,
  `ward_id` INT NOT NULL,
  `event_name` VARCHAR(150) NOT NULL,
  `categories` JSON NOT NULL,
  `address` TEXT NOT NULL,
  `landmark` VARCHAR(150) DEFAULT NULL,
  `google_map_url` VARCHAR(255) DEFAULT NULL,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_event_per_ward` (`ward_id`, `event_name`),
  CONSTRAINT `fk_collection_events_corporation` 
    FOREIGN KEY (`corporation_id`) REFERENCES `corporations` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_collection_events_zone` 
    FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_collection_events_ward` 
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
