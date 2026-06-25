-- Migration: Create zones table
CREATE TABLE IF NOT EXISTS `zones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `corporation_id` INT NOT NULL,
  `zone_name` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_zone_per_corporation` (`corporation_id`, `zone_name`),
  CONSTRAINT `fk_zones_corporation` 
    FOREIGN KEY (`corporation_id`) REFERENCES `corporations` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
