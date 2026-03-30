<?php

declare(strict_types=1);
?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0f2231">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Deutschgram Admin">
    <title>Deutschgram Admin • Volodymyr Parashchak</title>
    <link rel="manifest" href="../manifest.webmanifest?v=<?php echo rawurlencode($assetVersion); ?>">
    <link rel="icon" href="../assets/icon.svg?v=<?php echo rawurlencode($assetVersion); ?>" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/styles.css?v=<?php echo rawurlencode($assetVersion); ?>">
</head>
<body class="admin-page">
    <div class="background-orbit orbit-a"></div>
    <div class="background-orbit orbit-b"></div>

    <div class="admin-shell">
        <aside class="sidebar">
            <div class="brand-card">
                <p class="eyebrow">управление приглашениями</p>
                <h1>Deutschgram Admin</h1>
                <p class="brand-copy">Здесь вы создаёте приглашения, копируете личные ссылки и отключаете старые доступы.</p>
                <p class="brand-credit">Разработчик: Volodymyr Parashchak</p>
            </div>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Вход в админку</h2>
                    <p>Введите admin key, чтобы создавать и отключать invite-ссылки.</p>
                </div>

                <form id="adminLoginForm" autocomplete="off">
                    <label class="field">
                        <span>Admin key</span>
                        <input type="password" id="adminKeyInput" maxlength="120" placeholder="Введите admin key">
                    </label>

                    <div class="inline-actions">
                        <button type="submit" class="primary-button">Открыть админку</button>
                        <button type="button" id="adminLogoutButton" class="secondary-button hidden">Выйти</button>
                    </div>
                </form>

                <p id="adminStatusText" class="helper-text">Введите ключ администратора, чтобы работать с приглашениями.</p>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Как это работает</h2>
                    <p>Сначала человек открывает invite-ссылку, выбирает своё имя, а потом может заходить уже по личной ссылке вида <code>/mama</code>.</p>
                </div>
                <a class="secondary-button back-link" href="../">Открыть приложение</a>
            </section>
        </aside>

        <main class="chat-panel">
            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Новое приглашение</h2>
                    <p>Заметка нужна только вам, чтобы не путаться в ссылках.</p>
                </div>

                <form id="createInviteForm" class="admin-create-form" autocomplete="off">
                    <label class="field">
                        <span>Заметка</span>
                        <input type="text" id="inviteNoteInput" maxlength="255" placeholder="Например, Мама">
                    </label>
                    <button type="submit" id="createInviteButton" class="primary-button wide-button">Создать приглашение</button>
                </form>
            </section>

            <section class="panel">
                <div class="panel-heading compact-heading">
                    <h2>Приглашения</h2>
                    <p>После первого входа рядом с invite-ссылкой появится постоянная личная ссылка.</p>
                </div>
                <div id="adminInvitesList" class="stack-list empty-list">Приглашения появятся здесь после входа в админку.</div>
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
                    <span class="eyebrow">личная ссылка</span>
                    <div class="invite-item-link invite-link-personal"></div>
                </div>
            </div>
            <div class="invite-item-actions">
                <button type="button" class="secondary-button copy-invite-button">Копировать invite</button>
                <button type="button" class="secondary-button copy-personal-button">Копировать личную</button>
                <button type="button" class="danger-button revoke-invite-button">Отключить</button>
            </div>
        </article>
    </template>

    <script>
        window.DEUTSCHGRAM_ADMIN_CONFIG = {
            apiBase: '../api/index.php'
        };
    </script>
    <script src="../assets/admin.js?v=<?php echo rawurlencode($assetVersion); ?>" defer></script>
</body>
</html>