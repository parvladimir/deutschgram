const UI = {
    needKey: 'Введите admin key, чтобы управлять приглашениями.',
    loading: 'Загружаю приглашения...',
    ready: 'Админка готова. Можно создавать новые invite-ссылки.',
    empty: 'Приглашений пока нет.',
    copied: 'Ссылка скопирована.',
    personalPending: 'Появится после первого входа.',
    active: 'Активно',
    claimed: 'Закреплено',
    revoked: 'Отключено',
    neverUsed: 'ещё не использовалось',
    lastUsedPrefix: 'последний вход: ',
    createdPrefix: 'Приглашение создано: ',
    revokedText: 'Приглашение отключено.'
};

const ADMIN_STORAGE_KEY = 'deutschgram-admin-key';
const API_BASE = (window.DEUTSCHGRAM_ADMIN_CONFIG && window.DEUTSCHGRAM_ADMIN_CONFIG.apiBase) || '../api/index.php';

const state = {
    adminKey: '',
    invites: [],
    loading: false,
    error: ''
};

const dom = {
    adminLoginForm: document.getElementById('adminLoginForm'),
    adminKeyInput: document.getElementById('adminKeyInput'),
    adminLogoutButton: document.getElementById('adminLogoutButton'),
    adminStatusText: document.getElementById('adminStatusText'),
    createInviteForm: document.getElementById('createInviteForm'),
    inviteNoteInput: document.getElementById('inviteNoteInput'),
    createInviteButton: document.getElementById('createInviteButton'),
    adminInvitesList: document.getElementById('adminInvitesList'),
    inviteRowTemplate: document.getElementById('inviteRowTemplate')
};

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

function setStatus(message, isError = false) {
    dom.adminStatusText.textContent = message;
    dom.adminStatusText.style.color = isError ? '#ffb9ae' : '';
}

async function api(action, options = {}) {
    const method = options.method || 'GET';
    const payload = { ...(options.payload || {}) };
    let url = `${API_BASE}?action=${encodeURIComponent(action)}`;
    const fetchOptions = { method, headers: {} };

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

async function copyText(value) {
    try {
        await navigator.clipboard.writeText(value);
        setStatus(UI.copied);
    } catch {
        setStatus(value);
    }
}

function renderLink(container, url, fallbackText = '') {
    container.innerHTML = '';

    if (!url) {
        container.textContent = fallbackText;
        return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    link.className = 'invite-link-anchor';
    container.appendChild(link);
}

function renderInvites() {
    if (!state.adminKey) {
        dom.adminInvitesList.className = 'stack-list empty-list';
        dom.adminInvitesList.textContent = UI.needKey;
        return;
    }

    if (state.loading) {
        dom.adminInvitesList.className = 'stack-list empty-list';
        dom.adminInvitesList.textContent = UI.loading;
        return;
    }

    if (state.invites.length === 0) {
        dom.adminInvitesList.className = 'stack-list empty-list';
        dom.adminInvitesList.textContent = UI.empty;
        return;
    }

    dom.adminInvitesList.className = 'stack-list';
    dom.adminInvitesList.innerHTML = '';

    state.invites.forEach((invite) => {
        const fragment = dom.inviteRowTemplate.content.cloneNode(true);
        const title = fragment.querySelector('.invite-item-title');
        const meta = fragment.querySelector('.invite-item-meta');
        const status = fragment.querySelector('.invite-item-status');
        const inviteLink = fragment.querySelector('.invite-link-primary');
        const personalLink = fragment.querySelector('.invite-link-personal');
        const copyInviteButton = fragment.querySelector('.copy-invite-button');
        const copyPersonalButton = fragment.querySelector('.copy-personal-button');
        const revokeButton = fragment.querySelector('.revoke-invite-button');

        title.textContent = invite.note || (invite.assigned_username ? `@${invite.assigned_username}` : 'Invite');

        const metaParts = [];
        if (invite.assigned_username) {
            metaParts.push(`@${invite.assigned_username}`);
        }
        metaParts.push(invite.last_used_at ? `${UI.lastUsedPrefix}${formatDateTime(invite.last_used_at)}` : UI.neverUsed);
        meta.textContent = metaParts.join(' · ');

        renderLink(inviteLink, invite.link);
        renderLink(personalLink, invite.path_link, UI.personalPending);

        if (invite.revoked_at) {
            status.textContent = UI.revoked;
            status.className = 'status-pill offline';
            revokeButton.disabled = true;
        } else if (invite.is_claimed) {
            status.textContent = UI.claimed;
            status.className = 'status-pill online';
        } else {
            status.textContent = UI.active;
            status.className = 'status-pill online';
        }

        copyInviteButton.addEventListener('click', () => copyText(invite.link));
        copyPersonalButton.disabled = !invite.path_link;
        copyPersonalButton.addEventListener('click', () => {
            if (invite.path_link) {
                copyText(invite.path_link);
            }
        });
        revokeButton.addEventListener('click', () => revokeInvite(invite.token));
        dom.adminInvitesList.appendChild(fragment);
    });
}

function render() {
    const hasAdmin = Boolean(state.adminKey);
    dom.adminLogoutButton.classList.toggle('hidden', !hasAdmin);
    dom.createInviteButton.disabled = !hasAdmin || state.loading;
    dom.inviteNoteInput.disabled = !hasAdmin || state.loading;

    if (!hasAdmin) {
        setStatus(state.error || UI.needKey, Boolean(state.error));
    } else if (state.loading) {
        setStatus(UI.loading);
    } else if (state.error) {
        setStatus(state.error, true);
    } else {
        setStatus(UI.ready);
    }

    renderInvites();
}

async function loadInvites() {
    if (!state.adminKey) {
        render();
        return;
    }

    state.loading = true;
    state.error = '';
    render();

    try {
        const result = await api('admin_invites', {
            method: 'GET',
            payload: { admin_key: state.adminKey }
        });
        state.invites = result.invites;
    } catch (error) {
        state.invites = [];
        state.error = error.message;
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        state.adminKey = '';
    } finally {
        state.loading = false;
        render();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const key = dom.adminKeyInput.value.trim();
    if (!key) {
        setStatus(UI.needKey, true);
        return;
    }

    state.adminKey = key;
    state.error = '';
    localStorage.setItem(ADMIN_STORAGE_KEY, key);
    await loadInvites();
}

function handleLogout() {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    state.adminKey = '';
    state.invites = [];
    state.error = '';
    dom.adminKeyInput.value = '';
    render();
}

async function handleCreateInvite(event) {
    event.preventDefault();
    if (!state.adminKey) {
        setStatus(UI.needKey, true);
        return;
    }

    try {
        const result = await api('admin_create_invite', {
            method: 'POST',
            payload: {
                admin_key: state.adminKey,
                note: dom.inviteNoteInput.value.trim()
            }
        });
        state.invites = result.invites;
        dom.inviteNoteInput.value = '';
        render();
        await copyText(result.invite.link);
        setStatus(`${UI.createdPrefix}${result.invite.link}`);
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function revokeInvite(token) {
    if (!state.adminKey) {
        setStatus(UI.needKey, true);
        return;
    }

    try {
        const result = await api('admin_revoke_invite', {
            method: 'POST',
            payload: {
                admin_key: state.adminKey,
                invite_token: token
            }
        });
        state.invites = result.invites;
        setStatus(UI.revokedText);
        render();
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function initialize() {
    const storedKey = localStorage.getItem(ADMIN_STORAGE_KEY) || '';
    if (storedKey) {
        state.adminKey = storedKey;
        dom.adminKeyInput.value = storedKey;
    }

    render();
    if (state.adminKey) {
        await loadInvites();
    }
}

dom.adminLoginForm.addEventListener('submit', handleLogin);
dom.adminLogoutButton.addEventListener('click', handleLogout);
dom.createInviteForm.addEventListener('submit', handleCreateInvite);

initialize();