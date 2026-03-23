<?php

declare(strict_types=1);

const DEFAULT_DB_DRIVER = 'sqlite';
const DEFAULT_SQLITE_DB_PATH = __DIR__ . '/../storage/deutschgram.sqlite';
const DEFAULT_DB_HOST = '127.0.0.1';
const DEFAULT_DB_PORT = 3306;
const DEFAULT_DB_CHARSET = 'utf8mb4';
const ONLINE_WINDOW_SECONDS = 20;

loadEnvironmentFiles();

$localConfigFile = __DIR__ . '/../config.local.php';
if (is_file($localConfigFile)) {
    require_once $localConfigFile;
}

function loadEnvironmentFiles(): void
{
    $envPath = __DIR__ . '/../.env';
    if (!is_file($envPath)) {
        return;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $parts = explode('=', $trimmed, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $name = trim($parts[0]);
        $value = trim($parts[1]);

        if ($name === '') {
            continue;
        }

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        if (getenv($name) === false) {
            putenv($name . '=' . $value);
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

function configValue(string $constantName, string $envName, ?string $default = null): ?string
{
    if (defined($constantName)) {
        $value = constant($constantName);
        return is_string($value) ? $value : (string) $value;
    }

    $value = getenv($envName);
    if ($value !== false && $value !== '') {
        return (string) $value;
    }

    return $default;
}

function configIntValue(string $constantName, string $envName, int $default): int
{
    $value = configValue($constantName, $envName, (string) $default);
    return is_numeric($value) ? (int) $value : $default;
}

function dbRuntimeConfig(): array
{
    static $config = null;

    if (is_array($config)) {
        return $config;
    }

    $dsn = configValue('DEUTSCHGRAM_DB_DSN', 'DEUTSCHGRAM_DB_DSN');
    $username = configValue('DEUTSCHGRAM_DB_USER', 'DEUTSCHGRAM_DB_USER', '') ?? '';
    $password = configValue('DEUTSCHGRAM_DB_PASSWORD', 'DEUTSCHGRAM_DB_PASSWORD', '') ?? '';

    if ($dsn !== null && $dsn !== '') {
        $driver = strtolower((string) strtok($dsn, ':'));
        if ($driver === 'mariadb') {
            $dsn = 'mysql' . substr($dsn, strlen('mariadb'));
            $driver = 'mysql';
        }

        $config = [
            'driver' => $driver,
            'dsn' => $dsn,
            'username' => $username,
            'password' => $password,
            'path' => null,
        ];

        return $config;
    }

    $driver = strtolower(configValue('DEUTSCHGRAM_DB_DRIVER', 'DEUTSCHGRAM_DB_DRIVER', DEFAULT_DB_DRIVER) ?? DEFAULT_DB_DRIVER);
    if ($driver === 'mariadb') {
        $driver = 'mysql';
    }

    if ($driver === 'mysql') {
        $host = configValue('DEUTSCHGRAM_DB_HOST', 'DEUTSCHGRAM_DB_HOST', DEFAULT_DB_HOST) ?? DEFAULT_DB_HOST;
        $port = configIntValue('DEUTSCHGRAM_DB_PORT', 'DEUTSCHGRAM_DB_PORT', DEFAULT_DB_PORT);
        $database = configValue('DEUTSCHGRAM_DB_NAME', 'DEUTSCHGRAM_DB_NAME');
        $charset = configValue('DEUTSCHGRAM_DB_CHARSET', 'DEUTSCHGRAM_DB_CHARSET', DEFAULT_DB_CHARSET) ?? DEFAULT_DB_CHARSET;

        if ($database === null || trim($database) === '') {
            throw new RuntimeException('MySQL database name is not configured.');
        }

        $config = [
            'driver' => 'mysql',
            'dsn' => sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $database, $charset),
            'username' => $username,
            'password' => $password,
            'path' => null,
        ];

        return $config;
    }

    if ($driver !== 'sqlite') {
        throw new RuntimeException('Unsupported database driver: ' . $driver);
    }

    $path = configValue('DEUTSCHGRAM_DB_PATH', 'DEUTSCHGRAM_DB_PATH', DEFAULT_SQLITE_DB_PATH) ?? DEFAULT_SQLITE_DB_PATH;

    $config = [
        'driver' => 'sqlite',
        'dsn' => 'sqlite:' . $path,
        'username' => '',
        'password' => '',
        'path' => $path,
    ];

    return $config;
}

function dbDriver(): string
{
    return dbRuntimeConfig()['driver'];
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = dbRuntimeConfig();

    if ($config['driver'] === 'sqlite') {
        $storageDir = dirname((string) $config['path']);
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0777, true);
        }
    }

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    if ($config['driver'] === 'mysql') {
        $options[PDO::ATTR_EMULATE_PREPARES] = false;
    }

    $pdo = new PDO($config['dsn'], $config['username'], $config['password'], $options);

    if ($config['driver'] === 'sqlite') {
        $pdo->exec('PRAGMA foreign_keys = ON');
    }

    if ($config['driver'] === 'mysql') {
        $pdo->exec("SET time_zone = '+00:00'");
    }

    initializeDatabase($pdo);

    return $pdo;
}

function initializeDatabase(PDO $pdo): void
{
    if (dbDriver() === 'mysql') {
        initializeMySqlDatabase($pdo);
        cleanupOldSignals($pdo);
        return;
    }

    initializeSqliteDatabase($pdo);
    cleanupOldSignals($pdo);
}

function initializeSqliteDatabase(PDO $pdo): void
{
    $pdo->exec(
        <<<'SQL'
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL DEFAULT 'direct',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS conversation_members (
            conversation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            joined_at TEXT NOT NULL,
            last_read_message_id INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (conversation_id, user_id),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            body TEXT NOT NULL,
            kind TEXT NOT NULL DEFAULT 'text',
            created_at TEXT NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            recipient_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            payload TEXT,
            created_at TEXT NOT NULL,
            consumed_at TEXT DEFAULT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, id);
        CREATE INDEX IF NOT EXISTS idx_signals_recipient_consumed ON signals(recipient_id, consumed_at, id);
        CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at);
        SQL
    );
}

function initializeMySqlDatabase(PDO $pdo): void
{
    $pdo->exec(
        <<<'SQL'
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) NOT NULL,
            display_name VARCHAR(120) NOT NULL,
            created_at DATETIME NOT NULL,
            last_seen_at DATETIME NOT NULL,
            UNIQUE KEY uniq_users_username (username),
            KEY idx_users_last_seen (last_seen_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS conversations (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            kind VARCHAR(20) NOT NULL DEFAULT 'direct',
            created_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        SQL
    );
}

function cleanupOldSignals(PDO $pdo): void
{
    if (dbDriver() === 'mysql') {
        $pdo->exec(
            "DELETE FROM signals WHERE consumed_at IS NOT NULL AND created_at < (UTC_TIMESTAMP() - INTERVAL 2 DAY)"
        );
        return;
    }

    $pdo->exec(
        "DELETE FROM signals WHERE consumed_at IS NOT NULL AND created_at < datetime('now', '-2 days')"
    );
}

function nowUtc(): string
{
    return gmdate('Y-m-d H:i:s');
}

function readProgressExpression(): string
{
    return dbDriver() === 'mysql'
        ? 'GREATEST(last_read_message_id, :last_read_message_id)'
        : 'MAX(last_read_message_id, :last_read_message_id)';
}

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $statusCode = 400): void
{
    jsonResponse([
        'ok' => false,
        'error' => $message,
    ], $statusCode);
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Invalid JSON payload.');
    }

    return $data;
}

function requestData(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        return $_GET;
    }

    $jsonBody = readJsonBody();
    if ($jsonBody !== []) {
        return $jsonBody;
    }

    return $_POST;
}

function requireMethod(string $method): void
{
    if (strcasecmp($_SERVER['REQUEST_METHOD'] ?? 'GET', $method) !== 0) {
        fail('Method not allowed.', 405);
    }
}

function normalizeUsername(string $username): string
{
    $username = trim($username);
    $username = preg_replace('/[^\p{L}\p{N}._-]+/u', '-', $username) ?? '';
    $username = trim($username, '-._');

    if ($username === '') {
        fail('Choose a nickname with letters or numbers.');
    }

    return mb_strtolower($username, 'UTF-8');
}

function sanitizeDisplayName(string $displayName): string
{
    $displayName = trim($displayName);
    if ($displayName === '') {
        fail('Display name is required.');
    }

    return mb_substr($displayName, 0, 60, 'UTF-8');
}

function getUserById(int $userId): ?array
{
    $statement = db()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $userId]);
    $user = $statement->fetch();

    return $user ?: null;
}

function requireUser(int $userId): array
{
    $user = getUserById($userId);
    if ($user === null) {
        fail('User not found.', 404);
    }

    return $user;
}

function touchPresence(int $userId): void
{
    $statement = db()->prepare('UPDATE users SET last_seen_at = :last_seen_at WHERE id = :id');
    $statement->execute([
        'last_seen_at' => nowUtc(),
        'id' => $userId,
    ]);
}

function registerUser(string $username, string $displayName): array
{
    $pdo = db();
    $username = normalizeUsername($username);
    $displayName = sanitizeDisplayName($displayName);

    $existing = $pdo->prepare('SELECT * FROM users WHERE username = :username LIMIT 1');
    $existing->execute(['username' => $username]);
    $user = $existing->fetch();

    if ($user) {
        $update = $pdo->prepare(
            'UPDATE users SET display_name = :display_name, last_seen_at = :last_seen_at WHERE id = :id'
        );
        $update->execute([
            'display_name' => $displayName,
            'last_seen_at' => nowUtc(),
            'id' => $user['id'],
        ]);

        return requireUser((int) $user['id']);
    }

    $insert = $pdo->prepare(
        'INSERT INTO users (username, display_name, created_at, last_seen_at)
         VALUES (:username, :display_name, :created_at, :last_seen_at)'
    );
    $insert->execute([
        'username' => $username,
        'display_name' => $displayName,
        'created_at' => nowUtc(),
        'last_seen_at' => nowUtc(),
    ]);

    return requireUser((int) $pdo->lastInsertId());
}

function isUserOnline(string $lastSeenAt): bool
{
    return (time() - strtotime($lastSeenAt)) <= ONLINE_WINDOW_SECONDS;
}

function serializeUser(array $user, ?int $currentUserId = null): array
{
    return [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'display_name' => $user['display_name'],
        'last_seen_at' => $user['last_seen_at'],
        'is_online' => isUserOnline($user['last_seen_at']),
        'is_current_user' => $currentUserId !== null && (int) $user['id'] === $currentUserId,
    ];
}

function listUsers(int $currentUserId): array
{
    $statement = db()->prepare(
        'SELECT * FROM users WHERE id != :current_user_id ORDER BY last_seen_at DESC, display_name ASC'
    );
    $statement->execute(['current_user_id' => $currentUserId]);

    return array_map(
        static fn(array $user): array => serializeUser($user, $currentUserId),
        $statement->fetchAll()
    );
}

function findOrCreateDirectConversation(int $userId, int $peerUserId): array
{
    if ($userId === $peerUserId) {
        fail('Choose another person to start chatting.');
    }

    requireUser($userId);
    requireUser($peerUserId);

    $pdo = db();

    $existing = $pdo->prepare(
        <<<'SQL'
        SELECT c.id
        FROM conversations c
        INNER JOIN conversation_members me
            ON me.conversation_id = c.id AND me.user_id = :user_id
        INNER JOIN conversation_members peer
            ON peer.conversation_id = c.id AND peer.user_id = :peer_user_id
        WHERE c.kind = 'direct'
          AND (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) = 2
        LIMIT 1
        SQL
    );
    $existing->execute([
        'user_id' => $userId,
        'peer_user_id' => $peerUserId,
    ]);

    $conversationId = $existing->fetchColumn();

    if ($conversationId !== false) {
        return getConversationSummary((int) $conversationId, $userId);
    }

    $pdo->beginTransaction();

    try {
        $createConversation = $pdo->prepare(
            'INSERT INTO conversations (kind, created_at) VALUES (:kind, :created_at)'
        );
        $createConversation->execute([
            'kind' => 'direct',
            'created_at' => nowUtc(),
        ]);

        $conversationId = (int) $pdo->lastInsertId();

        $addMember = $pdo->prepare(
            'INSERT INTO conversation_members (conversation_id, user_id, joined_at)
             VALUES (:conversation_id, :user_id, :joined_at)'
        );

        foreach ([$userId, $peerUserId] as $memberId) {
            $addMember->execute([
                'conversation_id' => $conversationId,
                'user_id' => $memberId,
                'joined_at' => nowUtc(),
            ]);
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    return getConversationSummary($conversationId, $userId);
}

function ensureConversationMembership(int $conversationId, int $userId): void
{
    $statement = db()->prepare(
        'SELECT 1 FROM conversation_members WHERE conversation_id = :conversation_id AND user_id = :user_id LIMIT 1'
    );
    $statement->execute([
        'conversation_id' => $conversationId,
        'user_id' => $userId,
    ]);

    if ($statement->fetchColumn() === false) {
        fail('Conversation not found.', 404);
    }
}

function serializeConversationRow(array $row, int $currentUserId): array
{
    $lastMessage = null;
    if ($row['last_message_id'] !== null) {
        $lastMessage = [
            'id' => (int) $row['last_message_id'],
            'body' => $row['last_message_body'],
            'created_at' => $row['last_message_created_at'],
            'sender_id' => (int) $row['last_message_sender_id'],
            'is_from_current_user' => (int) $row['last_message_sender_id'] === $currentUserId,
        ];
    }

    return [
        'id' => (int) $row['id'],
        'kind' => $row['kind'],
        'created_at' => $row['created_at'],
        'peer' => [
            'id' => (int) $row['peer_id'],
            'username' => $row['peer_username'],
            'display_name' => $row['peer_display_name'],
            'last_seen_at' => $row['peer_last_seen_at'],
            'is_online' => isUserOnline($row['peer_last_seen_at']),
        ],
        'last_message' => $lastMessage,
        'unread_count' => (int) $row['unread_count'],
    ];
}

function getConversationSummary(int $conversationId, int $currentUserId): array
{
    ensureConversationMembership($conversationId, $currentUserId);

    $statement = db()->prepare(
        <<<'SQL'
        SELECT
            c.id,
            c.kind,
            c.created_at,
            peer.id AS peer_id,
            peer.username AS peer_username,
            peer.display_name AS peer_display_name,
            peer.last_seen_at AS peer_last_seen_at,
            last_message.id AS last_message_id,
            last_message.body AS last_message_body,
            last_message.created_at AS last_message_created_at,
            last_message.sender_id AS last_message_sender_id,
            (
                SELECT COUNT(*)
                FROM messages unread
                WHERE unread.conversation_id = c.id
                  AND unread.id > me.last_read_message_id
                  AND unread.sender_id != :current_user_id
            ) AS unread_count
        FROM conversations c
        INNER JOIN conversation_members me
            ON me.conversation_id = c.id AND me.user_id = :current_user_id
        INNER JOIN conversation_members peer_member
            ON peer_member.conversation_id = c.id AND peer_member.user_id != :current_user_id
        INNER JOIN users peer
            ON peer.id = peer_member.user_id
        LEFT JOIN messages last_message
            ON last_message.id = (
                SELECT id
                FROM messages
                WHERE conversation_id = c.id
                ORDER BY id DESC
                LIMIT 1
            )
        WHERE c.id = :conversation_id
        LIMIT 1
        SQL
    );
    $statement->execute([
        'conversation_id' => $conversationId,
        'current_user_id' => $currentUserId,
    ]);

    $conversation = $statement->fetch();
    if (!$conversation) {
        fail('Conversation not found.', 404);
    }

    return serializeConversationRow($conversation, $currentUserId);
}

function listConversations(int $currentUserId): array
{
    $statement = db()->prepare(
        <<<'SQL'
        SELECT
            c.id,
            c.kind,
            c.created_at,
            peer.id AS peer_id,
            peer.username AS peer_username,
            peer.display_name AS peer_display_name,
            peer.last_seen_at AS peer_last_seen_at,
            last_message.id AS last_message_id,
            last_message.body AS last_message_body,
            last_message.created_at AS last_message_created_at,
            last_message.sender_id AS last_message_sender_id,
            (
                SELECT COUNT(*)
                FROM messages unread
                WHERE unread.conversation_id = c.id
                  AND unread.id > me.last_read_message_id
                  AND unread.sender_id != :current_user_id
            ) AS unread_count
        FROM conversations c
        INNER JOIN conversation_members me
            ON me.conversation_id = c.id AND me.user_id = :current_user_id
        INNER JOIN conversation_members peer_member
            ON peer_member.conversation_id = c.id AND peer_member.user_id != :current_user_id
        INNER JOIN users peer
            ON peer.id = peer_member.user_id
        LEFT JOIN messages last_message
            ON last_message.id = (
                SELECT id
                FROM messages
                WHERE conversation_id = c.id
                ORDER BY id DESC
                LIMIT 1
            )
        ORDER BY COALESCE(last_message.id, c.id) DESC, c.id DESC
        SQL
    );
    $statement->execute(['current_user_id' => $currentUserId]);

    return array_map(
        static fn(array $conversation): array => serializeConversationRow($conversation, $currentUserId),
        $statement->fetchAll()
    );
}

function serializeMessage(array $message, int $currentUserId): array
{
    return [
        'id' => (int) $message['id'],
        'conversation_id' => (int) $message['conversation_id'],
        'sender_id' => (int) $message['sender_id'],
        'sender_username' => $message['sender_username'],
        'sender_display_name' => $message['sender_display_name'],
        'body' => $message['body'],
        'kind' => $message['kind'],
        'created_at' => $message['created_at'],
        'is_from_current_user' => (int) $message['sender_id'] === $currentUserId,
    ];
}

function getConversationMessages(int $conversationId, int $currentUserId, int $afterMessageId = 0): array
{
    ensureConversationMembership($conversationId, $currentUserId);
    $pdo = db();

    if ($afterMessageId > 0) {
        $statement = $pdo->prepare(
            <<<'SQL'
            SELECT
                m.id,
                m.conversation_id,
                m.sender_id,
                m.body,
                m.kind,
                m.created_at,
                sender.username AS sender_username,
                sender.display_name AS sender_display_name
            FROM messages m
            INNER JOIN users sender ON sender.id = m.sender_id
            WHERE m.conversation_id = :conversation_id
              AND m.id > :after_message_id
            ORDER BY m.id ASC
            LIMIT 100
            SQL
        );
        $statement->execute([
            'conversation_id' => $conversationId,
            'after_message_id' => $afterMessageId,
        ]);

        return array_map(
            static fn(array $message): array => serializeMessage($message, $currentUserId),
            $statement->fetchAll()
        );
    }

    $statement = $pdo->prepare(
        <<<'SQL'
        SELECT *
        FROM (
            SELECT
                m.id,
                m.conversation_id,
                m.sender_id,
                m.body,
                m.kind,
                m.created_at,
                sender.username AS sender_username,
                sender.display_name AS sender_display_name
            FROM messages m
            INNER JOIN users sender ON sender.id = m.sender_id
            WHERE m.conversation_id = :conversation_id
            ORDER BY m.id DESC
            LIMIT 50
        ) recent_messages
        ORDER BY id ASC
        SQL
    );
    $statement->execute(['conversation_id' => $conversationId]);

    return array_map(
        static fn(array $message): array => serializeMessage($message, $currentUserId),
        $statement->fetchAll()
    );
}

function getMessageById(int $messageId, int $currentUserId): array
{
    $statement = db()->prepare(
        <<<'SQL'
        SELECT
            m.id,
            m.conversation_id,
            m.sender_id,
            m.body,
            m.kind,
            m.created_at,
            sender.username AS sender_username,
            sender.display_name AS sender_display_name
        FROM messages m
        INNER JOIN users sender ON sender.id = m.sender_id
        WHERE m.id = :message_id
        LIMIT 1
        SQL
    );
    $statement->execute(['message_id' => $messageId]);
    $message = $statement->fetch();

    if (!$message) {
        fail('Message not found.', 404);
    }

    return serializeMessage($message, $currentUserId);
}

function sendMessage(int $conversationId, int $senderId, string $body): array
{
    ensureConversationMembership($conversationId, $senderId);
    $body = trim($body);

    if ($body === '') {
        fail('Message is empty.');
    }

    $statement = db()->prepare(
        'INSERT INTO messages (conversation_id, sender_id, body, kind, created_at)
         VALUES (:conversation_id, :sender_id, :body, :kind, :created_at)'
    );
    $statement->execute([
        'conversation_id' => $conversationId,
        'sender_id' => $senderId,
        'body' => mb_substr($body, 0, 4000, 'UTF-8'),
        'kind' => 'text',
        'created_at' => nowUtc(),
    ]);

    return getMessageById((int) db()->lastInsertId(), $senderId);
}

function markConversationRead(int $conversationId, int $userId): void
{
    ensureConversationMembership($conversationId, $userId);

    $latest = db()->prepare(
        'SELECT COALESCE(MAX(id), 0) FROM messages WHERE conversation_id = :conversation_id'
    );
    $latest->execute(['conversation_id' => $conversationId]);
    $lastMessageId = (int) $latest->fetchColumn();

    $statement = db()->prepare(
        'UPDATE conversation_members
         SET last_read_message_id = ' . readProgressExpression() . '
         WHERE conversation_id = :conversation_id AND user_id = :user_id'
    );
    $statement->execute([
        'last_read_message_id' => $lastMessageId,
        'conversation_id' => $conversationId,
        'user_id' => $userId,
    ]);
}

function sendSignal(
    int $conversationId,
    int $senderId,
    int $recipientId,
    string $type,
    array $payload = []
): void {
    ensureConversationMembership($conversationId, $senderId);
    ensureConversationMembership($conversationId, $recipientId);

    $allowedTypes = [
        'call-offer',
        'call-answer',
        'ice-candidate',
        'call-hangup',
        'call-decline',
        'call-busy',
    ];

    if (!in_array($type, $allowedTypes, true)) {
        fail('Unsupported signal type.');
    }

    $statement = db()->prepare(
        'INSERT INTO signals (conversation_id, sender_id, recipient_id, type, payload, created_at)
         VALUES (:conversation_id, :sender_id, :recipient_id, :type, :payload, :created_at)'
    );
    $statement->execute([
        'conversation_id' => $conversationId,
        'sender_id' => $senderId,
        'recipient_id' => $recipientId,
        'type' => $type,
        'payload' => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'created_at' => nowUtc(),
    ]);
}

function consumeSignals(int $userId): array
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $statement = $pdo->prepare(
            <<<'SQL'
            SELECT
                s.id,
                s.conversation_id,
                s.sender_id,
                s.recipient_id,
                s.type,
                s.payload,
                s.created_at,
                sender.username AS sender_username,
                sender.display_name AS sender_display_name
            FROM signals s
            INNER JOIN users sender ON sender.id = s.sender_id
            WHERE s.recipient_id = :user_id
              AND s.consumed_at IS NULL
            ORDER BY s.id ASC
            LIMIT 100
            SQL
        );
        $statement->execute(['user_id' => $userId]);
        $signals = $statement->fetchAll();

        if ($signals !== []) {
            $ids = array_map(static fn(array $signal): int => (int) $signal['id'], $signals);
            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            $update = $pdo->prepare("UPDATE signals SET consumed_at = ? WHERE id IN ($placeholders)");
            $update->execute(array_merge([nowUtc()], $ids));
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    return array_map(static function (array $signal): array {
        return [
            'id' => (int) $signal['id'],
            'conversation_id' => (int) $signal['conversation_id'],
            'sender_id' => (int) $signal['sender_id'],
            'recipient_id' => (int) $signal['recipient_id'],
            'sender_username' => $signal['sender_username'],
            'sender_display_name' => $signal['sender_display_name'],
            'type' => $signal['type'],
            'payload' => $signal['payload'] ? json_decode($signal['payload'], true) : [],
            'created_at' => $signal['created_at'],
        ];
    }, $signals);
}
