<?php

declare(strict_types=1);
?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f2231">
    <title>Deutschgram Call</title>
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <div class="background-orbit orbit-a"></div>
    <div class="background-orbit orbit-b"></div>

    <div class="app-shell">
        <aside class="sidebar">
            <div class="brand-card">
                <p class="eyebrow">private family line</p>
                <h1>Deutschgram Call</h1>
                <p class="brand-copy">Пока вход только по приглашениям.</p>
            </div>

            <section class="panel admin-panel">
                <div class="panel-heading compact-heading">
                    <h2>Админка</h2>
                    <p>Создавайте приглашения и копируйте готовые ссылки прямо отсюда.</p>
                </div>

                <form id="adminLoginForm" class="admin-login" autocomplete="off">
                    <label class="field">
                        <span>Ключ администратора</span>
                        <input type="password" id="adminKeyInput" maxlength="120" placeholder="Введите admin key">
                    </label>
                    <div class="inline-actions">
                        <button type="submit" class="secondary-button">Открыть админку</button>
                        <button type="button" id="adminLogoutButton" class="secondary-button hidden">Выйти</button>
                    </div>
                </form>

                <p id="adminStatusText" class="helper-text">Введите ключ администратора, чтобы управлять приглашениями.</p>

                <div id="adminWorkspace" class="hidden admin-workspace">
                    <form id="createInviteForm" class="admin-create-form" autocomplete="off">
                        <label class="field">
                            <span>Имя для приглашения</span>
                            <input type="text" id="inviteNoteInput" maxlength="255" placeholder="Например, Mama">
                        </label>
                        <button type="submit" id="createInviteButton" class="primary-button wide-button">Создать ссылку</button>
                    </form>

                    <div class="panel-heading compact-heading admin-list-heading">
                        <h2>Приглашения</h2>
                        <p>Можно копировать ссылки и отзывать старые приглашения.</p>
                    </div>
                    <div id="adminInvitesList" class="stack-list empty-list">Приглашения появятся здесь после входа в админку.</div>
                </div>
            </section>

            <form id="loginForm" class="panel auth-panel" autocomplete="off">
                <div class="panel-heading compact-heading">
                    <h2>Вход</h2>
                    <p>Пока только по приглашениям.</p>
                </div>

                <div id="inviteBadge" class="invite-badge invite-badge-pending">Ожидается приглашение</div>
                <p id="inviteStatusText" class="helper-text">Откройте сайт по invite-ссылке, чтобы войти.</p>
                <p id="inviteNote" class="invite-note hidden"></p>

                <label class="field">
                    <span>Имя пользователя</span>
                    <input type="text" id="usernameInput" name="username" maxlength="80" placeholder="Например, mama" required>
                </label>

                <button type="submit" id="openMessengerButton" class="primary-button wide-button" disabled>Открыть мессенджер</button>
                <p id="authHint" class="helper-text">Сначала откройте рабочую invite-ссылку.</p>
            </form>

            <section id="currentUserCard" class="panel profile-panel hidden"></section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Люди</h2>
                    <p>Кто уже в приложении</p>
                </div>
                <div id="usersList" class="stack-list empty-list">Список появится после входа.</div>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Диалоги</h2>
                    <p>Личные переписки</p>
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
                Выберите человека слева, чтобы начать чат или звонок.
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
                        <span>Собственное видео</span>
                        <video id="localVideo" autoplay playsinline muted></video>
                    </div>

                    <div class="video-card featured">
                        <span>Собеседник</span>
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

    <template id="inviteRowTemplate">
        <article class="invite-item">
            <div class="invite-item-head">
                <div>
                    <div class="invite-item-title"></div>
                    <div class="invite-item-meta"></div>
                </div>
                <span class="status-pill invite-item-status"></span>
            </div>
            <div class="invite-item-link"></div>
            <div class="invite-item-actions">
                <button type="button" class="secondary-button copy-invite-button">Скопировать</button>
                <button type="button" class="danger-button revoke-invite-button">Отозвать</button>
            </div>
        </article>
    </template>

    <script src="assets/app.js" defer></script>
</body>
</html>