<?php

declare(strict_types=1);

const DEFAULT_DB_HOST = '127.0.0.1';
const DEFAULT_DB_PORT = 3306;
const DEFAULT_DB_NAME = 'deutschgram';
const DEFAULT_DB_CHARSET = 'utf8mb4';
const DEFAULT_APP_BASE_URL = 'http://localhost/deutschgram/';

if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}

if (!function_exists('str_ends_with')) {
    function str_ends_with(string $haystack, string $needle): bool
    {
        if ($needle === '') {
            return true;
        }

        return substr($haystack, -strlen($needle)) === $needle;
    }
}

final class HttpException extends RuntimeException
{
    private int $statusCode;

    public function __construct(string $message, int $statusCode = 400)
    {
        $this->statusCode = $statusCode;
        parent::__construct($message);
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }
}

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

    $lines = file($envPath, FILE_IGNORE_NEW_LINES);
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

        putenv($name . '=' . $value);
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

function configValue(string $constantName, string $envName, ?string $default = null): ?string
{
    if (defined($constantName)) {
        $value = constant($constantName);
        return is_string($value) ? $value : (string) $value;
    }

    $value = getenv($envName);
    if ($value !== false) {
        return (string) $value;
    }

    return $default;
}

function configIntValue(string $constantName, string $envName, int $default): int
{
    $value = configValue($constantName, $envName, (string) $default);
    return is_numeric($value) ? (int) $value : $default;
}

function appBaseUrl(): string
{
    $configured = configValue('DEUTSCHGRAM_APP_BASE_URL', 'DEUTSCHGRAM_APP_BASE_URL', DEFAULT_APP_BASE_URL);
    if ($configured !== null && trim($configured) !== '') {
        return rtrim(trim($configured), '/') . '/';
    }

    if (PHP_SAPI === 'cli') {
        return DEFAULT_APP_BASE_URL;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDirectory = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));

    if (str_ends_with($scriptDirectory, '/api')) {
        $scriptDirectory = dirname($scriptDirectory);
    }

    return $scheme . '://' . $host . rtrim($scriptDirectory, '/') . '/';
}

function dbRuntimeConfig(): array
{
    static $config = null;

    if (is_array($config)) {
        return $config;
    }

    $dsn = configValue('DEUTSCHGRAM_DB_DSN', 'DEUTSCHGRAM_DB_DSN');
    if ($dsn !== null && trim($dsn) !== '') {
        $config = [
            'driver' => 'mysql',
            'dsn' => trim($dsn),
            'username' => configValue('DEUTSCHGRAM_DB_USER', 'DEUTSCHGRAM_DB_USER', 'root') ?? 'root',
            'password' => configValue('DEUTSCHGRAM_DB_PASSWORD', 'DEUTSCHGRAM_DB_PASSWORD', '') ?? '',
        ];

        return $config;
    }

    $host = configValue('DEUTSCHGRAM_DB_HOST', 'DEUTSCHGRAM_DB_HOST', DEFAULT_DB_HOST) ?? DEFAULT_DB_HOST;
    $port = configIntValue('DEUTSCHGRAM_DB_PORT', 'DEUTSCHGRAM_DB_PORT', DEFAULT_DB_PORT);
    $database = configValue('DEUTSCHGRAM_DB_NAME', 'DEUTSCHGRAM_DB_NAME', DEFAULT_DB_NAME) ?? DEFAULT_DB_NAME;
    $charset = configValue('DEUTSCHGRAM_DB_CHARSET', 'DEUTSCHGRAM_DB_CHARSET', DEFAULT_DB_CHARSET) ?? DEFAULT_DB_CHARSET;

    $config = [
        'driver' => 'mysql',
        'dsn' => sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $database, $charset),
        'username' => configValue('DEUTSCHGRAM_DB_USER', 'DEUTSCHGRAM_DB_USER', 'root') ?? 'root',
        'password' => configValue('DEUTSCHGRAM_DB_PASSWORD', 'DEUTSCHGRAM_DB_PASSWORD', '') ?? '',
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
    $pdo = new PDO(
        $config['dsn'],
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $pdo->exec("SET time_zone = '+00:00'");
    migrateDatabase($pdo);

    return $pdo;
}

function ensureSchemaMigrationsTable(PDO $pdo): void
{
    $pdo->exec(
        <<<'SQL'
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id VARCHAR(120) NOT NULL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            applied_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL
    );
}

function migrationFiles(): array
{
    $files = glob(__DIR__ . '/../database/migrations/*.php');
    if ($files === false) {
        return [];
    }

    sort($files, SORT_STRING);
    return $files;
}

function appliedMigrationRows(PDO $pdo): array
{
    ensureSchemaMigrationsTable($pdo);
    $statement = $pdo->query('SELECT id, name, filename, applied_at FROM schema_migrations ORDER BY id ASC');
    return $statement->fetchAll();
}

function migrateDatabase(PDO $pdo): array
{
    static $didRun = false;
    static $applied = [];

    if ($didRun) {
        return $applied;
    }

    $known = [];
    foreach (appliedMigrationRows($pdo) as $row) {
        $known[$row['id']] = true;
    }

    foreach (migrationFiles() as $file) {
        $migration = require $file;

        if (!is_array($migration) || !isset($migration['id'], $migration['up']) || !is_callable($migration['up'])) {
            throw new RuntimeException('Invalid migration file: ' . basename($file));
        }

        $migrationId = (string) $migration['id'];
        $migrationName = (string) ($migration['name'] ?? $migrationId);

        if (isset($known[$migrationId])) {
            continue;
        }

        $migration['up']($pdo, dbDriver());

        $statement = $pdo->prepare(
            'INSERT INTO schema_migrations (id, name, filename, applied_at)
             VALUES (:id, :name, :filename, :applied_at)'
        );
        $statement->execute([
            'id' => $migrationId,
            'name' => $migrationName,
            'filename' => basename($file),
            'applied_at' => nowUtc(),
        ]);

        $known[$migrationId] = true;
        $applied[] = $migrationId;
    }

    $didRun = true;
    return $applied;
}

function executeSqlStatements(PDO $pdo, array $statements): void
{
    foreach ($statements as $statement) {
        $sql = trim((string) $statement);
        if ($sql !== '') {
            $pdo->exec($sql);
        }
    }
}

function nowUtc(): string
{
    return gmdate('Y-m-d H:i:s');
}

function jsonResponse(array $payload, int $statusCode = 200): void
{
    if (PHP_SAPI !== 'cli') {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $statusCode = 400)
{
    throw new HttpException($message, $statusCode);
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
    if (strcasecmp($_SERVER['REQUEST_METHOD'] ?? 'GET', 'GET') === 0) {
        return $_GET;
    }

    $jsonBody = readJsonBody();
    return $jsonBody !== [] ? $jsonBody : $_POST;
}

function requireMethod(string $method): void
{
    if (strcasecmp($_SERVER['REQUEST_METHOD'] ?? 'GET', $method) !== 0) {
        fail('Method not allowed.', 405);
    }
}