<?php

declare(strict_types=1);
?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f2231">
    <title>Deutschgram Admin</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body class="admin-page">
    <div class="background-orbit orbit-a"></div>
    <div class="background-orbit orbit-b"></div>

    <div class="admin-shell">
        <aside class="sidebar">
            <div class="brand-card">
                <p class="eyebrow">invite control</p>
                <h1>Deutschgram Admin</h1>
                <p class="brand-copy">Manage invites and personal links in one place.</p>
            </div>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Admin login</h2>
                    <p>Enter the admin key to create, copy, and revoke invite links.</p>
                </div>

                <form id="adminLoginForm" autocomplete="off">
                    <label class="field">
                        <span>Admin key</span>
                        <input type="password" id="adminKeyInput" maxlength="120" placeholder="Enter admin key">
                    </label>

                    <div class="inline-actions">
                        <button type="submit" class="primary-button">Open admin</button>
                        <button type="button" id="adminLogoutButton" class="secondary-button hidden">Log out</button>
                    </div>
                </form>

                <p id="adminStatusText" class="helper-text">Enter the administrator key to work with invites.</p>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Flow</h2>
                    <p>Invite link is used once for the first login. After that, the person can keep using a personal link like <code>/mama</code>.</p>
                </div>
                <a class="secondary-button back-link" href="../">Open app</a>
            </section>
        </aside>

        <main class="chat-panel">
            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Create invite</h2>
                    <p>The note is only for you, so you can recognize the invite later.</p>
                </div>

                <form id="createInviteForm" class="admin-create-form" autocomplete="off">
                    <label class="field">
                        <span>Note</span>
                        <input type="text" id="inviteNoteInput" maxlength="255" placeholder="For example, Mama">
                    </label>
                    <button type="submit" id="createInviteButton" class="primary-button wide-button">Create invite</button>
                </form>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Invites</h2>
                    <p>After the first login, a permanent personal link appears next to the invite link.</p>
                </div>
                <div id="adminInvitesList" class="stack-list empty-list">Invites will appear here after admin login.</div>
            </section>
        </main>
    </div>

    <template id="inviteRowTemplate">
        <article class="invite-item">
            <div class="invite-item-head">
                <div>
                    <div class="invite-item-title"></div>
                    <div class="invite-item-meta"></div>
                </div>
                <span class="status-pill invite-item-status"></span>
            </div>
            <div class="link-stack">
                <div class="invite-link-block">
                    <span class="eyebrow">invite</span>
                    <div class="invite-item-link invite-link-primary"></div>
                </div>
                <div class="invite-link-block">
                    <span class="eyebrow">personal</span>
                    <div class="invite-item-link invite-link-personal"></div>
                </div>
            </div>
            <div class="invite-item-actions">
                <button type="button" class="secondary-button copy-invite-button">Copy invite</button>
                <button type="button" class="secondary-button copy-personal-button">Copy personal</button>
                <button type="button" class="danger-button revoke-invite-button">Revoke</button>
            </div>
        </article>
    </template>

    <script>
        window.DEUTSCHGRAM_ADMIN_CONFIG = {
            apiBase: '../api/index.php'
        };
    </script>
    <script src="../assets/admin.js" defer></script>
</body>
</html>