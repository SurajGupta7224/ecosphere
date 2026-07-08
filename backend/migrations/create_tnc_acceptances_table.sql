-- Create table to store T&C acceptance records
CREATE TABLE IF NOT EXISTS `tnc_acceptances` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_name` VARCHAR(255) NULL,
  `accepted_checkboxes` TEXT NOT NULL COMMENT 'JSON: which checkboxes were ticked',
  `accepted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(100) NULL,
  `user_agent` TEXT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
