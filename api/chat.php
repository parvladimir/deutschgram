<?php

declare(strict_types=1);

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
        SELECT conversations.id
        FROM conversations
        INNER JOIN conversation_members AS me
            ON me.conversation_id = conversations.id AND me.user_id = :user_id
        INNER JOIN conversation_members AS peer
            ON peer.conversation_id = conversations.id AND peer.user_id = :peer_user_id
        WHERE conversations.kind = 'direct'
          AND (
            SELECT COUNT(*)
            FROM conversation_members
            WHERE conversation_id = conversations.id
          ) = 2
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
        $insertConversation = $pdo->prepare(
            'INSERT INTO conversations (kind, created_at) VALUES (:kind, :created_at)'
        );
        $insertConversation->execute([
            'kind' => 'direct',
            'created_at' => nowUtc(),
        ]);

        $conversationId = (int) $pdo->lastInsertId();
        $insertMember = $pdo->prepare(
            'INSERT INTO conversation_members (conversation_id, user_id, joined_at)
             VALUES (:conversation_id, :user_id, :joined_at)'
        );

        foreach ([$userId, $peerUserId] as $memberId) {
            $insertMember->execute([
                'conversation_id' => $conversationId,
                'user_id' => $memberId,
                'joined_at' => nowUtc(),
            ]);
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

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
            conversations.id,
            conversations.kind,
            conversations.created_at,
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
                FROM messages AS unread
                WHERE unread.conversation_id = conversations.id
                  AND unread.id > me.last_read_message_id
                  AND unread.sender_id != :current_user_id_unread
            ) AS unread_count
        FROM conversations
        INNER JOIN conversation_members AS me
            ON me.conversation_id = conversations.id AND me.user_id = :current_user_id_me
        INNER JOIN conversation_members AS peer_member
            ON peer_member.conversation_id = conversations.id AND peer_member.user_id != :current_user_id_peer
        INNER JOIN users AS peer
            ON peer.id = peer_member.user_id
        LEFT JOIN messages AS last_message
            ON last_message.id = (
                SELECT id
                FROM messages
                WHERE conversation_id = conversations.id
                ORDER BY id DESC
                LIMIT 1
            )
        WHERE conversations.id = :conversation_id
        LIMIT 1
        SQL
    );
    $statement->execute([
        'conversation_id' => $conversationId,
        'current_user_id_unread' => $currentUserId,
        'current_user_id_me' => $currentUserId,
        'current_user_id_peer' => $currentUserId,
    ]);

    $conversation = $statement->fetch();
    if ($conversation === false) {
        fail('Conversation not found.', 404);
    }

    return serializeConversationRow($conversation, $currentUserId);
}

function listConversations(int $currentUserId): array
{
    $statement = db()->prepare(
        <<<'SQL'
        SELECT
            conversations.id,
            conversations.kind,
            conversations.created_at,
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
                FROM messages AS unread
                WHERE unread.conversation_id = conversations.id
                  AND unread.id > me.last_read_message_id
                  AND unread.sender_id != :current_user_id_unread
            ) AS unread_count
        FROM conversations
        INNER JOIN conversation_members AS me
            ON me.conversation_id = conversations.id AND me.user_id = :current_user_id_me
        INNER JOIN conversation_members AS peer_member
            ON peer_member.conversation_id = conversations.id AND peer_member.user_id != :current_user_id_peer
        INNER JOIN users AS peer
            ON peer.id = peer_member.user_id
        LEFT JOIN messages AS last_message
            ON last_message.id = (
                SELECT id
                FROM messages
                WHERE conversation_id = conversations.id
                ORDER BY id DESC
                LIMIT 1
            )
        ORDER BY COALESCE(last_message.id, conversations.id) DESC, conversations.id DESC
        SQL
    );
    $statement->execute([
        'current_user_id_unread' => $currentUserId,
        'current_user_id_me' => $currentUserId,
        'current_user_id_peer' => $currentUserId,
    ]);

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

    if ($afterMessageId > 0) {
        $statement = db()->prepare(
            <<<'SQL'
            SELECT
                messages.id,
                messages.conversation_id,
                messages.sender_id,
                messages.body,
                messages.kind,
                messages.created_at,
                sender.username AS sender_username,
                sender.display_name AS sender_display_name
            FROM messages
            INNER JOIN users AS sender ON sender.id = messages.sender_id
            WHERE messages.conversation_id = :conversation_id
              AND messages.id > :after_message_id
            ORDER BY messages.id ASC
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

    $statement = db()->prepare(
        <<<'SQL'
        SELECT *
        FROM (
            SELECT
                messages.id,
                messages.conversation_id,
                messages.sender_id,
                messages.body,
                messages.kind,
                messages.created_at,
                sender.username AS sender_username,
                sender.display_name AS sender_display_name
            FROM messages
            INNER JOIN users AS sender ON sender.id = messages.sender_id
            WHERE messages.conversation_id = :conversation_id
            ORDER BY messages.id DESC
            LIMIT 50
        ) AS recent_messages
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
            messages.id,
            messages.conversation_id,
            messages.sender_id,
            messages.body,
            messages.kind,
            messages.created_at,
            sender.username AS sender_username,
            sender.display_name AS sender_display_name
        FROM messages
        INNER JOIN users AS sender ON sender.id = messages.sender_id
        WHERE messages.id = :message_id
        LIMIT 1
        SQL
    );
    $statement->execute(['message_id' => $messageId]);
    $message = $statement->fetch();

    if ($message === false) {
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

    $latest = db()->prepare('SELECT COALESCE(MAX(id), 0) FROM messages WHERE conversation_id = :conversation_id');
    $latest->execute(['conversation_id' => $conversationId]);
    $lastMessageId = (int) $latest->fetchColumn();

    $statement = db()->prepare(
        'UPDATE conversation_members
         SET last_read_message_id = GREATEST(last_read_message_id, :last_read_message_id)
         WHERE conversation_id = :conversation_id AND user_id = :user_id'
    );
    $statement->execute([
        'last_read_message_id' => $lastMessageId,
        'conversation_id' => $conversationId,
        'user_id' => $userId,
    ]);
}

function sendSignal(int $conversationId, int $senderId, int $recipientId, string $type, array $payload = []): void
{
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

function cleanupOldSignals(): void
{
    db()->exec(
        "DELETE FROM signals WHERE consumed_at IS NOT NULL AND created_at < (UTC_TIMESTAMP() - INTERVAL 2 DAY)"
    );
}

function consumeSignals(int $userId): array
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $statement = $pdo->prepare(
            <<<'SQL'
            SELECT
                signals.id,
                signals.conversation_id,
                signals.sender_id,
                signals.recipient_id,
                signals.type,
                signals.payload,
                signals.created_at,
                sender.username AS sender_username,
                sender.display_name AS sender_display_name
            FROM signals
            INNER JOIN users AS sender ON sender.id = signals.sender_id
            WHERE signals.recipient_id = :user_id
              AND signals.consumed_at IS NULL
            ORDER BY signals.id ASC
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
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }

    cleanupOldSignals();

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