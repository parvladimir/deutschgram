<?php

declare(strict_types=1);

return [
    'id' => '202603230002_invites',
    'name' => 'Invite-only access',
    'up' => static function (PDO $pdo): void {
        executeSqlStatements($pdo, [
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS invites (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                token CHAR(48) NOT NULL,
                note VARCHAR(255) NULL,
                assigned_user_id BIGINT UNSIGNED NULL,
                assigned_username VARCHAR(80) NULL,
                usage_count INT UNSIGNED NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL,
                last_used_at DATETIME NULL DEFAULT NULL,
                expires_at DATETIME NULL DEFAULT NULL,
                revoked_at DATETIME NULL DEFAULT NULL,
                UNIQUE KEY uniq_invites_token (token),
                UNIQUE KEY uniq_invites_assigned_user_id (assigned_user_id),
                UNIQUE KEY uniq_invites_assigned_username (assigned_username),
                CONSTRAINT fk_invites_assigned_user
                    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
            <<<'SQL'
            ALTER TABLE users
            MODIFY display_name VARCHAR(120) NOT NULL
            SQL,
        ]);
    },
];