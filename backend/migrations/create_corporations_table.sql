-- Migration: Create corporations table
CREATE TABLE IF NOT EXISTS `corporations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `corporation_name` VARCHAR(100) NOT NULL UNIQUE,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
