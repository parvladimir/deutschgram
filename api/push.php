<?php

declare(strict_types=1);

const PUSH_NOTIFICATION_TTL = 60;
const PUSH_VAPID_LIFETIME = 43200;

function pushStoragePath(string $filename): string
{
    return __DIR__ . '/../storage/' . ltrim($filename, '/\\');
}

function ensureOpenSslConfig(): void
{
    $configured = getenv('OPENSSL_CONF');
    if ($configured !== false && is_file($configured)) {
        return;
    }

    $candidates = [
        __DIR__ . '/../storage/openssl.cnf',
        'C:/wamp64/bin/php/php8.4.0/extras/ssl/openssl.cnf',
        'C:/wamp64/bin/apache/apache2.4.62.1/conf/openssl.cnf',
    ];

    foreach ($candidates as $candidate) {
        if (!is_file($candidate)) {
            continue;
        }

        putenv('OPENSSL_CONF=' . $candidate);
        $_ENV['OPENSSL_CONF'] = $candidate;
        $_SERVER['OPENSSL_CONF'] = $candidate;
        return;
    }
}

function base64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64UrlDecode(string $value): string
{
    $padding = strlen($value) % 4;
    if ($padding > 0) {
        $value .= str_repeat('=', 4 - $padding);
    }

    $decoded = base64_decode(strtr($value, '-_', '+/'), true);
    return $decoded === false ? '' : $decoded;
}

function derLength(string $value, int &$offset): int
{
    $length = ord($value[$offset]);
    $offset += 1;

    if (($length & 0x80) === 0) {
        return $length;
    }

    $octets = $length & 0x7f;
    $length = 0;
    for ($index = 0; $index < $octets; $index += 1) {
        $length = ($length << 8) | ord($value[$offset]);
        $offset += 1;
    }

    return $length;
}

function derToJose(string $derSignature, int $partLength = 32): string
{
    $offset = 0;

    if (ord($derSignature[$offset]) !== 0x30) {
        fail('Invalid DER signature.', 500);
    }
    $offset += 1;
    derLength($derSignature, $offset);

    if (ord($derSignature[$offset]) !== 0x02) {
        fail('Invalid DER signature.', 500);
    }
    $offset += 1;
    $rLength = derLength($derSignature, $offset);
    $r = substr($derSignature, $offset, $rLength);
    $offset += $rLength;

    if (ord($derSignature[$offset]) !== 0x02) {
        fail('Invalid DER signature.', 500);
    }
    $offset += 1;
    $sLength = derLength($derSignature, $offset);
    $s = substr($derSignature, $offset, $sLength);

    $r = ltrim($r, "\x00");
    $s = ltrim($s, "\x00");
    $r = str_pad($r, $partLength, "\x00", STR_PAD_LEFT);
    $s = str_pad($s, $partLength, "\x00", STR_PAD_LEFT);

    return $r . $s;
}

function ensurePushKeyPair(): array
{
    static $keys = null;

    if (is_array($keys)) {
        return $keys;
    }

    $privatePath = pushStoragePath('push-vapid-private.pem');
    $publicPath = pushStoragePath('push-vapid-public.txt');

    if (is_file($privatePath) && is_file($publicPath)) {
        $keys = [
            'private_pem' => (string) file_get_contents($privatePath),
            'public_key' => trim((string) file_get_contents($publicPath)),
        ];
        return $keys;
    }

    ensureOpenSslConfig();

    $resource = openssl_pkey_new([
        'private_key_type' => OPENSSL_KEYTYPE_EC,
        'curve_name' => 'prime256v1',
    ]);

    if ($resource === false) {
        $message = openssl_error_string() ?: 'Unable to generate VAPID key pair.';
        fail($message, 500);
    }

    openssl_pkey_export($resource, $privatePem);
    $details = openssl_pkey_get_details($resource);

    if (!is_array($details) || !isset($details['ec']['x'], $details['ec']['y'])) {
        fail('Unable to read generated VAPID public key.', 500);
    }

    $publicKey = base64UrlEncode("\x04" . $details['ec']['x'] . $details['ec']['y']);

    file_put_contents($privatePath, $privatePem);
    file_put_contents($publicPath, $publicKey);

    $keys = [
        'private_pem' => $privatePem,
        'public_key' => $publicKey,
    ];

    return $keys;
}

function pushPublicKey(): string
{
    return ensurePushKeyPair()['public_key'];
}

function pushSubject(): string
{
    return configValue('DEUTSCHGRAM_PUSH_SUBJECT', 'DEUTSCHGRAM_PUSH_SUBJECT', 'mailto:deutschgram@localhost')
        ?? 'mailto:deutschgram@localhost';
}

function createVapidJwt(string $audience): string
{
    $header = base64UrlEncode(json_encode([
        'typ' => 'JWT',
        'alg' => 'ES256',
    ], JSON_UNESCAPED_SLASHES));

    $claims = base64UrlEncode(json_encode([
        'aud' => $audience,
        'exp' => time() + PUSH_VAPID_LIFETIME,
        'sub' => pushSubject(),
    ], JSON_UNESCAPED_SLASHES));

    $data = $header . '.' . $claims;
    $privatePem = ensurePushKeyPair()['private_pem'];

    $signature = '';
    $signed = openssl_sign($data, $signature, $privatePem, OPENSSL_ALGO_SHA256);
    if ($signed !== true) {
        fail(openssl_error_string() ?: 'Unable to sign VAPID JWT.', 500);
    }

    return $data . '.' . base64UrlEncode(derToJose($signature));
}

function normalizePushDeviceToken(string $deviceToken): string
{
    $normalized = strtolower(preg_replace('/[^a-f0-9]+/i', '', trim($deviceToken)) ?? '');
    if (strlen($normalized) !== 64) {
        fail('Invalid push device token.', 422);
    }

    return $normalized;
}

function normalizePushSubscription(array $subscription): array
{
    $endpoint = trim((string) ($subscription['endpoint'] ?? ''));
    if ($endpoint === '') {
        fail('Push endpoint is required.', 422);
    }

    $keys = is_array($subscription['keys'] ?? null) ? $subscription['keys'] : [];

    return [
        'endpoint' => $endpoint,
        'endpoint_hash' => hash('sha256', $endpoint),
        'p256dh' => trim((string) ($keys['p256dh'] ?? '')),
        'auth_token' => trim((string) ($keys['auth'] ?? '')),
        'content_encoding' => trim((string) ($subscription['contentEncoding'] ?? 'aes128gcm')),
    ];
}

function pushAudienceFromEndpoint(string $endpoint): string
{
    $parts = parse_url($endpoint);
    if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
        fail('Invalid push endpoint.', 422);
    }

    $audience = $parts['scheme'] . '://' . $parts['host'];
    if (isset($parts['port'])) {
        $audience .= ':' . $parts['port'];
    }

    return $audience;
}

function recordPushFailure(int $subscriptionId, string $message, bool $revoke = false): void
{
    $statement = db()->prepare(
        'UPDATE push_subscriptions
         SET failure_count = failure_count + 1,
             last_error = :last_error,
             revoked_at = CASE WHEN :revoke = 1 THEN :revoked_at ELSE revoked_at END,
             updated_at = :updated_at
         WHERE id = :id'
    );
    $statement->execute([
        'last_error' => mb_substr($message, 0, 255, 'UTF-8'),
        'revoke' => $revoke ? 1 : 0,
        'revoked_at' => $revoke ? nowUtc() : null,
        'updated_at' => nowUtc(),
        'id' => $subscriptionId,
    ]);
}

function markPushDelivered(int $subscriptionId): void
{
    $statement = db()->prepare(
        'UPDATE push_subscriptions
         SET failure_count = 0,
             last_error = NULL,
             last_push_at = :last_push_at,
             updated_at = :updated_at
         WHERE id = :id'
    );
    $statement->execute([
        'last_push_at' => nowUtc(),
        'updated_at' => nowUtc(),
        'id' => $subscriptionId,
    ]);
}

function triggerPushDelivery(array $subscription, string $urgency = 'normal'): void
{
    $jwt = createVapidJwt(pushAudienceFromEndpoint((string) $subscription['endpoint']));
    $publicKey = pushPublicKey();

    $curl = curl_init((string) $subscription['endpoint']);
    if ($curl === false) {
        recordPushFailure((int) $subscription['id'], 'Unable to initialize cURL.');
        return;
    }

    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_0,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            'TTL: ' . PUSH_NOTIFICATION_TTL,
            'Urgency: ' . $urgency,
            'Authorization: vapid t=' . $jwt . ', k=' . $publicKey,
            'Content-Length: 0',
        ],
    ]);

    $response = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($response === false || $statusCode >= 400) {
        $message = $error !== '' ? $error : ('Push endpoint returned status ' . $statusCode . '.');
        recordPushFailure((int) $subscription['id'], $message, in_array($statusCode, [404, 410], true));
        return;
    }

    markPushDelivered((int) $subscription['id']);
}

function activePushSubscriptionsForUser(int $userId): array
{
    $statement = db()->prepare(
        <<<'SQL'
        SELECT *
        FROM push_subscriptions
        WHERE user_id = :user_id
          AND revoked_at IS NULL
        ORDER BY id DESC
        SQL
    );
    $statement->execute(['user_id' => $userId]);
    return $statement->fetchAll();
}

function registerPushSubscription(int $userId, string $inviteToken, array $subscriptionPayload, string $deviceToken): array
{
    authorizeInviteSession($userId, $inviteToken);
    $user = requireUser($userId);
    $subscription = normalizePushSubscription($subscriptionPayload);
    $deviceToken = normalizePushDeviceToken($deviceToken);
    $userAgent = mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255, 'UTF-8');

    $pdo = db();
    $pdo->beginTransaction();

    try {
        $existing = $pdo->prepare(
            'SELECT id FROM push_subscriptions WHERE device_token = :device_token OR endpoint_hash = :endpoint_hash LIMIT 1 FOR UPDATE'
        );
        $existing->execute([
            'device_token' => $deviceToken,
            'endpoint_hash' => $subscription['endpoint_hash'],
        ]);
        $existingId = $existing->fetchColumn();

        if ($existingId !== false) {
            $update = $pdo->prepare(
                'UPDATE push_subscriptions
                 SET user_id = :user_id,
                     endpoint_hash = :endpoint_hash,
                     endpoint = :endpoint,
                     device_token = :device_token,
                     p256dh = :p256dh,
                     auth_token = :auth_token,
                     content_encoding = :content_encoding,
                     user_agent = :user_agent,
                     updated_at = :updated_at,
                     last_seen_at = :last_seen_at,
                     revoked_at = NULL,
                     failure_count = 0,
                     last_error = NULL
                 WHERE id = :id'
            );
            $update->execute([
                'user_id' => $user['id'],
                'endpoint_hash' => $subscription['endpoint_hash'],
                'endpoint' => $subscription['endpoint'],
                'device_token' => $deviceToken,
                'p256dh' => $subscription['p256dh'] !== '' ? $subscription['p256dh'] : null,
                'auth_token' => $subscription['auth_token'] !== '' ? $subscription['auth_token'] : null,
                'content_encoding' => $subscription['content_encoding'] !== '' ? $subscription['content_encoding'] : null,
                'user_agent' => $userAgent !== '' ? $userAgent : null,
                'updated_at' => nowUtc(),
                'last_seen_at' => nowUtc(),
                'id' => (int) $existingId,
            ]);
            $subscriptionId = (int) $existingId;
        } else {
            $insert = $pdo->prepare(
                'INSERT INTO push_subscriptions
                 (user_id, endpoint_hash, endpoint, device_token, p256dh, auth_token, content_encoding, user_agent, created_at, updated_at, last_seen_at)
                 VALUES
                 (:user_id, :endpoint_hash, :endpoint, :device_token, :p256dh, :auth_token, :content_encoding, :user_agent, :created_at, :updated_at, :last_seen_at)'
            );
            $insert->execute([
                'user_id' => $user['id'],
                'endpoint_hash' => $subscription['endpoint_hash'],
                'endpoint' => $subscription['endpoint'],
                'device_token' => $deviceToken,
                'p256dh' => $subscription['p256dh'] !== '' ? $subscription['p256dh'] : null,
                'auth_token' => $subscription['auth_token'] !== '' ? $subscription['auth_token'] : null,
                'content_encoding' => $subscription['content_encoding'] !== '' ? $subscription['content_encoding'] : null,
                'user_agent' => $userAgent !== '' ? $userAgent : null,
                'created_at' => nowUtc(),
                'updated_at' => nowUtc(),
                'last_seen_at' => nowUtc(),
            ]);
            $subscriptionId = (int) $pdo->lastInsertId();
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }

    return [
        'id' => $subscriptionId,
        'device_token' => $deviceToken,
        'public_key' => pushPublicKey(),
    ];
}

function unregisterPushSubscription(int $userId, string $inviteToken, string $deviceToken): void
{
    authorizeInviteSession($userId, $inviteToken);
    $statement = db()->prepare(
        'UPDATE push_subscriptions
         SET revoked_at = :revoked_at,
             updated_at = :updated_at
         WHERE user_id = :user_id AND device_token = :device_token'
    );
    $statement->execute([
        'revoked_at' => nowUtc(),
        'updated_at' => nowUtc(),
        'user_id' => $userId,
        'device_token' => normalizePushDeviceToken($deviceToken),
    ]);
}

function pullPushNotifications(string $deviceToken): array
{
    $normalizedToken = normalizePushDeviceToken($deviceToken);
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $subscriptionQuery = $pdo->prepare(
            'SELECT * FROM push_subscriptions WHERE device_token = :device_token AND revoked_at IS NULL LIMIT 1 FOR UPDATE'
        );
        $subscriptionQuery->execute(['device_token' => $normalizedToken]);
        $subscription = $subscriptionQuery->fetch();

        if ($subscription === false) {
            $pdo->commit();
            return [];
        }

        $notificationsQuery = $pdo->prepare(
            <<<'SQL'
            SELECT *
            FROM push_notifications
            WHERE subscription_id = :subscription_id
              AND consumed_at IS NULL
            ORDER BY id ASC
            LIMIT 10
            SQL
        );
        $notificationsQuery->execute(['subscription_id' => $subscription['id']]);
        $notifications = $notificationsQuery->fetchAll();

        if ($notifications !== []) {
            $ids = array_map(static fn(array $row): int => (int) $row['id'], $notifications);
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $update = $pdo->prepare("UPDATE push_notifications SET consumed_at = ? WHERE id IN ($placeholders)");
            $update->execute(array_merge([nowUtc()], $ids));
        }

        $touch = $pdo->prepare(
            'UPDATE push_subscriptions SET last_seen_at = :last_seen_at, updated_at = :updated_at WHERE id = :id'
        );
        $touch->execute([
            'last_seen_at' => nowUtc(),
            'updated_at' => nowUtc(),
            'id' => $subscription['id'],
        ]);

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }

    return array_map(static function (array $notification): array {
        return [
            'id' => (int) $notification['id'],
            'kind' => $notification['kind'],
            'title' => $notification['title'],
            'body' => $notification['body'],
            'url' => $notification['url'],
            'tag' => $notification['tag'],
            'created_at' => $notification['created_at'],
        ];
    }, $notifications);
}

function queuePushNotificationsForUser(
    int $recipientId,
    string $kind,
    string $title,
    string $body,
    string $url,
    string $tag,
    string $urgency = 'normal'
): void {
    $subscriptions = activePushSubscriptionsForUser($recipientId);
    if ($subscriptions === []) {
        return;
    }

    $pdo = db();
    $insert = $pdo->prepare(
        'INSERT INTO push_notifications (subscription_id, kind, title, body, url, tag, created_at)
         VALUES (:subscription_id, :kind, :title, :body, :url, :tag, :created_at)'
    );

    foreach ($subscriptions as $subscription) {
        $insert->execute([
            'subscription_id' => $subscription['id'],
            'kind' => $kind,
            'title' => mb_substr($title, 0, 255, 'UTF-8'),
            'body' => mb_substr($body, 0, 500, 'UTF-8'),
            'url' => mb_substr($url, 0, 255, 'UTF-8'),
            'tag' => mb_substr($tag, 0, 120, 'UTF-8'),
            'created_at' => nowUtc(),
        ]);

        triggerPushDelivery($subscription, $urgency);
    }
}

function conversationRecipientIds(int $conversationId, int $exceptUserId): array
{
    $statement = db()->prepare(
        'SELECT user_id FROM conversation_members WHERE conversation_id = :conversation_id AND user_id != :except_user_id'
    );
    $statement->execute([
        'conversation_id' => $conversationId,
        'except_user_id' => $exceptUserId,
    ]);

    return array_map(static fn(array $row): int => (int) $row['user_id'], $statement->fetchAll());
}

function queueMessagePushNotifications(int $conversationId, int $senderId, array $message): void
{
    $sender = requireUser($senderId);
    $recipientIds = conversationRecipientIds($conversationId, $senderId);
    $preview = mb_strlen($message['body'], 'UTF-8') > 120
        ? (mb_substr($message['body'], 0, 117, 'UTF-8') . '...')
        : $message['body'];

    foreach ($recipientIds as $recipientId) {
        $recipient = requireUser($recipientId);
        queuePushNotificationsForUser(
            $recipientId,
            'message',
            $sender['display_name'],
            $preview,
            buildUserPathLink((string) $recipient['username']),
            'message-conversation-' . $conversationId,
            'normal'
        );
    }
}

function queueCallPushNotification(int $conversationId, int $senderId, int $recipientId, string $mode): void
{
    $sender = requireUser($senderId);
    $recipient = requireUser($recipientId);
    $body = $mode === 'video'
        ? 'Входящий видеозвонок. Откройте Deutschgram, чтобы ответить.'
        : 'Входящий аудиозвонок. Откройте Deutschgram, чтобы ответить.';

    queuePushNotificationsForUser(
        $recipientId,
        'call',
        $sender['display_name'],
        $body,
        buildUserPathLink((string) $recipient['username']),
        'call-conversation-' . $conversationId,
        'high'
    );
}