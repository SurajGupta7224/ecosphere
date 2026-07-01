CREATE TABLE IF NOT EXISTS `time_slots` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `slot_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add time_slot_id column to waste_collection_requests table dynamically if it does not exist
SET @dbname = DATABASE();
SET @tablename = "waste_collection_requests";
SET @columnname = "time_slot_id";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE `waste_collection_requests` ADD COLUMN `time_slot_id` BIGINT NULL, ADD CONSTRAINT `fk_waste_collection_requests_time_slot_id` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE SET NULL"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
