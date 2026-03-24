<?php

declare(strict_types=1);

require __DIR__ . '/../api/bootstrap.php';

try {
    $pdo = db();
    $applied = migrateDatabase($pdo);
    $rows = appliedMigrationRows($pdo);

    echo "Applied migrations now: " . count($applied) . PHP_EOL;
    foreach ($applied as $migrationId) {
        echo "  + {$migrationId}" . PHP_EOL;
    }

    echo "Total migrations in database: " . count($rows) . PHP_EOL;
    foreach ($rows as $row) {
        echo "  - {$row['id']} ({$row['applied_at']})" . PHP_EOL;
    }
} catch (Throwable $exception) {
    fwrite(STDERR, $exception->getMessage() . PHP_EOL);
    exit(1);
}