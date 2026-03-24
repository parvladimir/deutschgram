const UI = {
    online: '\u043E\u043D\u043B\u0430\u0439\u043D',
    offline: '\u043E\u0444\u043B\u0430\u0439\u043D',
    idle: '\u043D\u0435 \u0432 \u0441\u0435\u0442\u0438',
    noInviteBadge: '\u041D\u0435\u0442 invite-\u0441\u0441\u044B\u043B\u043A\u0438',
    invitePendingBadge: '\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C invite...',
    inviteReadyBadge: '\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u043E',
    inviteClaimedBadge: '\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u043E',
    inviteErrorBadge: 'Invite \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D',
    noInviteText: '\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0441\u0430\u0439\u0442 \u043F\u043E invite-\u0441\u0441\u044B\u043B\u043A\u0435, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0439\u0442\u0438.',
    inviteLoadingText: '\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u044E \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435...',
    inviteClaimedTextPrefix: '\u042D\u0442\u0430 \u0441\u0441\u044B\u043B\u043A\u0430 \u0443\u0436\u0435 \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u0430 \u0437\u0430 ',
    inviteClaimedTextSuffix: '. \u0412\u043E\u0439\u0442\u0438 \u043C\u043E\u0436\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0434 \u044D\u0442\u0438\u043C \u0438\u043C\u0435\u043D\u0435\u043C.',
    inviteReadyText: '\u0421\u0441\u044B\u043B\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430. \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0438 \u0432\u043E\u0439\u0434\u0438\u0442\u0435.',
    inviteNotePrefix: '\u0418\u043C\u044F \u0434\u043B\u044F \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F: ',
    signInFirst: '\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u043F\u043E \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044E.',
    noUsers: '\u0414\u0440\u0443\u0433\u0438\u0435 \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0438 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430.',
    noConversations: '\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0447\u0430\u0442 \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u043B\u044E\u0434\u0435\u0439.',
    newConversation: '\u041D\u043E\u0432\u044B\u0439 \u0434\u0438\u0430\u043B\u043E\u0433 \u0431\u0435\u0437 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439',
    headerChoose: '\u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0438\u0430\u043B\u043E\u0433',
    headerOnline: '\u0441\u043E\u0431\u0435\u0441\u0435\u0434\u043D\u0438\u043A \u0441\u0435\u0439\u0447\u0430\u0441 \u043E\u043D\u043B\u0430\u0439\u043D',
    headerOffline: '\u0441\u043E\u0431\u0435\u0441\u0435\u0434\u043D\u0438\u043A \u0441\u0435\u0439\u0447\u0430\u0441 \u043E\u0444\u043B\u0430\u0439\u043D',
    noConversationSelected: '\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u0441\u043B\u0435\u0432\u0430, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0447\u0430\u0442 \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0437\u0432\u043E\u043D\u043E\u043A.',
    noMessages: '\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439. \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u043F\u0435\u0440\u0432\u044B\u043C.',
    loggedInHint: '\u0412\u0445\u043E\u0434 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D. \u0422\u0435\u043F\u0435\u0440\u044C \u043C\u043E\u0436\u043D\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u0438\u0430\u043B\u043E\u0433.',
    needInviteHint: '\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0440\u0430\u0431\u043E\u0447\u0443\u044E invite-\u0441\u0441\u044B\u043B\u043A\u0443.',
    adminNeedKey: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043B\u044E\u0447 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F\u043C\u0438.',
    adminLoading: '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F...',
    adminReady: '\u0410\u0434\u043C\u0438\u043D\u043A\u0430 \u0433\u043E\u0442\u043E\u0432\u0430. \u041C\u043E\u0436\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0435 invite-\u0441\u0441\u044B\u043B\u043A\u0438.',
    adminEmpty: '\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0439.',
    adminCopyDone: '\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430.',
    adminCreatedPrefix: '\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E: ',
    adminRevoked: '\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043E\u0442\u043E\u0437\u0432\u0430\u043D\u043E.',
    inviteActive: '\u0410\u043A\u0442\u0438\u0432\u043D\u043E',
    inviteUsed: '\u0417\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u043E',
    inviteRevoked: '\u041E\u0442\u043E\u0437\u0432\u0430\u043D\u043E',
    inviteNeverUsed: '\u0435\u0449\u0435 \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u043E',
    inviteLastUsedPrefix: '\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0432\u0445\u043E\u0434: ',
    callIdle: '\u0417\u0432\u043E\u043D\u043E\u043A \u0435\u0449\u0435 \u043D\u0435 \u043D\u0430\u0447\u0430\u0442.',
    callEnded: '\u0417\u0432\u043E\u043D\u043E\u043A \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D.',
    callFailed: '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0437\u0432\u043E\u043D\u043E\u043A.',
    incomingAudio: '\u0430\u0443\u0434\u0438\u043E\u0437\u0432\u043E\u043D\u043E\u043A',
    incomingVideo: '\u0432\u0438\u0434\u0435\u043E\u0437\u0432\u043E\u043D\u043E\u043A',
    muteLabel: '\u041C\u0438\u043A\u0440\u043E\u0444\u043E\u043D',
    unmuteLabel: '\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D',
    cameraLabel: '\u041A\u0430\u043C\u0435\u0440\u0430',
    cameraOnLabel: '\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u0430\u043C\u0435\u0440\u0443'
};

const state = {
    inviteToken: null,
    inviteInfo: null,
    inviteError: '',
    currentUser: null,
    users: [],
    conversations: [],
    activeConversation: null,
    messages: [],
    syncTimer: null,
    syncInFlight: false,
    lastMessageId: 0,
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    pendingCandidates: new Map(),
    callState: 'idle',
    currentCall: null,
    incomingOffer: null,
    isMuted: false,
    isCameraEnabled: true,
    adminKey: null,
    adminInvites: [],
    adminLoading: false,
    adminError: ''
};

const dom = {
    loginForm: document.getElementById('loginForm'),
    usernameInput: document.getElementById('usernameInput'),
    openMessengerButton: document.getElementById('openMessengerButton'),
    authHint: document.getElementById('authHint'),
    inviteBadge: document.getElementById('inviteBadge'),
    inviteStatusText: document.getElementById('inviteStatusText'),
    inviteNote: document.getElementById('inviteNote'),
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
    messageTemplate: document.getElementById('messageTemplate'),
    inviteRowTemplate: document.getElementById('inviteRowTemplate'),
    adminLoginForm: document.getElementById('adminLoginForm'),
    adminKeyInput: document.getElementById('adminKeyInput'),
    adminLogoutButton: document.getElementById('adminLogoutButton'),
    adminStatusText: document.getElementById('adminStatusText'),
    adminWorkspace: document.getElementById('adminWorkspace'),
    createInviteForm: document.getElementById('createInviteForm'),
    inviteNoteInput: document.getElementById('inviteNoteInput'),
    createInviteButton: document.getElementById('createInviteButton'),
    adminInvitesList: document.getElementById('adminInvitesList')
};

const USER_STORAGE_KEY = 'deutschgram-user-id';
const INVITE_STORAGE_KEY = 'deutschgram-invite-token';
const ADMIN_STORAGE_KEY = 'deutschgram-admin-key';
const SIGNAL_API = 'api/index.php';
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

function normalizeInviteToken(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-f0-9]+/g, '');
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
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatDateTime(dateString) {
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
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

function setAuthHint(message, isError = false) {
    dom.authHint.textContent = message;
    dom.authHint.style.color = isError ? '#ffb9ae' : '';
}

function setAdminStatus(message, isError = false) {
    dom.adminStatusText.textContent = message;
    dom.adminStatusText.style.color = isError ? '#ffb9ae' : '';
}

function setInviteBadge(label, mode) {
    dom.inviteBadge.textContent = label;
    dom.inviteBadge.className = `invite-badge invite-badge-${mode}`;
}

function updateInviteState() {
    const hasValidInvite = Boolean(state.inviteInfo && !state.inviteError);
    const claimedUsername = state.inviteInfo?.assigned_username || '';

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
        dom.inviteStatusText.textContent = `${UI.inviteClaimedTextPrefix}@${claimedUsername}${UI.inviteClaimedTextSuffix}`;
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

    dom.loginForm.classList.add('hidden');
    dom.currentUserCard.classList.remove('hidden');
    dom.currentUserCard.innerHTML = `
        <div class="eyebrow">your profile</div>
        <div class="profile-name">${escapeHtml(state.currentUser.display_name)}</div>
        <div class="profile-row">
            <span>@${escapeHtml(state.currentUser.username)}</span>
            <span>${state.currentUser.is_online ? UI.online : UI.idle}</span>
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
    dom.conversationsList.innerHTML = '';    state.conversations.forEach((conversation) => {
        const button = document.createElement('button');
        button.type = 'button';
        const isActive = state.activeConversation && state.activeConversation.id === conversation.id;
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
        dom.chatHeader.querySelector('h2').textContent = '\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F';
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
        meta.textContent = `${message.sender_display_name} - ${formatTime(message.created_at)}`;
        body.textContent = message.body;
        dom.messagesPanel.appendChild(fragment);
    });

    if (shouldStickToBottom) {
        dom.messagesPanel.scrollTop = dom.messagesPanel.scrollHeight;
    }
}

function renderCallPanel() {
    const peerName = state.activeConversation?.peer.display_name || 'Contact';
    const labelMap = {
        idle: UI.callIdle,
        calling: `\u0417\u0432\u043E\u043D\u0438\u043C ${peerName}...`,
        ringing: `${peerName} \u0437\u0432\u043E\u043D\u0438\u0442 \u0432\u0430\u043C.`,
        connecting: `\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0435\u043C \u0437\u0432\u043E\u043D\u043E\u043A \u0441 ${peerName}...`,
        in_call_audio: `\u0410\u0443\u0434\u0438\u043E\u0437\u0432\u043E\u043D\u043E\u043A \u0441 ${peerName} \u0430\u043A\u0442\u0438\u0432\u0435\u043D.`,
        in_call_video: `\u0412\u0438\u0434\u0435\u043E\u0437\u0432\u043E\u043D\u043E\u043A \u0441 ${peerName} \u0430\u043A\u0442\u0438\u0432\u0435\u043D.`,
        ended: UI.callEnded,
        failed: UI.callFailed
    };

    dom.callStateText.textContent = labelMap[state.callState] || UI.callIdle;
    const inCall = ['calling', 'connecting', 'in_call_audio', 'in_call_video', 'ringing'].includes(state.callState);
    dom.hangupButton.disabled = !inCall;
    dom.muteButton.disabled = !state.localStream;
    dom.cameraButton.disabled = !state.localStream || state.currentCall?.mode !== 'video';
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
    dom.incomingCallTitle.textContent = `${state.incomingOffer.sender_display_name} \u0437\u0432\u043E\u043D\u0438\u0442`;
    dom.incomingCallText.textContent = `\u0412\u0445\u043E\u0434\u044F\u0449\u0438\u0439 ${modeText}. \u041F\u0440\u0438\u043D\u044F\u0442\u044C?`;
}

function renderAdminInvites() {
    if (!state.adminKey) {
        dom.adminInvitesList.className = 'stack-list empty-list';
        dom.adminInvitesList.textContent = UI.adminNeedKey;
        return;
    }

    if (state.adminLoading) {
        dom.adminInvitesList.className = 'stack-list empty-list';
        dom.adminInvitesList.textContent = UI.adminLoading;
        return;
    }

    if (state.adminInvites.length === 0) {
        dom.adminInvitesList.className = 'stack-list empty-list';
        dom.adminInvitesList.textContent = UI.adminEmpty;
        return;
    }

    dom.adminInvitesList.className = 'stack-list';
    dom.adminInvitesList.innerHTML = '';

    state.adminInvites.forEach((invite) => {
        const fragment = dom.inviteRowTemplate.content.cloneNode(true);
        const root = fragment.querySelector('.invite-item');
        const title = fragment.querySelector('.invite-item-title');
        const meta = fragment.querySelector('.invite-item-meta');
        const link = fragment.querySelector('.invite-item-link');
        const status = fragment.querySelector('.invite-item-status');
        const copyButton = fragment.querySelector('.copy-invite-button');
        const revokeButton = fragment.querySelector('.revoke-invite-button');

        title.textContent = invite.note || (invite.assigned_username ? `@${invite.assigned_username}` : 'Invite');

        const metaParts = [];
        if (invite.assigned_username) {
            metaParts.push(`@${invite.assigned_username}`);
        }
        metaParts.push(invite.last_used_at ? `${UI.inviteLastUsedPrefix}${formatDateTime(invite.last_used_at)}` : UI.inviteNeverUsed);
        meta.textContent = metaParts.join(' · ');

        link.textContent = invite.link;
        root.dataset.token = invite.token;
        copyButton.dataset.link = invite.link;
        revokeButton.dataset.token = invite.token;

        if (invite.revoked_at) {
            status.textContent = UI.inviteRevoked;
            status.className = 'status-pill offline';
            revokeButton.disabled = true;
        } else if (invite.is_claimed) {
            status.textContent = UI.inviteUsed;
            status.className = 'status-pill claimed';
        } else {
            status.textContent = UI.inviteActive;
            status.className = 'status-pill online';
        }

        copyButton.addEventListener('click', () => copyText(invite.link));
        revokeButton.addEventListener('click', () => revokeInvite(invite.token));
        dom.adminInvitesList.appendChild(fragment);
    });
}

function renderAdminPanel() {
    const hasAdmin = Boolean(state.adminKey);
    dom.adminLogoutButton.classList.toggle('hidden', !hasAdmin);
    dom.adminWorkspace.classList.toggle('hidden', !hasAdmin);

    if (!hasAdmin) {
        setAdminStatus(state.adminError || UI.adminNeedKey, Boolean(state.adminError));
        renderAdminInvites();
        return;
    }

    if (state.adminLoading) {
        setAdminStatus(UI.adminLoading);
    } else if (state.adminError) {
        setAdminStatus(state.adminError, true);
    } else {
        setAdminStatus(UI.adminReady);
    }

    renderAdminInvites();
}

function render() {
    updateInviteState();
    renderCurrentUser();
    renderUsers();
    renderConversations();
    renderChatHeader();
    renderMessages();
    renderCallPanel();
    renderIncomingCall();
    renderAdminPanel();
}

async function api(action, options = {}) {
    const method = options.method ?? 'GET';
    const includeInvite = options.includeInvite !== false;
    const payload = { ...(options.payload || {}) };

    if (includeInvite) {
        if (!state.inviteToken) {
            throw new Error('Open the site from an invite link first.');
        }

        if (!('invite_token' in payload)) {
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
        throw new Error(result.error || 'Request failed');
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
    if (messages.length === 0) {
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
    if (state.inviteToken) {
        localStorage.setItem(INVITE_STORAGE_KEY, state.inviteToken);
    }
}

function clearStoredUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
}function adoptInviteToken(token) {
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

function loadAdminKeyFromStorage() {
    const storedKey = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (storedKey) {
        state.adminKey = storedKey;
        dom.adminKeyInput.value = storedKey;
    }
}

async function copyText(value) {
    try {
        await navigator.clipboard.writeText(value);
        setAdminStatus(UI.adminCopyDone);
    } catch {
        setAdminStatus(value);
    }
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

async function loadAdminInvites() {
    if (!state.adminKey) {
        render();
        return;
    }

    state.adminLoading = true;
    state.adminError = '';
    render();

    try {
        const result = await api('admin_invites', {
            method: 'GET',
            payload: { admin_key: state.adminKey },
            includeInvite: false
        });
        state.adminInvites = result.invites;
    } catch (error) {
        state.adminInvites = [];
        state.adminError = error.message;
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        state.adminKey = null;
    } finally {
        state.adminLoading = false;
        render();
    }
}

async function syncState() {
    if (!state.currentUser || state.syncInFlight) {
        return;
    }

    state.syncInFlight = true;

    try {
        const result = await api('sync', {
            method: 'GET',
            payload: {
                user_id: state.currentUser.id,
                conversation_id: state.activeConversation?.id || 0,
                after_message_id: state.activeConversation ? state.lastMessageId : 0
            }
        });

        state.currentUser = result.current_user;
        state.users = result.users;
        mergeConversations(result.conversations);

        if (result.active_conversation) {
            state.activeConversation = result.active_conversation;
            if (state.lastMessageId === 0) {
                state.messages = [];
            }
            upsertMessages(result.messages);
        } else if (!state.activeConversation) {
            state.messages = [];
            state.lastMessageId = 0;
        }

        await processSignals(result.signals);
        render();
    } catch (error) {
        setAuthHint(error.message, true);
        clearStoredUser();
        state.currentUser = null;
        stopSyncLoop();
        render();
    } finally {
        state.syncInFlight = false;
    }
}

function startSyncLoop() {
    stopSyncLoop();
    syncState();
    state.syncTimer = window.setInterval(syncState, 1800);
}

function stopSyncLoop() {
    if (state.syncTimer) {
        window.clearInterval(state.syncTimer);
        state.syncTimer = null;
    }
}

async function loginUser(event) {
    event.preventDefault();

    if (!state.inviteInfo) {
        setAuthHint(UI.needInviteHint, true);
        return;
    }

    try {
        const username = dom.usernameInput.value.trim();
        const result = await api('login', {
            method: 'POST',
            payload: { username }
        });

        state.currentUser = result.user;
        state.inviteInfo = result.invite;
        state.messages = [];
        state.lastMessageId = 0;
        persistSession(result.user);
        setAuthHint(UI.loggedInHint);
        render();
        startSyncLoop();
    } catch (error) {
        setAuthHint(error.message, true);
    }
}

async function restoreSession() {
    const rawUserId = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUserId || !state.inviteToken) {
        render();
        return;
    }

    state.currentUser = { id: Number(rawUserId) };

    try {
        await syncState();
        startSyncLoop();
    } catch {
        clearStoredUser();
        state.currentUser = null;
        render();
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();

    const key = dom.adminKeyInput.value.trim();
    if (!key) {
        setAdminStatus(UI.adminNeedKey, true);
        return;
    }

    state.adminKey = key;
    localStorage.setItem(ADMIN_STORAGE_KEY, key);
    await loadAdminInvites();
}

function handleAdminLogout() {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    state.adminKey = null;
    state.adminInvites = [];
    state.adminError = '';
    dom.adminKeyInput.value = '';
    render();
}

async function handleCreateInvite(event) {
    event.preventDefault();

    if (!state.adminKey) {
        setAdminStatus(UI.adminNeedKey, true);
        return;
    }

    try {
        const result = await api('admin_create_invite', {
            method: 'POST',
            payload: {
                admin_key: state.adminKey,
                note: dom.inviteNoteInput.value.trim()
            },
            includeInvite: false
        });

        state.adminInvites = result.invites;
        dom.inviteNoteInput.value = '';
        render();
        await copyText(result.invite.link);
        setAdminStatus(`${UI.adminCreatedPrefix}${result.invite.link}`);
    } catch (error) {
        setAdminStatus(error.message, true);
    }
}

async function revokeInvite(token) {
    if (!state.adminKey) {
        setAdminStatus(UI.adminNeedKey, true);
        return;
    }

    try {
        const result = await api('admin_revoke_invite', {
            method: 'POST',
            payload: {
                admin_key: state.adminKey,
                invite_token: token
            },
            includeInvite: false
        });

        state.adminInvites = result.invites;
        setAdminStatus(UI.adminRevoked);
        render();
    } catch (error) {
        setAdminStatus(error.message, true);
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
}function cleanupCall(notifyPeer = false, nextState = 'ended') {
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
        setAuthHint(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0447\u0430\u0442\u044C \u0437\u0432\u043E\u043D\u043E\u043A: ${error.message}`, true);
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
        setAuthHint(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u0438\u043D\u044F\u0442\u044C \u0437\u0432\u043E\u043D\u043E\u043A: ${error.message}`, true);
    }
}

async function declineIncomingCall() {
    if (!state.incomingOffer || !state.currentUser) {
        return;
    }

    const offer = state.incomingOffer;
    state.incomingOffer = null;
    state.callState = 'idle';
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
                state.currentCall?.conversationId === signal.conversation_id &&
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
    const urlToken = normalizeInviteToken(new URLSearchParams(window.location.search).get('invite'));
    const storedToken = normalizeInviteToken(localStorage.getItem(INVITE_STORAGE_KEY));

    if (urlToken) {
        adoptInviteToken(urlToken);
        return;
    }

    if (storedToken) {
        state.inviteToken = storedToken;
    }
}

async function initialize() {
    hydrateInviteToken();
    loadAdminKeyFromStorage();
    render();
    await loadInviteStatus();
    await restoreSession();
    await loadAdminInvites();
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
dom.adminLoginForm.addEventListener('submit', handleAdminLogin);
dom.adminLogoutButton.addEventListener('click', handleAdminLogout);
dom.createInviteForm.addEventListener('submit', handleCreateInvite);
window.addEventListener('beforeunload', () => cleanupCall(true));

initialize();