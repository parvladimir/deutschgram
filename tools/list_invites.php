<?php

declare(strict_types=1);

require __DIR__ . '/../api/bootstrap.php';
require __DIR__ . '/../api/auth.php';

try {
    foreach (listInvites() as $invite) {
        echo $invite['token'] . ' | ';
        echo ($invite['assigned_username'] ?? '-') . ' | ';
        echo ($invite['note'] ?? '-') . ' | ';
        echo $invite['link'] . PHP_EOL;
    }
} catch (Throwable $exception) {
    fwrite(STDERR, $exception->getMessage() . PHP_EOL);
    exit(1);
}