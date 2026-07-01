-- Migration: Alter waste_collection_requests table for Phase 1 public form integration
ALTER TABLE `waste_collection_requests`
DROP FOREIGN KEY `fk_waste_collection_requests_customer`,
DROP FOREIGN KEY `fk_waste_collection_requests_variation`,
DROP FOREIGN KEY `fk_waste_collection_requests_creator`;

ALTER TABLE `waste_collection_requests`
MODIFY COLUMN `customer_id` INT NULL,
MODIFY COLUMN `category_id` INT NULL,
MODIFY COLUMN `subcategory_id` INT NULL,
MODIFY COLUMN `variation_id` BIGINT NULL,
MODIFY COLUMN `generated_by` INT NULL;

ALTER TABLE `waste_collection_requests`
ADD COLUMN `customer_type` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `authorized_person_name` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `mobile_number` VARCHAR(20) DEFAULT NULL,
ADD COLUMN `email` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `address_search` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `latitude` DECIMAL(10, 8) DEFAULT NULL,
ADD COLUMN `longitude` DECIMAL(11, 8) DEFAULT NULL,
ADD COLUMN `waste_generator_name` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `complete_address` TEXT DEFAULT NULL,
ADD COLUMN `area_sqm` DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN `no_of_dwelling_units` INT DEFAULT NULL,
ADD COLUMN `registered_rwa` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `gst` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `pan` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `trade_license` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `variations_data` TEXT DEFAULT NULL;
