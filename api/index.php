<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/chat.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = requestData();

    switch ($action) {
        case 'invite_status':
            requireMethod('GET');
            jsonResponse([
                'ok' => true,
                'invite' => getInviteStatus((string) ($data['invite_token'] ?? '')),
            ]);
            break;

        case 'login':
        case 'register':
            requireMethod('POST');

            $user = loginWithInvite(
                (string) ($data['invite_token'] ?? ''),
                (string) ($data['username'] ?? $data['display_name'] ?? '')
            );

            jsonResponse([
                'ok' => true,
                'user' => serializeUser($user, (int) $user['id']),
                'invite' => getInviteStatus((string) ($data['invite_token'] ?? '')),
            ]);
            break;

        case 'sync':
            requireMethod('GET');

            $userId = (int) ($data['user_id'] ?? 0);
            authorizeInviteSession($userId, (string) ($data['invite_token'] ?? ''));
            touchPresence($userId);
            $currentUser = requireUser($userId);

            $conversationId = (int) ($data['conversation_id'] ?? 0);
            $afterMessageId = (int) ($data['after_message_id'] ?? 0);

            $activeConversation = null;
            $messages = [];

            if ($conversationId > 0) {
                $activeConversation = getConversationSummary($conversationId, $userId);
                $messages = getConversationMessages($conversationId, $userId, $afterMessageId);
                markConversationRead($conversationId, $userId);
            }

            jsonResponse([
                'ok' => true,
                'server_time' => nowUtc(),
                'current_user' => serializeUser($currentUser, $userId),
                'users' => listUsers($userId),
                'conversations' => listConversations($userId),
                'active_conversation' => $activeConversation,
                'messages' => $messages,
                'signals' => consumeSignals($userId),
            ]);
            break;

        case 'open_direct':
            requireMethod('POST');

            $userId = (int) ($data['user_id'] ?? 0);
            $peerUserId = (int) ($data['peer_user_id'] ?? 0);
            authorizeInviteSession($userId, (string) ($data['invite_token'] ?? ''));
            touchPresence($userId);

            jsonResponse([
                'ok' => true,
                'conversation' => findOrCreateDirectConversation($userId, $peerUserId),
            ]);
            break;

        case 'send_message':
            requireMethod('POST');

            $userId = (int) ($data['user_id'] ?? 0);
            $conversationId = (int) ($data['conversation_id'] ?? 0);
            authorizeInviteSession($userId, (string) ($data['invite_token'] ?? ''));
            touchPresence($userId);

            $message = sendMessage($conversationId, $userId, (string) ($data['body'] ?? ''));
            markConversationRead($conversationId, $userId);

            jsonResponse([
                'ok' => true,
                'message' => $message,
                'conversation' => getConversationSummary($conversationId, $userId),
            ]);
            break;

        case 'send_signal':
            requireMethod('POST');

            $userId = (int) ($data['user_id'] ?? 0);
            $conversationId = (int) ($data['conversation_id'] ?? 0);
            $recipientId = (int) ($data['recipient_id'] ?? 0);
            $type = (string) ($data['type'] ?? '');
            $payload = is_array($data['payload'] ?? null) ? $data['payload'] : [];
            authorizeInviteSession($userId, (string) ($data['invite_token'] ?? ''));
            touchPresence($userId);
            sendSignal($conversationId, $userId, $recipientId, $type, $payload);

            jsonResponse(['ok' => true]);
            break;

        case 'admin_invites':
            requireMethod('GET');
            authorizeAdminKey((string) ($data['admin_key'] ?? ''));
            jsonResponse([
                'ok' => true,
                'invites' => listInvites(),
            ]);
            break;

        case 'admin_create_invite':
            requireMethod('POST');
            authorizeAdminKey((string) ($data['admin_key'] ?? ''));
            jsonResponse([
                'ok' => true,
                'invite' => createInvite((string) ($data['note'] ?? '')),
                'invites' => listInvites(),
            ]);
            break;

        case 'admin_revoke_invite':
            requireMethod('POST');
            authorizeAdminKey((string) ($data['admin_key'] ?? ''));
            revokeInvite((string) ($data['invite_token'] ?? ''));
            jsonResponse([
                'ok' => true,
                'invites' => listInvites(),
            ]);
            break;

        default:
            fail('Unknown API action.', 404);
    }
} catch (HttpException $exception) {
    jsonResponse([
        'ok' => false,
        'error' => $exception->getMessage(),
    ], $exception->statusCode());
} catch (Throwable $exception) {
    jsonResponse([
        'ok' => false,
        'error' => $exception->getMessage(),
    ], 500);
}