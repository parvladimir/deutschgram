<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

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
        case 'register':
            requireMethod('POST');

            $displayName = (string) ($data['display_name'] ?? '');
            $username = (string) ($data['username'] ?? $displayName);
            $user = registerUser($username, $displayName);

            jsonResponse([
                'ok' => true,
                'user' => serializeUser($user, (int) $user['id']),
            ]);
            break;

        case 'sync':
            requireMethod('GET');

            $userId = (int) ($data['user_id'] ?? 0);
            requireUser($userId);
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
            requireUser($userId);
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
            requireUser($userId);
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
            requireUser($userId);
            touchPresence($userId);
            sendSignal($conversationId, $userId, $recipientId, $type, $payload);

            jsonResponse(['ok' => true]);
            break;

        default:
            fail('Unknown API action.', 404);
    }
} catch (Throwable $exception) {
    jsonResponse([
        'ok' => false,
        'error' => $exception->getMessage(),
    ], 500);
}
