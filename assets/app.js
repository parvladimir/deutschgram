const UI = {
    online: 'онлайн',
    offline: 'оффлайн',
    idle: 'был недавно',
    noInviteBadge: 'Нужно приглашение',
    invitePendingBadge: 'Проверяю invite...',
    inviteReadyBadge: 'Приглашение активно',
    inviteClaimedBadge: 'Приглашение закреплено',
    pathBadge: 'Личная ссылка',
    inviteErrorBadge: 'Ошибка ссылки',
    noInviteText: 'Откройте сайт по invite-ссылке, чтобы войти.',
    inviteLoadingText: 'Проверяю приглашение...',
    inviteClaimedTextPrefix: 'Эта invite-ссылка уже закреплена за @',
    inviteClaimedTextSuffix: '. Войти можно только под этим именем.',
    inviteReadyText: 'Приглашение активно. Введите имя и войдите.',
    inviteNotePrefix: 'Заметка к приглашению: ',
    pathReadyPrefix: 'Обнаружена личная ссылка: /',
    pathReadySuffix: '. Вход будет выполнен автоматически.',
    signInFirst: 'Сначала войдите, чтобы видеть людей и диалоги.',
    noUsers: 'Другие участники появятся здесь после входа.',
    noConversations: 'Откройте чат через список людей.',
    newConversation: 'Новый диалог без сообщений',
    headerChoose: 'выберите диалог',
    headerOnline: 'собеседник сейчас онлайн',
    headerOffline: 'собеседник сейчас не в сети',
    noConversationSelected: 'Выберите человека слева, чтобы открыть чат и начать звонок.',
    noMessages: 'Пока нет сообщений. Начните разговор первым.',
    loggedInHint: 'Вход выполнен. Теперь можно открыть диалог.',
    pathLoggedInHint: 'Вход выполнен по личной ссылке.',
    needInviteHint: 'Сначала откройте рабочую invite-ссылку.',
    pathMismatchHint: 'Эта личная ссылка работает только со своим именем пользователя.',
    enterUsernameHint: 'Введите имя пользователя.',
    profileEyebrow: 'ваш профиль',
    personalLinkLabel: 'личная ссылка',
    youLabel: 'Вы',
    deliveredStatus: 'доставлено',
    readStatus: 'прочитано',
    notificationDefault: 'Разрешение браузера ещё не выдано.',
    notificationPreparing: 'Разрешение получено. Подключаю push-уведомления...',
    notificationGranted: 'Push-уведомления включены для сообщений и звонков.',
    notificationDenied: 'Уведомления заблокированы браузером. Разрешите их в настройках сайта.',
    notificationNeedHttps: 'На телефоне уведомления работают только по HTTPS.',
    notificationNeedInstall: 'На iPhone push работают после "На экран Домой".',
    notificationPushUnavailable: 'Этот мобильный браузер не поддерживает push-уведомления для сайта.',
    notificationUnsupported: 'Этот браузер не поддерживает уведомления.',
    notificationButtonDefault: 'Включить уведомления',
    notificationButtonGranted: 'Уведомления включены',
    notificationButtonDenied: 'Уведомления заблокированы',
    notificationButtonUnavailable: 'Недоступно',
    callIdle: 'Звонок ещё не начат.',
    callEnded: 'Звонок завершён.',
    callFailed: 'Не удалось установить звонок.',
    callingPrefix: 'Звоним ',
    ringingSuffix: ' звонит вам.',
    connectingPrefix: 'Подключаем звонок с ',
    activeAudioPrefix: 'Аудиозвонок с ',
    activeVideoPrefix: 'Видеозвонок с ',
    activeCallSuffix: ' активен.',
    incomingAudio: 'аудиозвонок',
    incomingVideo: 'видеозвонок',
    muteLabel: 'Микрофон',
    unmuteLabel: 'Включить микрофон',
    cameraLabel: 'Камера',
    cameraOnLabel: 'Включить камеру',
    newMessageTitle: 'Новое сообщение',
    incomingCallTitleSuffix: 'звонит',
    incomingCallBodyAudio: 'Входящий аудиозвонок. Откройте Deutschgram, чтобы ответить.',
    incomingCallBodyVideo: 'Входящий видеозвонок. Откройте Deutschgram, чтобы ответить.',
    startCallErrorPrefix: 'Не удалось начать звонок: ',
    acceptCallErrorPrefix: 'Не удалось принять звонок: '
};

const config = window.DEUTSCHGRAM_CONFIG || {};
const USER_STORAGE_KEY = 'deutschgram-user-id';
const USERNAME_STORAGE_KEY = 'deutschgram-username';
const INVITE_STORAGE_KEY = 'deutschgram-invite-token';
const PUSH_DEVICE_TOKEN_KEY = 'deutschgram-push-device-token';
const SIGNAL_API = config.apiBase || 'api/index.php';
const SYNC_VISIBLE_MS = 5000;
const SYNC_HIDDEN_MS = 15000;

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const state = {
    inviteToken: null,
    inviteInfo: null,
    inviteError: '',
    usernamePath: normalizePathUsername(config.usernamePath || ''),
    currentUser: null,
    users: [],
    conversations: [],
    activeConversation: null,
    messages: [],
    syncTimer: null,
    syncInFlight: false,
    lastMessageId: 0,
    lastConversationMessageIds: new Map(),
    notificationsPrimed: false,
    serviceWorkerRegistration: null,
    pushPublicKey: null,
    pushSubscriptionReady: false,
    notificationError: '',
    titleFlashTimer: null,
    defaultTitle: document.title,
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    pendingCandidates: new Map(),
    callState: 'idle',
    currentCall: null,
    incomingOffer: null,
    isMuted: false,
    isCameraEnabled: true
};

const dom = {
    loginForm: document.getElementById('loginForm'),
    usernameInput: document.getElementById('usernameInput'),
    openMessengerButton: document.getElementById('openMessengerButton'),
    authHint: document.getElementById('authHint'),
    inviteBadge: document.getElementById('inviteBadge'),
    inviteStatusText: document.getElementById('inviteStatusText'),
    routeHint: document.getElementById('routeHint'),
    inviteNote: document.getElementById('inviteNote'),
    inviteInput: document.getElementById('inviteInput'),
    applyInviteButton: document.getElementById('applyInviteButton'),
    pasteInviteButton: document.getElementById('pasteInviteButton'),
    notificationButton: document.getElementById('notificationButton'),
    notificationText: document.getElementById('notificationText'),
    currentUserCard: document.getElementById('currentUserCard'),
    usersList: document.getElementById('usersList'),
    conversationsList: document.getElementById('conversationsList'),
    chatHeader: document.getElementById('chatHeader'),
    messagesPanel: document.getElementById('messagesPanel'),
    messageForm: document.getElementById('messageForm'),
    messageInput: document.getElementById('messageInput'),
    sendMessageButton: document.getElementById('sendMessageButton'),
    audioCallButton: document.getElementById('audioCallButton'),
    videoCallButton: document.getElementById('videoCallButton'),
    callStateText: document.getElementById('callStateText'),
    muteButton: document.getElementById('muteButton'),
    cameraButton: document.getElementById('cameraButton'),
    hangupButton: document.getElementById('hangupButton'),
    localVideo: document.getElementById('localVideo'),
    remoteVideo: document.getElementById('remoteVideo'),
    incomingCallModal: document.getElementById('incomingCallModal'),
    incomingCallTitle: document.getElementById('incomingCallTitle'),
    incomingCallText: document.getElementById('incomingCallText'),
    acceptCallButton: document.getElementById('acceptCallButton'),
    declineCallButton: document.getElementById('declineCallButton'),
    messageTemplate: document.getElementById('messageTemplate')
};

function normalizeInviteToken(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-f0-9]+/g, '');
}

function normalizePathUsername(value) {
    return String(value || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatTime(dateString) {
    const date = new Date(String(dateString).replace(' ', 'T') + 'Z');
    return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatDateTime(dateString) {
    const date = new Date(String(dateString).replace(' ', 'T') + 'Z');
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function relativePresence(user) {
    return user.is_online ? UI.online : UI.offline;
}

function personalPathLink(user) {
    if (user && user.path_link) {
        return user.path_link;
    }

    if (user && user.username) {
        return `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/${encodeURIComponent(user.username)}`;
    }

    return '';
}

function setAuthHint(message, isError = false) {
    dom.authHint.textContent = message;
    dom.authHint.style.color = isError ? '#ffb9ae' : '';
}

function setInviteBadge(label, mode) {
    dom.inviteBadge.textContent = label;
    dom.inviteBadge.className = `invite-badge invite-badge-${mode}`;
}

function appRootUrl() {
    try {
        return new URL(String(config.appRootPath || '/'), window.location.origin);
    } catch {
        return new URL('/', window.location.origin);
    }
}

function buildInviteUrl(token) {
    return new URL('join/' + encodeURIComponent(normalizeInviteToken(token)), appRootUrl());
}

function buildAdminUrl() {
    return new URL('admin/', appRootUrl());
}

function buildUserUrl(username) {
    return new URL(encodeURIComponent(normalizePathUsername(username)), appRootUrl());
}

function extractInviteToken(value) {
    const raw = String(value || '').trim();
    if (!raw) {
        return '';
    }

    const directToken = normalizeInviteToken(raw);
    if (directToken.length >= 32) {
        return directToken;
    }

    try {
        const url = new URL(raw);
        const fromQuery = normalizeInviteToken(url.searchParams.get('invite'));
        if (fromQuery.length >= 32) {
            return fromQuery;
        }

        const segments = String(url.pathname || '').split('/').filter(Boolean);
        const joinIndex = segments.findIndex((segment) => segment.toLowerCase() === 'join');
        if (joinIndex !== -1 && segments[joinIndex + 1]) {
            const fromJoinPath = normalizeInviteToken(segments[joinIndex + 1]);
            if (fromJoinPath.length >= 32) {
                return fromJoinPath;
            }
        }

        const trailingSegment = segments.length > 0 ? normalizeInviteToken(segments[segments.length - 1]) : '';
        if (trailingSegment.length >= 32) {
            return trailingSegment;
        }
    } catch {
    }

    const queryMatch = raw.match(/[?&]invite=([a-f0-9]+)/i);
    if (queryMatch) {
        return normalizeInviteToken(queryMatch[1]);
    }

    const joinMatch = raw.match(/(?:^|\/)join\/([a-f0-9]{32,})(?:$|[/?#])/i);
    if (joinMatch) {
        return normalizeInviteToken(joinMatch[1]);
    }

    const rawTokenMatch = raw.match(/\b([a-f0-9]{32,})\b/i);
    return rawTokenMatch ? normalizeInviteToken(rawTokenMatch[1]) : '';
}

function extractOpenUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) {
        return '';
    }

    const simplePath = raw.replace(/^\/+|\/+$/g, '');
    if (simplePath.toLowerCase() === 'admin') {
        return buildAdminUrl().toString();
    }

    if (raw.startsWith('/')) {
        const username = normalizePathUsername(simplePath);
        if (username && username !== 'join' && username !== 'admin') {
            return buildUserUrl(username).toString();
        }
        return '';
    }

    try {
        const url = new URL(raw);
        const segments = String(url.pathname || '').split('/').filter(Boolean);
        if (segments.length === 0) {
            return '';
        }

        const lastSegment = String(segments[segments.length - 1] || '').trim();
        if (lastSegment.toLowerCase() === 'admin') {
            return url.toString();
        }

        if (!url.searchParams.has('invite') && (segments.length === 1 || segments[segments.length - 2].toLowerCase() !== 'join')) {
            const username = normalizePathUsername(lastSegment);
            if (username && username !== 'join' && username !== 'admin') {
                return url.toString();
            }
        }
    } catch {
    }

    return '';
}

function updateInviteControls() {
    if (!dom.inviteInput) {
        return;
    }

    const lockedByPath = Boolean(state.usernamePath && !state.currentUser);
    const disabled = Boolean(state.currentUser) || lockedByPath;

    dom.inviteInput.disabled = disabled;

    if (dom.applyInviteButton) {
        dom.applyInviteButton.disabled = disabled;
    }

    if (dom.pasteInviteButton) {
        dom.pasteInviteButton.disabled = disabled;
    }

    if (!dom.inviteInput.value.trim() && state.inviteToken) {
        dom.inviteInput.value = state.inviteToken;
    }
}

async function applyInviteFromValue(rawValue, focusUsername = true) {
    const directUrl = extractOpenUrl(rawValue);
    if (directUrl) {
        window.location.href = directUrl;
        return true;
    }

    const token = extractInviteToken(rawValue);
    if (!token) {
        setAuthHint('Вставьте invite-ссылку, личную ссылку или /admin.', true);
        return false;
    }

    const inviteUrl = buildInviteUrl(token);

    if (state.usernamePath) {
        window.location.href = inviteUrl.toString();
        return false;
    }

    adoptInviteToken(token);
    state.inviteInfo = null;
    state.inviteError = '';

    if (dom.inviteInput) {
        dom.inviteInput.value = String(rawValue || token).trim() || token;
    }

    window.history.replaceState({}, '', inviteUrl.toString());
    await loadInviteStatus();

    if (state.inviteInfo) {
        setAuthHint('Приглашение добавлено. Теперь можно войти.');
        if (focusUsername) {
            dom.usernameInput.focus();
        }
        return true;
    }

    return false;
}

async function handleApplyInvite() {
    await applyInviteFromValue(dom.inviteInput ? dom.inviteInput.value : '');
}

async function handlePasteInvite() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
        setAuthHint('Вставьте ссылку вручную в поле выше.', true);
        return;
    }

    try {
        const raw = await navigator.clipboard.readText();
        if (dom.inviteInput) {
            dom.inviteInput.value = raw;
        }
        await applyInviteFromValue(raw);
    } catch {
        setAuthHint('Не удалось прочитать буфер обмена. Вставьте ссылку вручную.', true);
    }
}

function getPushDeviceToken() {
    const existing = localStorage.getItem(PUSH_DEVICE_TOKEN_KEY);
    if (existing && /^[a-f0-9]{64}$/i.test(existing)) {
        return existing.toLowerCase();
    }

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, (item) => item.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(PUSH_DEVICE_TOKEN_KEY, token);
    return token;
}

function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function isStandaloneMode() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}

function pushSupportIssue() {
    const host = String(window.location.hostname || '').toLowerCase();
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');

    if (!('Notification' in window)) {
        return UI.notificationUnsupported;
    }

    if (!window.isSecureContext && !isLocalHost) {
        return UI.notificationNeedHttps;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return UI.notificationPushUnavailable;
    }

    if (isIos && !isStandaloneMode()) {
        return UI.notificationNeedInstall;
    }

    return '';
}

function updateNotificationUI() {
    const supportIssue = pushSupportIssue();
    if (supportIssue) {
        dom.notificationButton.disabled = true;
        dom.notificationButton.textContent = UI.notificationButtonUnavailable;
        dom.notificationText.textContent = supportIssue;
        return;
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
        dom.notificationButton.disabled = true;
        dom.notificationButton.textContent = UI.notificationButtonDenied;
        dom.notificationText.textContent = state.notificationError || UI.notificationDenied;
        return;
    }

    if (permission === 'granted') {
        dom.notificationButton.disabled = state.pushSubscriptionReady;
        dom.notificationButton.textContent = state.pushSubscriptionReady
            ? UI.notificationButtonGranted
            : UI.notificationButtonDefault;
        dom.notificationText.textContent = state.pushSubscriptionReady
            ? UI.notificationGranted
            : (state.notificationError || UI.notificationPreparing);
        return;
    }

    dom.notificationButton.disabled = false;
    dom.notificationButton.textContent = UI.notificationButtonDefault;
    dom.notificationText.textContent = state.notificationError || UI.notificationDefault;
}

function updateInviteState() {
    updateInviteControls();
    const hasValidInvite = Boolean(state.inviteInfo && !state.inviteError);
    const claimedUsername = state.inviteInfo && state.inviteInfo.assigned_username ? state.inviteInfo.assigned_username : '';

    dom.routeHint.classList.toggle('hidden', !state.usernamePath);
    if (state.usernamePath) {
        dom.routeHint.textContent = `${UI.pathReadyPrefix}${state.usernamePath}${UI.pathReadySuffix}`;
    }

    if (state.currentUser && state.currentUser.display_name) {
        setInviteBadge(UI.pathBadge, 'claimed');
        dom.inviteStatusText.textContent = state.usernamePath
            ? `${UI.pathReadyPrefix}${state.usernamePath}`
            : UI.loggedInHint;
        dom.openMessengerButton.disabled = false;
        return;
    }

    if (state.usernamePath && !state.inviteToken) {
        setInviteBadge(UI.pathBadge, 'claimed');
        dom.inviteStatusText.textContent = `${UI.pathReadyPrefix}${state.usernamePath}${UI.pathReadySuffix}`;
        dom.usernameInput.value = state.usernamePath;
        dom.usernameInput.readOnly = true;
        dom.openMessengerButton.disabled = false;
        return;
    }

    if (!state.inviteToken) {
        setInviteBadge(UI.noInviteBadge, 'pending');
        dom.inviteStatusText.textContent = UI.noInviteText;
        dom.inviteNote.classList.add('hidden');
        dom.openMessengerButton.disabled = true;
        dom.usernameInput.readOnly = false;
        return;
    }

    if (state.inviteError) {
        setInviteBadge(UI.inviteErrorBadge, 'pending');
        dom.inviteStatusText.textContent = state.inviteError;
        dom.inviteNote.classList.add('hidden');
        dom.openMessengerButton.disabled = true;
        dom.usernameInput.readOnly = false;
        return;
    }

    if (!state.inviteInfo) {
        setInviteBadge(UI.invitePendingBadge, 'pending');
        dom.inviteStatusText.textContent = UI.inviteLoadingText;
        dom.inviteNote.classList.add('hidden');
        dom.openMessengerButton.disabled = true;
        dom.usernameInput.readOnly = false;
        return;
    }

    if (claimedUsername) {
        setInviteBadge(UI.inviteClaimedBadge, 'claimed');
        dom.inviteStatusText.textContent = `${UI.inviteClaimedTextPrefix}${claimedUsername}${UI.inviteClaimedTextSuffix}`;
        dom.usernameInput.value = claimedUsername;
        dom.usernameInput.readOnly = true;
    } else {
        setInviteBadge(UI.inviteReadyBadge, 'ready');
        dom.inviteStatusText.textContent = UI.inviteReadyText;
        dom.usernameInput.readOnly = false;
        if (!dom.usernameInput.value.trim() && state.inviteInfo.note) {
            dom.usernameInput.value = state.inviteInfo.note;
        }
    }

    if (state.inviteInfo.note) {
        dom.inviteNote.textContent = `${UI.inviteNotePrefix}${state.inviteInfo.note}`;
        dom.inviteNote.classList.remove('hidden');
    } else {
        dom.inviteNote.classList.add('hidden');
    }

    dom.openMessengerButton.disabled = !hasValidInvite;
}

function renderCurrentUser() {
    if (!state.currentUser || !state.currentUser.display_name) {
        dom.currentUserCard.classList.add('hidden');
        dom.loginForm.classList.remove('hidden');
        return;
    }

    const pathLink = personalPathLink(state.currentUser);

    dom.loginForm.classList.add('hidden');
    dom.currentUserCard.classList.remove('hidden');
    dom.currentUserCard.innerHTML = `
        <div class="eyebrow">${UI.profileEyebrow}</div>
        <div class="profile-name">${escapeHtml(state.currentUser.display_name)}</div>
        <div class="profile-row">
            <span>@${escapeHtml(state.currentUser.username)}</span>
            <span>${state.currentUser.is_online ? UI.online : UI.idle}</span>
        </div>
        <div class="profile-link-row">
            <span>${UI.personalLinkLabel}</span>
            <a href="${escapeHtml(pathLink)}">${escapeHtml(pathLink)}</a>
        </div>
    `;
}

function renderUsers() {
    if (!state.currentUser || !state.currentUser.display_name) {
        dom.usersList.className = 'stack-list empty-list';
        dom.usersList.textContent = UI.signInFirst;
        return;
    }

    if (state.users.length === 0) {
        dom.usersList.className = 'stack-list empty-list';
        dom.usersList.textContent = UI.noUsers;
        return;
    }

    dom.usersList.className = 'stack-list';
    dom.usersList.innerHTML = '';

    state.users.forEach((user) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'user-item';
        button.innerHTML = `
            <span class="user-main">
                <span class="user-name">${escapeHtml(user.display_name)}</span>
                <span class="user-status">@${escapeHtml(user.username)}</span>
            </span>
            <span class="status-pill ${user.is_online ? 'online' : 'offline'}">${relativePresence(user)}</span>
        `;
        button.addEventListener('click', () => openConversationWithUser(user.id));
        dom.usersList.appendChild(button);
    });
}
function renderConversations() {
    if (!state.currentUser || !state.currentUser.display_name) {
        dom.conversationsList.className = 'stack-list empty-list';
        dom.conversationsList.textContent = UI.signInFirst;
        return;
    }

    if (state.conversations.length === 0) {
        dom.conversationsList.className = 'stack-list empty-list';
        dom.conversationsList.textContent = UI.noConversations;
        return;
    }

    dom.conversationsList.className = 'stack-list';
    dom.conversationsList.innerHTML = '';

    state.conversations.forEach((conversation) => {
        const button = document.createElement('button');
        button.type = 'button';
        const isActive = Boolean(state.activeConversation && state.activeConversation.id === conversation.id);
        button.className = `conversation-item${isActive ? ' active' : ''}`;
        const preview = conversation.last_message
            ? escapeHtml(conversation.last_message.body.slice(0, 58))
            : UI.newConversation;
        button.innerHTML = `
            <span class="conversation-main">
                <span class="conversation-name">${escapeHtml(conversation.peer.display_name)}</span>
                <span class="conversation-preview">${preview}</span>
            </span>
            ${conversation.unread_count > 0 ? `<span class="unread-pill">${conversation.unread_count}</span>` : ''}
        `;
        button.addEventListener('click', () => openConversation(conversation.id));
        dom.conversationsList.appendChild(button);
    });
}

function renderChatHeader() {
    const activeConversation = state.activeConversation;
    const canInteract = Boolean(activeConversation);
    dom.audioCallButton.disabled = !canInteract;
    dom.videoCallButton.disabled = !canInteract;
    dom.messageInput.disabled = !canInteract;
    dom.sendMessageButton.disabled = !canInteract;

    if (!activeConversation) {
        dom.chatHeader.querySelector('h2').textContent = 'Сообщения';
        dom.chatHeader.querySelector('.eyebrow').textContent = UI.headerChoose;
        return;
    }

    dom.chatHeader.querySelector('h2').textContent = activeConversation.peer.display_name;
    dom.chatHeader.querySelector('.eyebrow').textContent = activeConversation.peer.is_online
        ? UI.headerOnline
        : UI.headerOffline;
}

function renderMessages() {
    if (!state.currentUser) {
        dom.messagesPanel.className = 'panel messages-panel empty-state';
        dom.messagesPanel.textContent = UI.signInFirst;
        return;
    }

    if (!state.activeConversation) {
        dom.messagesPanel.className = 'panel messages-panel empty-state';
        dom.messagesPanel.textContent = UI.noConversationSelected;
        return;
    }

    if (state.messages.length === 0) {
        dom.messagesPanel.className = 'panel messages-panel empty-state';
        dom.messagesPanel.textContent = UI.noMessages;
        return;
    }

    const shouldStickToBottom =
        dom.messagesPanel.scrollHeight - dom.messagesPanel.scrollTop - dom.messagesPanel.clientHeight < 80;

    dom.messagesPanel.className = 'panel messages-panel';
    dom.messagesPanel.innerHTML = '';

    state.messages.forEach((message) => {
        const fragment = dom.messageTemplate.content.cloneNode(true);
        const bubble = fragment.querySelector('.message-bubble');
        const meta = fragment.querySelector('.message-meta');
        const body = fragment.querySelector('.message-body');
        bubble.classList.toggle('own', message.is_from_current_user);
        const metaParts = [
            message.is_from_current_user ? UI.youLabel : message.sender_display_name,
            formatTime(message.created_at)
        ];
        if (message.is_from_current_user) {
            metaParts.push(message.is_read_by_peer ? UI.readStatus : UI.deliveredStatus);
        }
        meta.textContent = metaParts.join(' · ');
        body.textContent = message.body;
        dom.messagesPanel.appendChild(fragment);
    });

    if (shouldStickToBottom) {
        dom.messagesPanel.scrollTop = dom.messagesPanel.scrollHeight;
    }
}

function applyPeerReadState() {
    if (!state.activeConversation || state.messages.length === 0) {
        return;
    }

    const peerLastReadMessageId = Number(state.activeConversation.peer_last_read_message_id || 0);
    state.messages = state.messages.map((message) => {
        if (!message.is_from_current_user) {
            return message;
        }

        return {
            ...message,
            is_read_by_peer: message.id <= peerLastReadMessageId
        };
    });
}

function renderCallPanel() {
    const peerName = state.activeConversation && state.activeConversation.peer ? state.activeConversation.peer.display_name : 'Контакт';
    const labelMap = {
        idle: UI.callIdle,
        calling: `${UI.callingPrefix}${peerName}...`,
        ringing: `${peerName} ${UI.ringingSuffix}`,
        connecting: `${UI.connectingPrefix}${peerName}...`,
        in_call_audio: `${UI.activeAudioPrefix}${peerName}${UI.activeCallSuffix}`,
        in_call_video: `${UI.activeVideoPrefix}${peerName}${UI.activeCallSuffix}`,
        ended: UI.callEnded,
        failed: UI.callFailed
    };

    dom.callStateText.textContent = labelMap[state.callState] || UI.callIdle;
    const inCall = ['calling', 'connecting', 'in_call_audio', 'in_call_video', 'ringing'].includes(state.callState);
    dom.hangupButton.disabled = !inCall;
    dom.muteButton.disabled = !state.localStream;
    dom.cameraButton.disabled = !state.localStream || !state.currentCall || state.currentCall.mode !== 'video';
    dom.muteButton.textContent = state.isMuted ? UI.unmuteLabel : UI.muteLabel;
    dom.cameraButton.textContent = state.isCameraEnabled ? UI.cameraLabel : UI.cameraOnLabel;
}

function renderIncomingCall() {
    if (!state.incomingOffer) {
        dom.incomingCallModal.classList.add('hidden');
        return;
    }

    dom.incomingCallModal.classList.remove('hidden');
    const modeText = state.incomingOffer.payload.mode === 'video' ? UI.incomingVideo : UI.incomingAudio;
    dom.incomingCallTitle.textContent = `${state.incomingOffer.sender_display_name} ${UI.incomingCallTitleSuffix}`;
    dom.incomingCallText.textContent = `Входящий ${modeText}. Принять?`;
}

function render() {
    updateInviteState();
    updateNotificationUI();
    renderCurrentUser();
    renderUsers();
    renderConversations();
    renderChatHeader();
    renderMessages();
    renderCallPanel();
    renderIncomingCall();
}

async function api(action, options = {}) {
    const method = options.method || 'GET';
    const includeInvite = options.includeInvite !== false;
    const payload = { ...(options.payload || {}) };

    if (includeInvite) {
        if (!state.inviteToken) {
            throw new Error('Сначала откройте invite-ссылку или личную ссылку.');
        }

        if (!Object.prototype.hasOwnProperty.call(payload, 'invite_token')) {
            payload.invite_token = state.inviteToken;
        }
    }

    let url = `${SIGNAL_API}?action=${encodeURIComponent(action)}`;
    const fetchOptions = {
        method,
        headers: {}
    };

    if (method === 'GET') {
        const search = new URLSearchParams(payload);
        if (search.toString()) {
            url += `&${search.toString()}`;
        }
    } else {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify({ action, ...payload });
    }

    const response = await fetch(url, fetchOptions);
    const result = await response.json();

    if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Ошибка запроса');
    }

    return result;
}

function findConversationById(conversationId) {
    return state.conversations.find((conversation) => conversation.id === conversationId) || null;
}

function mergeConversations(nextConversations) {
    state.conversations = nextConversations;
    if (state.activeConversation) {
        const refreshed = findConversationById(state.activeConversation.id);
        if (refreshed) {
            state.activeConversation = refreshed;
        }
    }
}

function upsertMessages(messages) {
    if (!messages || messages.length === 0) {
        return;
    }

    const knownIds = new Set(state.messages.map((message) => message.id));
    const nextMessages = [...state.messages];
    messages.forEach((message) => {
        if (!knownIds.has(message.id)) {
            nextMessages.push(message);
        }
    });

    nextMessages.sort((left, right) => left.id - right.id);
    state.messages = nextMessages;
    state.lastMessageId = nextMessages.length > 0 ? nextMessages[nextMessages.length - 1].id : 0;
}

function persistSession(user) {
    localStorage.setItem(USER_STORAGE_KEY, String(user.id));
    localStorage.setItem(USERNAME_STORAGE_KEY, normalizePathUsername(user.username || ''));
    if (state.inviteToken) {
        localStorage.setItem(INVITE_STORAGE_KEY, state.inviteToken);
    }
}

function clearStoredUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USERNAME_STORAGE_KEY);
}

function adoptInviteToken(token) {
    const normalizedToken = normalizeInviteToken(token);
    const previousToken = normalizeInviteToken(localStorage.getItem(INVITE_STORAGE_KEY));

    if (normalizedToken && previousToken && normalizedToken !== previousToken) {
        clearStoredUser();
    }

    state.inviteToken = normalizedToken || null;

    if (state.inviteToken) {
        localStorage.setItem(INVITE_STORAGE_KEY, state.inviteToken);
    } else {
        localStorage.removeItem(INVITE_STORAGE_KEY);
    }
}

function flashTitle(message) {
    if (!document.hidden || state.titleFlashTimer) {
        return;
    }

    let flipped = false;
    state.titleFlashTimer = window.setInterval(() => {
        document.title = flipped ? state.defaultTitle : `${message} · ${state.defaultTitle}`;
        flipped = !flipped;
    }, 900);
}

function stopTitleFlash() {
    if (state.titleFlashTimer) {
        window.clearInterval(state.titleFlashTimer);
        state.titleFlashTimer = null;
    }
    document.title = state.defaultTitle;
}

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return null;
    }

    try {
        state.serviceWorkerRegistration = await navigator.serviceWorker.register(config.serviceWorker || 'service-worker.js');
    } catch {
        state.serviceWorkerRegistration = null;
    }

    return state.serviceWorkerRegistration;
}

async function loadPushPublicKey() {
    if (state.pushPublicKey) {
        return state.pushPublicKey;
    }

    const result = await api('push_public_key', {
        method: 'GET',
        includeInvite: false
    });
    state.pushPublicKey = result.public_key;
    return state.pushPublicKey;
}

async function postPushContextToWorker() {
    if (!state.serviceWorkerRegistration || !navigator.serviceWorker) {
        return;
    }

    const deviceToken = getPushDeviceToken();
    const context = {
        pullUrl: `${SIGNAL_API}?action=push_pull&device_token=${encodeURIComponent(deviceToken)}`,
        fallbackUrl: state.currentUser ? personalPathLink(state.currentUser) : window.location.href,
    };

    const registration = await navigator.serviceWorker.ready.catch(() => state.serviceWorkerRegistration);
    const target = registration?.active || registration?.waiting || registration?.installing || navigator.serviceWorker.controller;
    if (target) {
        target.postMessage({
            type: 'DEUTSCHGRAM_PUSH_CONTEXT',
            context,
        });
    }
}

async function showLocalBrowserNotification(title, body, options = {}) {
    if (state.pushSubscriptionReady) {
        return;
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    try {
        new Notification(title, {
            body,
            tag: options.tag || 'deutschgram-local',
        });
    } catch {
    }
}
async function ensurePushSubscription() {
    if (!state.currentUser || !state.inviteToken) {
        return false;
    }

    const supportIssue = pushSupportIssue();
    if (supportIssue) {
        state.pushSubscriptionReady = false;
        state.notificationError = '';
        updateNotificationUI();
        return false;
    }

    if (Notification.permission !== 'granted') {
        state.pushSubscriptionReady = false;
        state.notificationError = '';
        updateNotificationUI();
        return false;
    }

    const registration = await registerServiceWorker();
    if (!registration || !registration.pushManager) {
        state.pushSubscriptionReady = false;
        state.notificationError = UI.notificationPushUnavailable;
        updateNotificationUI();
        return false;
    }

    try {
        const readyRegistration = await navigator.serviceWorker.ready.catch(() => registration);
        let subscription = await readyRegistration.pushManager.getSubscription();
        if (!subscription) {
            const publicKey = await loadPushPublicKey();
            subscription = await readyRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
        }

        await api('push_subscribe', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                device_token: getPushDeviceToken(),
                subscription: subscription.toJSON()
            }
        });

        state.pushSubscriptionReady = true;
        state.notificationError = '';
        await postPushContextToWorker();
        updateNotificationUI();
        return true;
    } catch (error) {
        state.pushSubscriptionReady = false;
        state.notificationError = error && error.message ? error.message : UI.notificationDenied;
        updateNotificationUI();
        return false;
    }
}

async function requestNotificationAccess() {
    const supportIssue = pushSupportIssue();
    if (supportIssue) {
        state.notificationError = '';
        updateNotificationUI();
        return;
    }

    await registerServiceWorker();
    const permission = await Notification.requestPermission();
    state.notificationError = '';
    if (permission === 'granted') {
        await ensurePushSubscription();
    }
    updateNotificationUI();
}

function rememberConversationActivity(nextConversations) {
    const nextIds = new Set();

    nextConversations.forEach((conversation) => {
        const nextId = conversation.last_message ? conversation.last_message.id : 0;
        const previousId = state.lastConversationMessageIds.get(conversation.id) || 0;
        nextIds.add(conversation.id);

        const shouldNotify = state.notificationsPrimed && nextId > previousId && conversation.last_message;
        const fromOtherUser = shouldNotify && conversation.last_message.sender_id !== state.currentUser.id;
        const isVisibleConversation = !document.hidden && state.activeConversation && state.activeConversation.id === conversation.id;

        if (fromOtherUser && !isVisibleConversation) {
            const preview = conversation.last_message.body.length > 100
                ? `${conversation.last_message.body.slice(0, 97)}...`
                : conversation.last_message.body;
            showLocalBrowserNotification(conversation.peer.display_name, preview, {
                tag: `message-${conversation.id}-${nextId}`
            });
            flashTitle(UI.newMessageTitle);
        }

        state.lastConversationMessageIds.set(conversation.id, nextId);
    });

    Array.from(state.lastConversationMessageIds.keys()).forEach((conversationId) => {
        if (!nextIds.has(conversationId)) {
            state.lastConversationMessageIds.delete(conversationId);
        }
    });

    state.notificationsPrimed = true;
}

async function loadInviteStatus() {
    if (!state.inviteToken) {
        state.inviteInfo = null;
        state.inviteError = '';
        render();
        return;
    }

    state.inviteError = '';
    render();

    try {
        const result = await api('invite_status', {
            method: 'GET',
            payload: { invite_token: state.inviteToken },
            includeInvite: false
        });

        state.inviteInfo = result.invite;
        if (state.inviteInfo.assigned_username && !state.currentUser) {
            dom.usernameInput.value = state.inviteInfo.assigned_username;
        }
    } catch (error) {
        state.inviteInfo = null;
        state.inviteError = error.message;
    }

    render();
}

function nextSyncDelay() {
    return document.hidden ? SYNC_HIDDEN_MS : SYNC_VISIBLE_MS;
}

function stopSyncLoop() {
    if (state.syncTimer) {
        window.clearTimeout(state.syncTimer);
        state.syncTimer = null;
    }
}

function scheduleNextSync() {
    stopSyncLoop();
    if (!state.currentUser) {
        return;
    }

    state.syncTimer = window.setTimeout(() => {
        syncState();
    }, nextSyncDelay());
}

async function syncState() {
    if (!state.currentUser || state.syncInFlight) {
        scheduleNextSync();
        return;
    }

    state.syncInFlight = true;

    try {
        const result = await api('sync', {
            method: 'GET',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: state.activeConversation ? state.activeConversation.id : 0,
                after_message_id: state.activeConversation ? state.lastMessageId : 0
            }
        });

        state.currentUser = result.current_user;
        state.users = result.users;
        rememberConversationActivity(result.conversations);
        mergeConversations(result.conversations);

        if (result.active_conversation) {
            state.activeConversation = result.active_conversation;
            if (state.lastMessageId === 0) {
                state.messages = [];
            }
            upsertMessages(result.messages);
            applyPeerReadState();
        } else if (!state.activeConversation) {
            state.messages = [];
            state.lastMessageId = 0;
        }

        await processSignals(result.signals || []);
        render();
    } catch (error) {
        setAuthHint(error.message, true);
        clearStoredUser();
        state.currentUser = null;
        render();
    } finally {
        state.syncInFlight = false;
        scheduleNextSync();
    }
}

function startSyncLoop() {
    stopSyncLoop();
    syncState();
}

function applyPersonalRoute(user) {
    if (!user || !user.username) {
        return;
    }

    state.usernamePath = normalizePathUsername(user.username);
    const targetUrl = user.path_link || personalPathLink(user);
    if (targetUrl && window.location.href !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
    }
}

function finalizeLogin(result, hintText) {
    state.currentUser = result.user;
    state.inviteInfo = result.invite;
    adoptInviteToken(result.invite.token);
    persistSession(result.user);
    applyPersonalRoute(result.user);
    state.messages = [];
    state.lastMessageId = 0;
    setAuthHint(hintText);
    render();
    startSyncLoop();
    ensurePushSubscription();
}

async function loginByPath(username, silent = false) {
    try {
        const result = await api('login_path', {
            method: 'POST',
            payload: { username },
            includeInvite: false
        });
        finalizeLogin(result, UI.pathLoggedInHint);
    } catch (error) {
        if (!silent) {
            setAuthHint(error.message, true);
        } else {
            setAuthHint(error.message, true);
            render();
        }
    }
}

async function loginUser(event) {
    event.preventDefault();

    const username = dom.usernameInput.value.trim();
    if (!username) {
        setAuthHint(UI.enterUsernameHint, true);
        return;
    }

    if (state.usernamePath && !state.inviteInfo) {
        if (normalizePathUsername(username) !== state.usernamePath) {
            setAuthHint(UI.pathMismatchHint, true);
            return;
        }

        await loginByPath(state.usernamePath);
        return;
    }

    if (!state.inviteInfo && dom.inviteInput && dom.inviteInput.value.trim()) {
        const applied = await applyInviteFromValue(dom.inviteInput.value.trim(), false);
        if (!applied && !state.inviteInfo) {
            return;
        }
    }

    if (!state.inviteInfo) {
        setAuthHint(UI.needInviteHint, true);
        return;
    }

    try {
        const result = await api('login', {
            method: 'POST',
            payload: { username }
        });
        finalizeLogin(result, UI.loggedInHint);
    } catch (error) {
        setAuthHint(error.message, true);
    }
}

async function restoreSession() {
    if (state.usernamePath) {
        const storedUsername = normalizePathUsername(localStorage.getItem(USERNAME_STORAGE_KEY));
        if (storedUsername && storedUsername !== state.usernamePath) {
            clearStoredUser();
            state.currentUser = null;
        }

        dom.usernameInput.value = state.usernamePath;
        await loginByPath(state.usernamePath, true);
        return;
    }

    const rawUserId = localStorage.getItem(USER_STORAGE_KEY);
    if (rawUserId && state.inviteToken) {
        state.currentUser = { id: Number(rawUserId) };

        try {
            await syncState();
            await ensurePushSubscription();
            return;
        } catch {
            clearStoredUser();
            state.currentUser = null;
            render();
        }
    }
}

async function openConversationWithUser(peerUserId) {
    if (!state.currentUser) {
        return;
    }

    try {
        const result = await api('open_direct', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                peer_user_id: peerUserId
            }
        });

        state.activeConversation = result.conversation;
        state.messages = [];
        state.lastMessageId = 0;
        render();
        await syncState();
    } catch (error) {
        setAuthHint(error.message, true);
    }
}

async function openConversation(conversationId) {
    const conversation = findConversationById(conversationId);
    if (!conversation) {
        return;
    }

    state.activeConversation = conversation;
    state.messages = [];
    state.lastMessageId = 0;
    render();
    await syncState();
}

async function handleSendMessage(event) {
    event.preventDefault();

    if (!state.activeConversation || !state.currentUser) {
        return;
    }

    const body = dom.messageInput.value.trim();
    if (!body) {
        return;
    }

    try {
        const result = await api('send_message', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: state.activeConversation.id,
                body
            }
        });

        dom.messageInput.value = '';
        upsertMessages([result.message]);
        state.activeConversation = result.conversation;
        applyPeerReadState();
        mergeConversations(
            state.conversations.map((conversation) =>
                conversation.id === result.conversation.id ? result.conversation : conversation
            )
        );
        render();
        dom.messagesPanel.scrollTop = dom.messagesPanel.scrollHeight;
    } catch (error) {
        setAuthHint(error.message, true);
    }
}

function getPendingCandidateQueue(conversationId) {
    if (!state.pendingCandidates.has(conversationId)) {
        state.pendingCandidates.set(conversationId, []);
    }

    return state.pendingCandidates.get(conversationId);
}

function attachStreams() {
    dom.localVideo.srcObject = state.localStream || null;
    dom.remoteVideo.srcObject = state.remoteStream || null;
}

async function acquireLocalStream(mode) {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === 'video'
    });
    state.localStream = stream;
    state.isMuted = false;
    state.isCameraEnabled = mode === 'video';
    attachStreams();
}
function cleanupCall(notifyPeer = false, nextState = 'ended') {
    const currentCall = state.currentCall;

    if (notifyPeer && currentCall && state.currentUser) {
        api('send_signal', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: currentCall.conversationId,
                recipient_id: currentCall.peerUserId,
                type: 'call-hangup',
                payload: { mode: currentCall.mode }
            }
        }).catch(() => undefined);
    }

    if (state.peerConnection) {
        state.peerConnection.onicecandidate = null;
        state.peerConnection.ontrack = null;
        state.peerConnection.onconnectionstatechange = null;
        state.peerConnection.close();
        state.peerConnection = null;
    }

    if (state.localStream) {
        state.localStream.getTracks().forEach((track) => track.stop());
        state.localStream = null;
    }

    if (state.remoteStream) {
        state.remoteStream.getTracks().forEach((track) => track.stop());
        state.remoteStream = null;
    }

    state.pendingCandidates.clear();
    state.currentCall = null;
    state.incomingOffer = null;
    state.callState = nextState;
    attachStreams();
    stopTitleFlash();
    render();
}

async function createPeerConnection(call) {
    state.remoteStream = new MediaStream();
    attachStreams();

    const peerConnection = new RTCPeerConnection(rtcConfig);
    state.peerConnection = peerConnection;
    state.currentCall = call;

    state.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, state.localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            if (!state.remoteStream.getTracks().some((knownTrack) => knownTrack.id === track.id)) {
                state.remoteStream.addTrack(track);
            }
        });
        attachStreams();
    };

    peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
            return;
        }

        api('send_signal', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: call.conversationId,
                recipient_id: call.peerUserId,
                type: 'ice-candidate',
                payload: { candidate: event.candidate.toJSON() }
            }
        }).catch(() => undefined);
    };

    peerConnection.onconnectionstatechange = () => {
        const status = peerConnection.connectionState;
        if (status === 'connected') {
            state.callState = call.mode === 'video' ? 'in_call_video' : 'in_call_audio';
            stopTitleFlash();
            render();
        }

        if (['disconnected', 'failed', 'closed'].includes(status)) {
            cleanupCall(false, status === 'failed' ? 'failed' : 'ended');
        }
    };

    return peerConnection;
}

async function flushPendingCandidates(conversationId) {
    if (!state.peerConnection) {
        return;
    }

    const queue = getPendingCandidateQueue(conversationId);
    while (queue.length > 0) {
        const candidate = queue.shift();
        await state.peerConnection.addIceCandidate(candidate);
    }
}

async function startCall(mode) {
    if (!state.activeConversation || !state.currentUser) {
        return;
    }

    if (!['idle', 'ended', 'failed'].includes(state.callState)) {
        return;
    }

    try {
        await acquireLocalStream(mode);
        const call = {
            conversationId: state.activeConversation.id,
            peerUserId: state.activeConversation.peer.id,
            mode,
            direction: 'outgoing'
        };
        const peerConnection = await createPeerConnection(call);
        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: mode === 'video'
        });
        await peerConnection.setLocalDescription(offer);

        state.callState = 'calling';
        render();

        await api('send_signal', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: call.conversationId,
                recipient_id: call.peerUserId,
                type: 'call-offer',
                payload: {
                    mode,
                    description: peerConnection.localDescription.toJSON()
                }
            }
        });
    } catch (error) {
        cleanupCall(false, 'failed');
        setAuthHint(`${UI.startCallErrorPrefix}${error.message}`, true);
    }
}

async function acceptIncomingCall() {
    if (!state.incomingOffer || !state.currentUser) {
        return;
    }

    try {
        const offer = state.incomingOffer;
        state.incomingOffer = null;

        const conversation = findConversationById(offer.conversation_id);
        if (conversation) {
            state.activeConversation = conversation;
            state.messages = [];
            state.lastMessageId = 0;
        }

        await syncState();
        await acquireLocalStream(offer.payload.mode);

        const call = {
            conversationId: offer.conversation_id,
            peerUserId: offer.sender_id,
            mode: offer.payload.mode,
            direction: 'incoming'
        };

        const peerConnection = await createPeerConnection(call);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.payload.description));
        await flushPendingCandidates(offer.conversation_id);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        state.callState = 'connecting';
        stopTitleFlash();
        render();

        await api('send_signal', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: offer.conversation_id,
                recipient_id: offer.sender_id,
                type: 'call-answer',
                payload: {
                    mode: offer.payload.mode,
                    description: peerConnection.localDescription.toJSON()
                }
            }
        });
    } catch (error) {
        cleanupCall(false, 'failed');
        setAuthHint(`${UI.acceptCallErrorPrefix}${error.message}`, true);
    }
}

async function declineIncomingCall() {
    if (!state.incomingOffer || !state.currentUser) {
        return;
    }

    const offer = state.incomingOffer;
    state.incomingOffer = null;
    state.callState = 'idle';
    stopTitleFlash();
    render();

    try {
        await api('send_signal', {
            method: 'POST',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: offer.conversation_id,
                recipient_id: offer.sender_id,
                type: 'call-decline',
                payload: { mode: offer.payload.mode }
            }
        });
    } catch (error) {
        setAuthHint(error.message, true);
    }
}

async function notifyIncomingCall(signal) {
    const isVideo = signal.payload.mode === 'video';
    const body = isVideo ? UI.incomingCallBodyVideo : UI.incomingCallBodyAudio;
    await showLocalBrowserNotification(signal.sender_display_name, body, {
        tag: `call-${signal.conversation_id}-${signal.id}`
    });
    flashTitle(`${signal.sender_display_name} ${UI.incomingCallTitleSuffix}`);
}

async function processSignals(signals) {
    for (const signal of signals) {
        if (signal.type === 'call-offer') {
            if (state.currentCall || state.incomingOffer) {
                await api('send_signal', {
                    method: 'POST',
                    payload: {
                        user_id: state.currentUser.id,
                        conversation_id: signal.conversation_id,
                        recipient_id: signal.sender_id,
                        type: 'call-busy',
                        payload: { mode: signal.payload.mode }
                    }
                });
                continue;
            }

            state.incomingOffer = signal;
            state.callState = 'ringing';
            render();
            await notifyIncomingCall(signal);
            continue;
        }

        if (signal.type === 'call-answer' && state.peerConnection && state.currentCall) {
            await state.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload.description));
            state.callState = 'connecting';
            await flushPendingCandidates(signal.conversation_id);
            render();
            continue;
        }

        if (signal.type === 'ice-candidate') {
            const candidate = new RTCIceCandidate(signal.payload.candidate);
            if (
                state.peerConnection &&
                state.currentCall &&
                state.currentCall.conversationId === signal.conversation_id &&
                state.peerConnection.remoteDescription
            ) {
                await state.peerConnection.addIceCandidate(candidate);
            } else {
                getPendingCandidateQueue(signal.conversation_id).push(candidate);
            }
            continue;
        }

        if (signal.type === 'call-decline' || signal.type === 'call-busy' || signal.type === 'call-hangup') {
            cleanupCall(false, 'ended');
        }
    }
}

function toggleMute() {
    if (!state.localStream) {
        return;
    }

    state.isMuted = !state.isMuted;
    state.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !state.isMuted;
    });
    render();
}

function toggleCamera() {
    if (!state.localStream) {
        return;
    }

    state.isCameraEnabled = !state.isCameraEnabled;
    state.localStream.getVideoTracks().forEach((track) => {
        track.enabled = state.isCameraEnabled;
    });
    render();
}

function hydrateInviteToken() {
    const configToken = normalizeInviteToken(config.initialInviteToken || '');
    const urlToken = normalizeInviteToken(new URLSearchParams(window.location.search).get('invite'));
    const storedToken = normalizeInviteToken(localStorage.getItem(INVITE_STORAGE_KEY));
    const activeToken = configToken || urlToken;
    if (activeToken) {
        adoptInviteToken(activeToken);
        if (dom.inviteInput && !dom.inviteInput.value.trim()) {
            dom.inviteInput.value = activeToken;
        }
        return;
    }
    if (state.usernamePath) {
        state.inviteToken = null;
        return;
    }
    if (storedToken) {
        state.inviteToken = storedToken;
        if (dom.inviteInput && !dom.inviteInput.value.trim()) {
            dom.inviteInput.value = storedToken;
        }
    }
}

async function initialize() {
    hydrateInviteToken();
    await registerServiceWorker();
    render();
    await loadInviteStatus();
    await restoreSession();
    if (state.currentUser) {
        await ensurePushSubscription();
    }
    render();
}

if (dom.applyInviteButton) {
    dom.applyInviteButton.addEventListener('click', handleApplyInvite);
}
if (dom.pasteInviteButton) {
    dom.pasteInviteButton.addEventListener('click', handlePasteInvite);
}
if (dom.inviteInput) {
    dom.inviteInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleApplyInvite();
        }
    });
}
dom.loginForm.addEventListener('submit', loginUser);
dom.messageForm.addEventListener('submit', handleSendMessage);
dom.audioCallButton.addEventListener('click', () => startCall('audio'));
dom.videoCallButton.addEventListener('click', () => startCall('video'));
dom.acceptCallButton.addEventListener('click', acceptIncomingCall);
dom.declineCallButton.addEventListener('click', declineIncomingCall);
dom.hangupButton.addEventListener('click', () => cleanupCall(true));
dom.muteButton.addEventListener('click', toggleMute);
dom.cameraButton.addEventListener('click', toggleCamera);
dom.notificationButton.addEventListener('click', requestNotificationAccess);
window.addEventListener('beforeunload', () => cleanupCall(true));
window.addEventListener('focus', () => {
    stopTitleFlash();
    syncState();
});
window.addEventListener('pageshow', () => {
    syncState();
});
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        stopTitleFlash();
        syncState();
    }
});

initialize();
