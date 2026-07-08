-- Migration: Create wards table
CREATE TABLE IF NOT EXISTS `wards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `corporation_id` INT NOT NULL,
  `zone_id` INT NOT NULL,
  `ward_name` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_ward_per_zone` (`zone_id`, `ward_name`),
  CONSTRAINT `fk_wards_corporation` 
    FOREIGN KEY (`corporation_id`) REFERENCES `corporations` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_wards_zone` 
    FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
