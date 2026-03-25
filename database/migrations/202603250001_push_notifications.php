<?php

declare(strict_types=1);

return [
    'id' => '202603250001_push_notifications',
    'name' => 'Push subscriptions and notifications',
    'up' => static function (PDO $pdo): void {
        executeSqlStatements($pdo, [
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL,
                endpoint_hash CHAR(64) NOT NULL,
                endpoint TEXT NOT NULL,
                device_token CHAR(64) NOT NULL,
                p256dh VARCHAR(255) NULL,
                auth_token VARCHAR(255) NULL,
                content_encoding VARCHAR(50) NULL,
                user_agent VARCHAR(255) NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                last_seen_at DATETIME NOT NULL,
                last_push_at DATETIME NULL DEFAULT NULL,
                failure_count INT UNSIGNED NOT NULL DEFAULT 0,
                last_error VARCHAR(255) NULL,
                revoked_at DATETIME NULL DEFAULT NULL,
                UNIQUE KEY uniq_push_subscriptions_endpoint_hash (endpoint_hash),
                UNIQUE KEY uniq_push_subscriptions_device_token (device_token),
                KEY idx_push_subscriptions_user_id (user_id),
                KEY idx_push_subscriptions_revoked_at (revoked_at),
                CONSTRAINT fk_push_subscriptions_user
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS push_notifications (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                subscription_id BIGINT UNSIGNED NOT NULL,
                kind VARCHAR(40) NOT NULL,
                title VARCHAR(255) NOT NULL,
                body VARCHAR(500) NOT NULL,
                url VARCHAR(255) NOT NULL,
                tag VARCHAR(120) NULL,
                created_at DATETIME NOT NULL,
                delivered_at DATETIME NULL DEFAULT NULL,
                consumed_at DATETIME NULL DEFAULT NULL,
                KEY idx_push_notifications_subscription_id (subscription_id),
                KEY idx_push_notifications_consumed_at (consumed_at),
                CONSTRAINT fk_push_notifications_subscription
                    FOREIGN KEY (subscription_id) REFERENCES push_subscriptions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
        ]);
    },
];