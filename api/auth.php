<?php

declare(strict_types=1);

const ONLINE_WINDOW_SECONDS = 90;

function normalizeInviteToken(string $inviteToken): string
{
    $normalized = strtolower(preg_replace('/[^a-f0-9]+/i', '', trim($inviteToken)) ?? '');
    if ($normalized === '') {
        fail('Invite token is missing or invalid.', 403);
    }

    return $normalized;
}

function normalizeUsername(string $username): string
{
    $username = trim($username);
    $username = preg_replace('/[^\p{L}\p{N}._-]+/u', '-', $username) ?? '';
    $username = trim($username, '-._');
    $username = mb_strtolower($username, 'UTF-8');
    $username = mb_substr($username, 0, 80, 'UTF-8');

    if ($username === '') {
        fail('Use letters or numbers in the user name.');
    }

    return $username;
}

function sanitizeDisplayName(string $displayName): string
{
    $displayName = trim($displayName);
    if ($displayName === '') {
        fail('User name is required.');
    }

    return mb_substr($displayName, 0, 80, 'UTF-8');
}

function buildInviteLink(string $token, ?string $baseUrl = null): string
{
    $base = rtrim($baseUrl ?: appBaseUrl(), '/');
    return $base . '/?invite=' . rawurlencode($token);
}

function buildUserPathLink(string $username, ?string $baseUrl = null): string
{
    $base = rtrim($baseUrl ?: appBaseUrl(), '/');
    return $base . '/' . rawurlencode(normalizeUsername($username));
}

function inviteIsExpired(array $invite): bool
{
    return $invite['expires_at'] !== null && strtotime((string) $invite['expires_at']) <= time();
}

function fetchInviteByToken(string $inviteToken, bool $forUpdate = false): ?array
{
    $sql = 'SELECT * FROM invites WHERE token = :token LIMIT 1';
    if ($forUpdate) {
        $sql .= ' FOR UPDATE';
    }

    $statement = db()->prepare($sql);
    $statement->execute(['token' => normalizeInviteToken($inviteToken)]);
    $invite = $statement->fetch();

    return $invite ?: null;
}

function fetchInviteByAssignedUsername(string $username, bool $forUpdate = false): ?array
{
    $sql = <<<'SQL'
    SELECT
        invites.*, 
        users.display_name AS assigned_user_display_name
    FROM invites
    LEFT JOIN users ON users.id = invites.assigned_user_id
    WHERE invites.assigned_username = :assigned_username
    LIMIT 1
    SQL;

    if ($forUpdate) {
        $sql .= ' FOR UPDATE';
    }

    $statement = db()->prepare($sql);
    $statement->execute([
        'assigned_username' => normalizeUsername($username),
    ]);
    $invite = $statement->fetch();

    return $invite ?: null;
}

function requireActiveInvite(string $inviteToken, bool $forUpdate = false): array
{
    $invite = fetchInviteByToken($inviteToken, $forUpdate);
    if ($invite === null) {
        fail('Invite link was not found.', 404);
    }

    if ($invite['revoked_at'] !== null) {
        fail('This invite has been revoked.', 403);
    }

    if (inviteIsExpired($invite)) {
        fail('This invite has expired.', 403);
    }

    return $invite;
}

function serializeInvite(array $invite, ?string $baseUrl = null): array
{
    $pathLink = null;
    if (!empty($invite['assigned_username'])) {
        $pathLink = buildUserPathLink((string) $invite['assigned_username'], $baseUrl);
    }

    return [
        'id' => (int) $invite['id'],
        'token' => $invite['token'],
        'note' => $invite['note'],
        'assigned_user_id' => $invite['assigned_user_id'] !== null ? (int) $invite['assigned_user_id'] : null,
        'assigned_username' => $invite['assigned_username'],
        'assigned_user_display_name' => $invite['assigned_user_display_name'] ?? null,
        'usage_count' => (int) $invite['usage_count'],
        'created_at' => $invite['created_at'],
        'last_used_at' => $invite['last_used_at'],
        'expires_at' => $invite['expires_at'],
        'revoked_at' => $invite['revoked_at'],
        'is_claimed' => $invite['assigned_user_id'] !== null,
        'link' => buildInviteLink($invite['token'], $baseUrl),
        'path_link' => $pathLink,
    ];
}

function getInviteStatus(string $inviteToken): array
{
    return serializeInvite(requireActiveInvite($inviteToken));
}

function createInvite(?string $note = null, ?string $baseUrl = null, ?string $expiresAt = null): array
{
    $statement = db()->prepare(
        'INSERT INTO invites (token, note, created_at, expires_at)
         VALUES (:token, :note, :created_at, :expires_at)'
    );

    $token = bin2hex(random_bytes(24));
    $statement->execute([
        'token' => $token,
        'note' => $note !== null && trim($note) !== '' ? mb_substr(trim($note), 0, 255, 'UTF-8') : null,
        'created_at' => nowUtc(),
        'expires_at' => $expiresAt,
    ]);

    return serializeInvite(requireActiveInvite($token), $baseUrl);
}

function listInvites(?string $baseUrl = null): array
{
    $statement = db()->query(
        <<<'SQL'
        SELECT
            invites.*,
            users.display_name AS assigned_user_display_name
        FROM invites
        LEFT JOIN users ON users.id = invites.assigned_user_id
        ORDER BY invites.id DESC
        SQL
    );

    return array_map(
        static fn(array $invite): array => serializeInvite($invite, $baseUrl),
        $statement->fetchAll()
    );
}

function revokeInvite(string $inviteToken): void
{
    $invite = requireActiveInvite($inviteToken);

    $statement = db()->prepare('UPDATE invites SET revoked_at = :revoked_at WHERE id = :id');
    $statement->execute([
        'revoked_at' => nowUtc(),
        'id' => $invite['id'],
    ]);
}

function findInviteAssignedToUser(int $userId, ?string $excludeToken = null): ?array
{
    $sql = 'SELECT * FROM invites WHERE assigned_user_id = :user_id';
    $params = ['user_id' => $userId];

    if ($excludeToken !== null) {
        $sql .= ' AND token != :token';
        $params['token'] = normalizeInviteToken($excludeToken);
    }

    $sql .= ' LIMIT 1';

    $statement = db()->prepare($sql);
    $statement->execute($params);
    $invite = $statement->fetch();

    return $invite ?: null;
}

function getUserById(int $userId): ?array
{
    $statement = db()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $userId]);
    $user = $statement->fetch();

    return $user ?: null;
}

function getUserByUsername(string $username, bool $forUpdate = false): ?array
{
    $sql = 'SELECT * FROM users WHERE username = :username LIMIT 1';
    if ($forUpdate) {
        $sql .= ' FOR UPDATE';
    }

    $statement = db()->prepare($sql);
    $statement->execute(['username' => normalizeUsername($username)]);
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

function loginWithInvite(string $inviteToken, string $name): array
{
    $pdo = db();
    $displayName = sanitizeDisplayName($name);
    $username = normalizeUsername($name);

    $pdo->beginTransaction();

    try {
        $invite = requireActiveInvite($inviteToken, true);

        if ($invite['assigned_username'] !== null && $invite['assigned_username'] !== $username) {
            fail('This invite is already linked to another user name.', 403);
        }

        $user = getUserByUsername($username, true);

        if ($user !== null) {
            $otherInvite = findInviteAssignedToUser((int) $user['id'], $invite['token']);
            if ($otherInvite !== null) {
                fail('This user name already belongs to another invite.', 403);
            }

            if ($invite['assigned_user_id'] !== null && (int) $invite['assigned_user_id'] !== (int) $user['id']) {
                fail('This invite is already linked to another account.', 403);
            }

            $updateUser = $pdo->prepare(
                'UPDATE users
                 SET display_name = :display_name, last_seen_at = :last_seen_at
                 WHERE id = :id'
            );
            $updateUser->execute([
                'display_name' => $displayName,
                'last_seen_at' => nowUtc(),
                'id' => $user['id'],
            ]);

            $userId = (int) $user['id'];
        } else {
            if ($invite['assigned_user_id'] !== null) {
                fail('This invite is already linked to another account.', 403);
            }

            $insertUser = $pdo->prepare(
                'INSERT INTO users (username, display_name, created_at, last_seen_at)
                 VALUES (:username, :display_name, :created_at, :last_seen_at)'
            );
            $insertUser->execute([
                'username' => $username,
                'display_name' => $displayName,
                'created_at' => nowUtc(),
                'last_seen_at' => nowUtc(),
            ]);

            $userId = (int) $pdo->lastInsertId();
        }

        $updateInvite = $pdo->prepare(
            'UPDATE invites
             SET assigned_user_id = :assigned_user_id,
                 assigned_username = :assigned_username,
                 usage_count = usage_count + 1,
                 last_used_at = :last_used_at
             WHERE id = :id'
        );
        $updateInvite->execute([
            'assigned_user_id' => $userId,
            'assigned_username' => $username,
            'last_used_at' => nowUtc(),
            'id' => $invite['id'],
        ]);

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }

    return requireUser($userId);
}

function loginWithUsernamePath(string $username): array
{
    $normalizedUsername = normalizeUsername($username);
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $user = getUserByUsername($normalizedUsername, true);
        if ($user === null) {
            fail('User not found. Open the invite link first.', 404);
        }

        $invite = fetchInviteByAssignedUsername($normalizedUsername, true);
        if ($invite === null || $invite['assigned_user_id'] === null) {
            fail('This personal link is not ready yet. Open the invite link first.', 403);
        }

        if ((int) $invite['assigned_user_id'] !== (int) $user['id']) {
            fail('This personal link is linked to another account.', 403);
        }

        if ($invite['revoked_at'] !== null) {
            fail('This personal link has been revoked.', 403);
        }

        if (inviteIsExpired($invite)) {
            fail('This personal link has expired.', 403);
        }

        $statement = $pdo->prepare(
            'UPDATE users
             SET last_seen_at = :last_seen_at
             WHERE id = :id'
        );
        $statement->execute([
            'last_seen_at' => nowUtc(),
            'id' => $user['id'],
        ]);

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }

    $freshUser = requireUser((int) $user['id']);
    $freshInvite = fetchInviteByAssignedUsername($normalizedUsername);
    if ($freshInvite === null) {
        fail('Invite for this personal link was not found.', 404);
    }

    return [
        'user' => $freshUser,
        'invite' => $freshInvite,
    ];
}

function authorizeInviteSession(int $userId, string $inviteToken): array
{
    $user = requireUser($userId);
    $invite = requireActiveInvite($inviteToken);

    if ($invite['assigned_user_id'] === null || (int) $invite['assigned_user_id'] !== $userId) {
        fail('This invite does not match the current account.', 403);
    }

    if ($invite['assigned_username'] !== $user['username']) {
        fail('This invite does not match the current account.', 403);
    }

    return [
        'user' => $user,
        'invite' => $invite,
    ];
}

function touchPresence(int $userId): void
{
    $statement = db()->prepare('UPDATE users SET last_seen_at = :last_seen_at WHERE id = :id');
    $statement->execute([
        'last_seen_at' => nowUtc(),
        'id' => $userId,
    ]);
}

function isUserOnline(string $lastSeenAt): bool
{
    $date = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $lastSeenAt, new DateTimeZone('UTC'));
    if (!$date instanceof DateTimeImmutable) {
        return false;
    }

    return (time() - $date->getTimestamp()) <= ONLINE_WINDOW_SECONDS;
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
        'path_link' => buildUserPathLink((string) $user['username']),
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

function adminKey(): string
{
    return configValue('DEUTSCHGRAM_ADMIN_KEY', 'DEUTSCHGRAM_ADMIN_KEY', 'deutschgram-admin') ?? 'deutschgram-admin';
}

function authorizeAdminKey(?string $providedKey): void
{
    $expected = trim(adminKey());
    $actual = trim((string) $providedKey);

    if ($expected === '') {
        fail('Admin key is not configured.', 500);
    }

    if ($actual === '' || !hash_equals($expected, $actual)) {
        fail('Wrong admin key.', 403);
    }
}