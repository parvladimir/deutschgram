<?php

declare(strict_types=1);

return [
    'id' => '202603230001_core_schema',
    'name' => 'Core chat schema',
    'up' => static function (PDO $pdo): void {
        executeSqlStatements($pdo, [
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(80) NOT NULL,
                display_name VARCHAR(120) NOT NULL,
                created_at DATETIME NOT NULL,
                last_seen_at DATETIME NOT NULL,
                UNIQUE KEY uniq_users_username (username),
                KEY idx_users_last_seen (last_seen_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS conversations (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                kind VARCHAR(20) NOT NULL DEFAULT 'direct',
                created_at DATETIME NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS conversation_members (
                conversation_id BIGINT UNSIGNED NOT NULL,
                user_id BIGINT UNSIGNED NOT NULL,
                joined_at DATETIME NOT NULL,
                last_read_message_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
                PRIMARY KEY (conversation_id, user_id),
                KEY idx_members_user_id (user_id),
                CONSTRAINT fk_conversation_members_conversation
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                CONSTRAINT fk_conversation_members_user
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS messages (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                conversation_id BIGINT UNSIGNED NOT NULL,
                sender_id BIGINT UNSIGNED NOT NULL,
                body TEXT NOT NULL,
                kind VARCHAR(20) NOT NULL DEFAULT 'text',
                created_at DATETIME NOT NULL,
                KEY idx_messages_conversation_id (conversation_id, id),
                KEY idx_messages_sender_id (sender_id),
                CONSTRAINT fk_messages_conversation
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                CONSTRAINT fk_messages_sender
                    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
            <<<'SQL'
            CREATE TABLE IF NOT EXISTS signals (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                conversation_id BIGINT UNSIGNED NOT NULL,
                sender_id BIGINT UNSIGNED NOT NULL,
                recipient_id BIGINT UNSIGNED NOT NULL,
                type VARCHAR(40) NOT NULL,
                payload LONGTEXT NULL,
                created_at DATETIME NOT NULL,
                consumed_at DATETIME NULL DEFAULT NULL,
                KEY idx_signals_recipient_consumed (recipient_id, consumed_at, id),
                KEY idx_signals_conversation_id (conversation_id),
                CONSTRAINT fk_signals_conversation
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                CONSTRAINT fk_signals_sender
                    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_signals_recipient
                    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL,
        ]);
    },
];