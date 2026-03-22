const state = {
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
};

const dom = {
    loginForm: document.getElementById('loginForm'),
    displayNameInput: document.getElementById('displayNameInput'),
    usernameInput: document.getElementById('usernameInput'),
    authHint: document.getElementById('authHint'),
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
};

const STORAGE_KEY = 'deutschgram-user-id';
const SIGNAL_API = 'api/index.php';
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

async function api(action, options = {}) {
    const method = options.method ?? 'GET';
    const payload = options.payload ?? null;
    let url = `${SIGNAL_API}?action=${encodeURIComponent(action)}`;
    const fetchOptions = {
        method,
        headers: {},
    };

    if (method === 'GET' && payload) {
        const search = new URLSearchParams(payload);
        url += `&${search.toString()}`;
    }

    if (method !== 'GET') {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify({ action, ...(payload || {}) });
    }

    const response = await fetch(url, fetchOptions);
    const result = await response.json();

    if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Request failed');
    }

    return result;
}

function formatTime(dateString) {
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function relativePresence(user) {
    return user.is_online ? 'online' : 'offline';
}

function findConversationById(conversationId) {
    return state.conversations.find((conversation) => conversation.id === conversationId) || null;
}

function setAuthHint(message, isError = false) {
    dom.authHint.textContent = message;
    dom.authHint.style.color = isError ? '#ffb9ae' : '';
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
            <span>${state.currentUser.is_online ? 'online' : 'idle'}</span>
        </div>
    `;
}

function renderUsers() {
    if (!state.currentUser || !state.currentUser.display_name) {
        dom.usersList.className = 'stack-list empty-list';
        dom.usersList.textContent = 'Sign in first.';
        return;
    }

    if (state.users.length === 0) {
        dom.usersList.className = 'stack-list empty-list';
        dom.usersList.textContent = 'Other people will appear here after they open the site.';
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
        dom.conversationsList.textContent = 'Chats will appear after sign in.';
        return;
    }

    if (state.conversations.length === 0) {
        dom.conversationsList.className = 'stack-list empty-list';
        dom.conversationsList.textContent = 'Open a chat from the people list.';
        return;
    }

    dom.conversationsList.className = 'stack-list';
    dom.conversationsList.innerHTML = '';

    state.conversations.forEach((conversation) => {
        const button = document.createElement('button');
        button.type = 'button';
        const isActive = state.activeConversation && state.activeConversation.id === conversation.id;
        button.className = `conversation-item${isActive ? ' active' : ''}`;
        const preview = conversation.last_message
            ? escapeHtml(conversation.last_message.body.slice(0, 58))
            : 'New chat without messages';
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
        dom.chatHeader.querySelector('h2').textContent = 'Messages';
        dom.chatHeader.querySelector('.eyebrow').textContent = 'choose a chat';
        return;
    }

    dom.chatHeader.querySelector('h2').textContent = activeConversation.peer.display_name;
    dom.chatHeader.querySelector('.eyebrow').textContent = activeConversation.peer.is_online
        ? 'person is online now'
        : 'person is offline now';
}

function renderMessages() {
    if (!state.activeConversation) {
        dom.messagesPanel.className = 'panel messages-panel empty-state';
        dom.messagesPanel.textContent = 'Choose a person on the left to open chat and start a call.';
        return;
    }

    if (state.messages.length === 0) {
        dom.messagesPanel.className = 'panel messages-panel empty-state';
        dom.messagesPanel.textContent = 'No messages yet. Start the conversation first.';
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
        meta.textContent = `${message.sender_display_name} • ${formatTime(message.created_at)}`;
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
        idle: 'Call has not started yet.',
        calling: `Calling ${peerName}...`,
        ringing: `${peerName} is calling you.`,
        connecting: `Connecting to ${peerName}...`,
        in_call_audio: `Audio call with ${peerName} is active.`,
        in_call_video: `Video call with ${peerName} is active.`,
        ended: 'Call ended.',
        failed: 'Could not connect the call.',
    };

    dom.callStateText.textContent = labelMap[state.callState] || 'Call has not started yet.';
    const inCall = ['calling', 'connecting', 'in_call_audio', 'in_call_video', 'ringing'].includes(state.callState);
    dom.hangupButton.disabled = !inCall;
    dom.muteButton.disabled = !state.localStream;
    dom.cameraButton.disabled = !state.localStream || state.currentCall?.mode !== 'video';
    dom.muteButton.textContent = state.isMuted ? 'Unmute mic' : 'Mic';
    dom.cameraButton.textContent = state.isCameraEnabled ? 'Camera' : 'Turn camera on';
}

function renderIncomingCall() {
    if (!state.incomingOffer) {
        dom.incomingCallModal.classList.add('hidden');
        return;
    }

    dom.incomingCallModal.classList.remove('hidden');
    const modeText = state.incomingOffer.payload.mode === 'video' ? 'video call' : 'audio call';
    dom.incomingCallTitle.textContent = `${state.incomingOffer.sender_display_name} is calling`;
    dom.incomingCallText.textContent = `Incoming ${modeText}. Accept?`;
}

function render() {
    renderCurrentUser();
    renderUsers();
    renderConversations();
    renderChatHeader();
    renderMessages();
    renderCallPanel();
    renderIncomingCall();
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
                after_message_id: state.activeConversation ? state.lastMessageId : 0,
            },
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

async function registerUser(event) {
    event.preventDefault();

    try {
        const displayName = dom.displayNameInput.value.trim();
        const username = dom.usernameInput.value.trim() || displayName;

        const result = await api('register', {
            method: 'POST',
            payload: {
                display_name: displayName,
                username,
            },
        });

        state.currentUser = result.user;
        localStorage.setItem(STORAGE_KEY, String(result.user.id));
        state.messages = [];
        state.lastMessageId = 0;
        setAuthHint('Profile saved. You can open a chat now.');
        render();
        startSyncLoop();
    } catch (error) {
        setAuthHint(error.message, true);
    }
}

async function restoreSession() {
    const rawUserId = localStorage.getItem(STORAGE_KEY);
    if (!rawUserId) {
        render();
        return;
    }

    state.currentUser = { id: Number(rawUserId) };

    try {
        await syncState();
        startSyncLoop();
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        state.currentUser = null;
        render();
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
                peer_user_id: peerUserId,
            },
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
                body,
            },
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
        video: mode === 'video',
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
                payload: { mode: currentCall.mode },
            },
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
                payload: { candidate: event.candidate.toJSON() },
            },
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
            direction: 'outgoing',
        };
        const peerConnection = await createPeerConnection(call);
        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: mode === 'video',
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
                    description: peerConnection.localDescription.toJSON(),
                },
            },
        });
    } catch (error) {
        cleanupCall(false, 'failed');
        setAuthHint(`Could not start call: ${error.message}`, true);
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
            direction: 'incoming',
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
                    description: peerConnection.localDescription.toJSON(),
                },
            },
        });
    } catch (error) {
        cleanupCall(false, 'failed');
        setAuthHint(`Could not accept call: ${error.message}`, true);
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
                payload: { mode: offer.payload.mode },
            },
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
                        payload: { mode: signal.payload.mode },
                    },
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

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

dom.loginForm.addEventListener('submit', registerUser);
dom.messageForm.addEventListener('submit', handleSendMessage);
dom.audioCallButton.addEventListener('click', () => startCall('audio'));
dom.videoCallButton.addEventListener('click', () => startCall('video'));
dom.acceptCallButton.addEventListener('click', acceptIncomingCall);
dom.declineCallButton.addEventListener('click', declineIncomingCall);
dom.hangupButton.addEventListener('click', () => cleanupCall(true));
dom.muteButton.addEventListener('click', toggleMute);
dom.cameraButton.addEventListener('click', toggleCamera);
window.addEventListener('beforeunload', () => cleanupCall(true));

render();
restoreSession();
