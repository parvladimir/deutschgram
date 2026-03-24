<?php

declare(strict_types=1);

require __DIR__ . '/../api/bootstrap.php';
require __DIR__ . '/../api/auth.php';

$note = $argv[1] ?? null;
$baseUrl = $argv[2] ?? null;

try {
    $invite = createInvite($note, $baseUrl);

    echo 'Token: ' . $invite['token'] . PHP_EOL;
    echo 'Link:  ' . $invite['link'] . PHP_EOL;

    if (!empty($invite['note'])) {
        echo 'Note:  ' . $invite['note'] . PHP_EOL;
    }
} catch (Throwable $exception) {
    fwrite(STDERR, $exception->getMessage() . PHP_EOL);
    exit(1);
}