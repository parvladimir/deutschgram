<?php

declare(strict_types=1);

$usernamePath = isset($_GET['username_path']) ? (string) $_GET['username_path'] : '';
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
                <p class="brand-copy">Access is currently invite-only.</p>
            </div>

            <form id="loginForm" class="panel auth-panel" autocomplete="off">
                <div class="panel-heading compact-heading">
                    <h2>Sign in</h2>
                    <p>First sign-in happens via invite. After that, a personal link like <code>/mama</code> also works.</p>
                </div>

                <div id="inviteBadge" class="invite-badge invite-badge-pending">Waiting for invite</div>
                <p id="inviteStatusText" class="helper-text">Open the site from an invite link to sign in.</p>
                <p id="routeHint" class="helper-text hidden"></p>
                <p id="inviteNote" class="invite-note hidden"></p>

                <label class="field">
                    <span>Username</span>
                    <input type="text" id="usernameInput" name="username" maxlength="80" placeholder="For example, mama" required>
                </label>

                <button type="submit" id="openMessengerButton" class="primary-button wide-button" disabled>Open messenger</button>
                <p id="authHint" class="helper-text">Open a working invite link first.</p>
            </form>

            <section class="panel notification-panel">
                <div class="panel-heading compact-heading">
                    <h2>Notifications</h2>
                    <p>Turn them on to see new messages and incoming calls when the tab is in the background.</p>
                </div>
                <button type="button" id="notificationButton" class="secondary-button wide-button">Enable notifications</button>
                <p id="notificationText" class="helper-text">Browser permission is not enabled yet.</p>
            </section>

            <section id="currentUserCard" class="panel profile-panel hidden"></section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>People</h2>
                    <p>Who is already inside the app</p>
                </div>
                <div id="usersList" class="stack-list empty-list">The people list will appear after sign-in.</div>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Dialogs</h2>
                    <p>Private one-to-one chats</p>
                </div>
                <div id="conversationsList" class="stack-list empty-list">There are no dialogs yet.</div>
            </section>
        </aside>

        <main class="chat-panel">
            <header id="chatHeader" class="panel chat-header">
                <div>
                    <p class="eyebrow">choose a dialog</p>
                    <h2>Messages</h2>
                </div>
                <div class="header-actions">
                    <button id="audioCallButton" class="secondary-button" type="button" disabled>Audio</button>
                    <button id="videoCallButton" class="primary-button" type="button" disabled>Video</button>
                </div>
            </header>

            <section id="messagesPanel" class="panel messages-panel empty-state">
                Choose a person on the left to start chatting or calling.
            </section>

            <form id="messageForm" class="panel composer" autocomplete="off">
                <textarea id="messageInput" rows="2" maxlength="4000" placeholder="Write a message..." disabled></textarea>
                <button type="submit" class="primary-button" disabled id="sendMessageButton">Send</button>
            </form>
        </main>

        <aside class="call-panel">
            <section class="panel call-status-panel">
                <div class="panel-heading compact-heading">
                    <h2>Call</h2>
                    <p id="callStateText">Call has not started yet.</p>
                </div>

                <div class="media-stack">
                    <div class="video-card">
                        <span>Your video</span>
                        <video id="localVideo" autoplay playsinline muted></video>
                    </div>

                    <div class="video-card featured">
                        <span>Remote video</span>
                        <video id="remoteVideo" autoplay playsinline></video>
                    </div>
                </div>

                <div class="call-actions-grid">
                    <button id="muteButton" class="secondary-button" type="button" disabled>Microphone</button>
                    <button id="cameraButton" class="secondary-button" type="button" disabled>Camera</button>
                    <button id="hangupButton" class="danger-button" type="button" disabled>End call</button>
                </div>

                <p class="helper-text">Calls use WebRTC. The browser must be allowed to use the microphone and camera.</p>
            </section>
        </aside>
    </div>

    <div id="incomingCallModal" class="modal hidden" aria-live="polite">
        <div class="modal-card">
            <p class="eyebrow">incoming call</p>
            <h2 id="incomingCallTitle">Someone is calling</h2>
            <p id="incomingCallText">Accept the call?</p>
            <div class="modal-actions">
                <button id="declineCallButton" class="secondary-button" type="button">Decline</button>
                <button id="acceptCallButton" class="primary-button" type="button">Accept</button>
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