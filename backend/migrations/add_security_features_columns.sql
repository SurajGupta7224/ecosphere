-- Add missing columns to security_settings table
ALTER TABLE `security_settings` 
ADD COLUMN IF NOT EXISTS `two_factor_enabled` TINYINT(1) DEFAULT 0 AFTER `enable_2fa`,
ADD COLUMN IF NOT EXISTS `captcha_enabled` TINYINT(1) DEFAULT 0 AFTER `two_factor_enabled`,
ADD COLUMN IF NOT EXISTS `force_https` TINYINT(1) DEFAULT 0 AFTER `captcha_enabled`,
ADD COLUMN IF NOT EXISTS `allow_multiple_sessions` TINYINT(1) DEFAULT 1 AFTER `force_https`;

-- Add session and 2FA columns to users table
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `two_factor_secret` VARCHAR(255) DEFAULT NULL AFTER `password_changed_at`,
ADD COLUMN IF NOT EXISTS `current_session_token` VARCHAR(255) DEFAULT NULL AFTER `two_factor_secret`;
