<?php

declare(strict_types=1);

$usernamePath = isset($_GET['username_path']) ? (string) $_GET['username_path'] : '';
?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0f2231">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Deutschgram">
    <meta name="description" content="Лёгкий семейный веб-мессенджер для сообщений, голосовых и видеозвонков.">
    <title>Deutschgram Call • Volodymyr Parashchak</title>
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="icon" href="assets/icon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <div class="background-orbit orbit-a"></div>
    <div class="background-orbit orbit-b"></div>

    <div class="app-shell">
        <aside class="sidebar">
            <div class="brand-card">
                <p class="eyebrow">семейная линия связи</p>
                <h1>Deutschgram Call</h1>
                <p class="brand-copy">Вход пока только по приглашениям. После первого входа человек сможет заходить уже по своей личной ссылке.</p>
                <p class="brand-credit">Разработчик: Volodymyr Parashchak</p>
            </div>

            <form id="loginForm" class="panel auth-panel" autocomplete="off">
                <div class="panel-heading compact-heading">
                    <h2>Вход</h2>
                    <p>Сначала откройте invite-ссылку. Потом будет доступна и личная ссылка вида <code>/mama</code>.</p>
                </div>

                <div id="inviteBadge" class="invite-badge invite-badge-pending">Ожидание приглашения</div>
                <p id="inviteStatusText" class="helper-text">Откройте сайт по invite-ссылке, чтобы войти.</p>
                <p id="routeHint" class="helper-text hidden"></p>
                <p id="inviteNote" class="invite-note hidden"></p>

                <label class="field">
                    <span>Имя пользователя</span>
                    <input type="text" id="usernameInput" name="username" maxlength="80" placeholder="Например, mama" required>
                </label>

                <button type="submit" id="openMessengerButton" class="primary-button wide-button" disabled>Открыть мессенджер</button>
                <p id="authHint" class="helper-text">Сначала откройте рабочую invite-ссылку.</p>
            </form>

            <section class="panel notification-panel">
                <div class="panel-heading compact-heading">
                    <h2>Уведомления</h2>
                    <p>Разрешите уведомления, чтобы видеть новые сообщения и входящие звонки, даже когда вкладка не на экране.</p>
                </div>
                <button type="button" id="notificationButton" class="secondary-button wide-button">Включить уведомления</button>
                <p id="notificationText" class="helper-text">Разрешение браузера ещё не выдано.</p>
            </section>

            <section id="currentUserCard" class="panel profile-panel hidden"></section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Люди</h2>
                    <p>Кто уже появился в приложении</p>
                </div>
                <div id="usersList" class="stack-list empty-list">Список людей появится после входа.</div>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Диалоги</h2>
                    <p>Личные переписки один на один</p>
                </div>
                <div id="conversationsList" class="stack-list empty-list">Пока нет диалогов.</div>
            </section>
        </aside>

        <main class="chat-panel">
            <header id="chatHeader" class="panel chat-header">
                <div>
                    <p class="eyebrow">выберите диалог</p>
                    <h2>Сообщения</h2>
                </div>
                <div class="header-actions">
                    <button id="audioCallButton" class="secondary-button" type="button" disabled>Аудио</button>
                    <button id="videoCallButton" class="primary-button" type="button" disabled>Видео</button>
                </div>
            </header>

            <section id="messagesPanel" class="panel messages-panel empty-state">
                Выберите человека слева, чтобы начать переписку или звонок.
            </section>

            <form id="messageForm" class="panel composer" autocomplete="off">
                <textarea id="messageInput" rows="2" maxlength="4000" placeholder="Напишите сообщение..." disabled></textarea>
                <button type="submit" class="primary-button" disabled id="sendMessageButton">Отправить</button>
            </form>
        </main>

        <aside class="call-panel">
            <section class="panel call-status-panel">
                <div class="panel-heading compact-heading">
                    <h2>Звонок</h2>
                    <p id="callStateText">Звонок ещё не начат.</p>
                </div>

                <div class="media-stack">
                    <div class="video-card">
                        <span>Ваше видео</span>
                        <video id="localVideo" autoplay playsinline muted></video>
                    </div>

                    <div class="video-card featured">
                        <span>Видео собеседника</span>
                        <video id="remoteVideo" autoplay playsinline></video>
                    </div>
                </div>

                <div class="call-actions-grid">
                    <button id="muteButton" class="secondary-button" type="button" disabled>Микрофон</button>
                    <button id="cameraButton" class="secondary-button" type="button" disabled>Камера</button>
                    <button id="hangupButton" class="danger-button" type="button" disabled>Завершить</button>
                </div>

                <p class="helper-text">Для звонков используется WebRTC. В браузере нужно разрешить доступ к микрофону и камере.</p>
            </section>
        </aside>
    </div>

    <div id="incomingCallModal" class="modal hidden" aria-live="polite">
        <div class="modal-card">
            <p class="eyebrow">входящий звонок</p>
            <h2 id="incomingCallTitle">Кто-то звонит</h2>
            <p id="incomingCallText">Принять звонок?</p>
            <div class="modal-actions">
                <button id="declineCallButton" class="secondary-button" type="button">Отклонить</button>
                <button id="acceptCallButton" class="primary-button" type="button">Принять</button>
            </div>
        </div>
    </div>

    <template id="messageTemplate">
        <article class="message-bubble">
            <div class="message-meta"></div>
            <div class="message-body"></div>
        </article>
    </template>

    <script>
        window.DEUTSCHGRAM_CONFIG = <?php echo json_encode([
            'usernamePath' => $usernamePath,
            'serviceWorker' => 'service-worker.js',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
    </script>
    <script src="assets/app.js" defer></script>
</body>
</html>