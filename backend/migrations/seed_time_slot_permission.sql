-- Seed time_slot_management permission if not exists
INSERT INTO `permissions` (`permission_name`, `created_at`, `updated_at`)
SELECT 'time_slot_management', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM `permissions` WHERE `permission_name` = 'time_slot_management'
);

-- Associate time_slot_management permission with admin role (role_id = 1)
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`, `updated_at`)
SELECT 1, `id`, NOW(), NOW()
FROM `permissions`
WHERE `permission_name` = 'time_slot_management'
AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` 
    WHERE `role_id` = 1 
    AND `permission_id` = (SELECT `id` FROM `permissions` WHERE `permission_name` = 'time_slot_management')
);
