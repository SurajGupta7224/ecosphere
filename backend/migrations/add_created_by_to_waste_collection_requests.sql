-- Migration: Add created_by tracking columns to waste_collection_requests
ALTER TABLE `waste_collection_requests`
ADD COLUMN `created_by` INT DEFAULT NULL AFTER `images`,
ADD COLUMN `created_by_type` VARCHAR(50) DEFAULT NULL AFTER `created_by`,
ADD COLUMN `request_source` VARCHAR(50) DEFAULT NULL AFTER `created_by_type`,
ADD CONSTRAINT `fk_waste_collection_requests_created_by` 
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) 
  ON DELETE SET NULL ON UPDATE CASCADE;
