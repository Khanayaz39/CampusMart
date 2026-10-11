import { useEffect } from 'react';
import {
    API_URL,
    initCommonLayout,
    protectPage,
    getUser,
    getToken,
    showToast,
    updateNavbarUnreadIndicator,
    getAvatarUrl,
    escapeHtml
} from '../utils/common.js';

let socket = null;
let conversations = [];
let activeChatId = null;
let chatUnreadMap = {};

export function useChat() {
    useEffect(() => {
        initCommonLayout();
        protectPage();
        initChatPage();
    }, []);
}

async function initChatPage() {
    const currentUser = getUser();
    const token = getToken();
    if (!currentUser || !token) return;

    const chatListContainer = document.getElementById('chat-list');
    const msgContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    const searchInput = document.getElementById('chat-search');
    const activeView = document.getElementById('chat-active-view');
    const emptyView = document.getElementById('chat-empty-view');

    if (chatListContainer) {
        chatListContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.chat-item');
            if (item && item.dataset.chatId) {
                selectChat(item.dataset.chatId);
            }
        });
    }

    if (typeof window.io !== 'undefined') {
        socket = window.io();

        if (currentUser) {
            socket.emit('setup', currentUser);
        }

        const handleIncomingMessage = (data) => {
            const msg = data.message || data;
            const conv = data.conversation || msg.conversation;
            const convId = (conv?._id || msg.conversation?._id || msg.conversation || '').toString();

            if (!convId || !msg) return;

            const myId = (currentUser._id || currentUser.id || '').toString();
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender || '').toString();

            if (senderId === myId) {
                updateConversationInList(convId, msg);
                return;
            }

            if (activeChatId && activeChatId.toString() === convId) {
                appendMessageBubble(msg);
                markChatAsRead(convId);
            } else {
                chatUnreadMap[convId] = (chatUnreadMap[convId] || 0) + 1;
                const senderName = msg.sender?.name || 'Campus Peer';
                showToast(`💬 ${senderName}: "${msg.content}"`, 'info');
            }

            updateConversationInList(convId, msg);
            updateNavbarUnreadIndicator();
        };

        socket.on('message received', handleIncomingMessage);

        const statusEl = document.getElementById('active-chat-status');

        socket.on('typing', () => {
            if (statusEl && activeChatId) {
                statusEl.innerHTML = '<span style="color: var(--primary); font-weight: 600;"><i class="fas fa-ellipsis-h fa-fade"></i> typing...</span>';
            }
        });

        socket.on('stop typing', () => {
            if (statusEl && activeChatId) {
                const chat = conversations.find(c => (c._id || '').toString() === activeChatId.toString());
                const other = getOtherParticipant(chat);
                if (other?.isDeleted || other?.name === 'Deleted User') {
                    statusEl.innerText = 'User deleted account • Inactive';
                } else if (other?.role === 'admin') {
                    statusEl.innerText = 'Campus Administrator • Official Support';
                } else {
                    statusEl.innerText = other?.hostel ? `${other.hostel} • ${other.department || 'Student'}` : (other?.department || 'Verified Student');
                }
            }
        });

        socket.on('user deleted', (data) => {
            const deletedUserId = (data?.deletedUserId || '').toString();
            const deletedChatId = (data?.chatId || '').toString();

            conversations.forEach(c => {
                const other = getOtherParticipant(c);
                const otherId = (other?._id || other?.id || other || '').toString();
                if ((deletedChatId && (c._id || '').toString() === deletedChatId) ||
                    (deletedUserId && otherId === deletedUserId)) {
                    if (other && typeof other === 'object') {
                        other.isDeleted = true;
                        other.name = 'Deleted User';
                        other.profileImage = 'https://ui-avatars.com/api/?name=Deleted+User&background=94A3B8&color=fff';
                    }
                    c.lastMessage = {
                        content: '🚫 [User deleted account]',
                        createdAt: new Date().toISOString()
                    };
                    c.updatedAt = new Date().toISOString();
                }
            });

            sortConversations();
            renderSidebar();

            if (activeChatId && (
                (deletedChatId && activeChatId.toString() === deletedChatId) ||
                conversations.find(c => (c._id || '').toString() === activeChatId)?.participants?.some(p => (p._id || p.id || p).toString() === deletedUserId)
            )) {
                selectChat(activeChatId);
                showToast('⚠️ The student in this chat has deleted their account.', 'warning');
            }
        });
    }

    await loadInitialConversations();
    renderSidebar();

    const urlParams = new URLSearchParams(window.location.search);
    const sellerId = urlParams.get('sellerId');
    const sellerName = urlParams.get('seller');
    const productId = urlParams.get('productId');

    if (sellerId && sellerId !== currentUser._id && sellerId !== currentUser.id) {
        try {
            const res = await fetch(`${API_URL}/chat/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: sellerId,
                    productId: productId || undefined
                })
            });

            if (res.ok) {
                const targetChat = await res.json();
                const existingIdx = conversations.findIndex(c => (c._id || '').toString() === (targetChat._id || '').toString());
                if (existingIdx !== -1) {
                    conversations[existingIdx] = targetChat;
                } else {
                    conversations.unshift(targetChat);
                }
                sortConversations();
                renderSidebar();
                await selectChat(targetChat._id);
            }
        } catch (e) {
            console.warn('Error starting conversation:', e);
        }
    } else if (sellerName) {
        const match = conversations.find(c => {
            const other = getOtherParticipant(c);
            return other && other.name.toLowerCase() === sellerName.toLowerCase().trim();
        });
        if (match) {
            await selectChat(match._id);
        } else if (conversations.length > 0) {
            await selectChat(conversations[0]._id);
        }
    } else if (conversations.length > 0) {
        await selectChat(conversations[0]._id);
    } else {
        if (activeView) activeView.style.display = 'none';
        if (emptyView) emptyView.style.display = 'flex';
        renderSidebar();
    }

    async function loadInitialConversations() {
        try {
            const unreadRes = await fetch(`${API_URL}/chat/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (unreadRes.ok) {
                const unreadData = await unreadRes.json();
                chatUnreadMap = unreadData.chatUnreadMap || {};
            }

            const res = await fetch(`${API_URL}/chat/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                conversations = await res.json();
                sortConversations();
            }
        } catch (err) {
            console.warn('Could not load conversations from server:', err);
        }
    }

    function sortConversations() {
        conversations.sort((a, b) => {
            const unreadA = chatUnreadMap[a._id] || 0;
            const unreadB = chatUnreadMap[b._id] || 0;
            if (unreadA !== unreadB) return unreadB - unreadA;

            const hasMsgA = !!(a.lastMessage && (a.lastMessage.content || a.lastMessage._id));
            const hasMsgB = !!(b.lastMessage && (b.lastMessage.content || b.lastMessage._id));
            if (hasMsgA !== hasMsgB) return hasMsgB ? 1 : -1;

            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });
    }

    function getOtherParticipant(chat) {
        if (!chat || !chat.participants) return null;
        const myId = (currentUser._id || currentUser.id || '').toString();
        const other = chat.participants.find(p => (p._id || p.id || p).toString() !== myId) || chat.participants[0];
        if (other && typeof other === 'object') {
            if (other.isDeleted || other.name === 'Deleted User') {
                other.isDeleted = true;
                other.name = 'Deleted User';
                other.profileImage = 'https://ui-avatars.com/api/?name=Deleted+User&background=94A3B8&color=fff';
            }
        }
        return other;
    }

    function renderSidebar(list = conversations) {
        if (!chatListContainer) return;

        const totalUnreadEl = document.getElementById('total-unread');
        const totalUnread = Object.values(chatUnreadMap).reduce((a, b) => a + b, 0);
        if (totalUnreadEl) {
            totalUnreadEl.innerText = totalUnread > 0 ? `${totalUnread} Unread` : 'Chats';
            totalUnreadEl.className = totalUnread > 0 ? 'badge badge-danger' : 'badge badge-primary';
        }

        if (list.length === 0) {
            chatListContainer.innerHTML = `
                <div class="empty-state" style="padding: 2.5rem 1rem; text-align: center;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; font-size: 1.25rem;">
                        <i class="far fa-comment-dots"></i>
                    </div>
                    <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">No chats yet</h4>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
                        Tap "Chat with Seller" on any item to message a campus peer.
                    </p>
                    <a href="/products.html" class="btn btn-outline btn-sm" style="font-size: 0.75rem;">
                        <i class="fas fa-search mr-1"></i> Browse Listings
                    </a>
                </div>
            `;
            return;
        }

        chatListContainer.innerHTML = list.map(c => {
            const other = getOtherParticipant(c) || { name: 'Campus Student' };
            const isDeleted = other.isDeleted || other.name === 'Deleted User';
            const isAdmin = other.role === 'admin' && !isDeleted;
            const avatarUrl = isDeleted
                ? 'https://ui-avatars.com/api/?name=Deleted+User&background=94A3B8&color=fff'
                : (other.profileImage || getAvatarUrl(other));
            const unreadCount = chatUnreadMap[c._id] || 0;
            let lastMsgContent = c.lastMessage?.content || 'Started conversation';
            if (isDeleted && (lastMsgContent.includes('User deleted account') || !c.lastMessage)) {
                lastMsgContent = '🚫 User deleted account';
            }
            const timeStr = c.updatedAt ? formatChatTime(c.updatedAt) : '';
            const isActive = activeChatId && (c._id || '').toString() === activeChatId.toString();

            return `
                <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${c._id}" onclick="window.selectChat('${c._id}')">
                    <img src="${avatarUrl}" class="chat-item-avatar" alt="${escapeHtml(other.name)}">
                    <div class="chat-item-body">
                        <div class="chat-item-top">
                            <span class="chat-item-name" style="display: flex; align-items: center; gap: 0.35rem;">
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${isDeleted ? 'color: var(--text-secondary); font-style: italic;' : ''}">${escapeHtml(other.name)}</span>
                                ${isAdmin ? `<span class="badge badge-danger" style="font-size: 0.62rem; padding: 0.12rem 0.45rem; display: inline-flex; align-items: center; gap: 0.2rem; flex-shrink: 0; font-weight: 700; border-radius: 4px;"><i class="fas fa-shield-alt"></i> Admin</span>` : ''}
                                ${isDeleted ? `<span class="badge" style="font-size: 0.62rem; padding: 0.12rem 0.45rem; background: #FEE2E2; color: #DC2626; border-radius: 4px; font-weight: 700; flex-shrink: 0;"><i class="fas fa-user-slash"></i> Deleted</span>` : ''}
                            </span>
                            <span class="chat-item-time">${timeStr}</span>
                        </div>
                        <div class="chat-item-bottom">
                            <span class="chat-item-msg" style="${isDeleted ? 'color: #DC2626; font-weight: 500;' : ''}">${escapeHtml(lastMsgContent)}</span>
                            ${unreadCount > 0 ? `<span class="chat-unread-badge">${unreadCount}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function selectChat(chatId) {
        if (!chatId) return;
        activeChatId = chatId.toString();
        const chat = conversations.find(c => (c._id || '').toString() === activeChatId);

        if (!chat) {
            if (activeView) activeView.style.display = 'none';
            if (emptyView) emptyView.style.display = 'flex';
            renderSidebar();
            return;
        }

        if (socket) {
            socket.emit('join chat', activeChatId);
        }

        if (activeView) activeView.style.display = 'flex';
        if (emptyView) emptyView.style.display = 'none';

        const other = getOtherParticipant(chat) || { name: 'Campus Student' };
        const isDeleted = other.isDeleted || other.name === 'Deleted User';
        const avatarEl = document.getElementById('active-chat-avatar');
        if (avatarEl) {
            avatarEl.src = isDeleted
                ? 'https://ui-avatars.com/api/?name=Deleted+User&background=94A3B8&color=fff'
                : (other.profileImage || getAvatarUrl(other));
        }

        const nameEl = document.getElementById('active-chat-name');
        if (nameEl) {
            const isAdmin = other.role === 'admin' && !isDeleted;
            nameEl.innerHTML = `
                <span style="vertical-align: middle; ${isDeleted ? 'color: var(--text-secondary); font-style: italic;' : ''}">${escapeHtml(other.name || 'Campus Student')}</span>
                ${isAdmin ? `<span class="badge badge-danger" style="font-size: 0.72rem; padding: 0.18rem 0.55rem; margin-left: 0.45rem; vertical-align: middle; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 700; border-radius: 6px;"><i class="fas fa-shield-alt"></i> Admin</span>` : ''}
                ${isDeleted ? `<span class="badge" style="background: #FEE2E2; color: #DC2626; font-size: 0.72rem; padding: 0.18rem 0.55rem; margin-left: 0.45rem; vertical-align: middle; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 700; border-radius: 6px;"><i class="fas fa-user-slash"></i> User Deleted Account</span>` : ''}
            `;
        }

        const statusEl = document.getElementById('active-chat-status');
        const statusDot = statusEl ? statusEl.previousElementSibling : null;
        if (statusEl) {
            if (isDeleted) {
                statusEl.innerText = 'User deleted account • Inactive';
                if (statusDot) statusDot.style.background = '#94A3B8';
            } else if (other.role === 'admin') {
                statusEl.innerText = 'Campus Administrator • Official Support';
                if (statusDot) statusDot.style.background = 'var(--success)';
            } else {
                statusEl.innerText = other.hostel ? `${other.hostel} • ${other.department || 'Student'}` : (other.department || 'Verified Student');
                if (statusDot) statusDot.style.background = 'var(--success)';
            }
        }

        const badgeEl = document.getElementById('active-chat-item-badge');
        if (badgeEl) {
            if (chat.product && chat.product.title && !isDeleted) {
                badgeEl.style.display = 'inline-block';
                badgeEl.innerHTML = `<i class="fas fa-tag mr-1"></i> ${escapeHtml(chat.product.title)}`;
            } else {
                badgeEl.style.display = 'none';
            }
        }

        const sendBtn = chatForm ? chatForm.querySelector('button[type="submit"]') : null;
        if (chatInput) {
            if (isDeleted) {
                chatInput.disabled = true;
                chatInput.placeholder = '🚫 User deleted account. You cannot send new messages.';
                chatInput.style.backgroundColor = 'var(--surface)';
                chatInput.style.cursor = 'not-allowed';
                if (sendBtn) {
                    sendBtn.disabled = true;
                    sendBtn.style.opacity = '0.4';
                    sendBtn.style.cursor = 'not-allowed';
                }
            } else {
                chatInput.disabled = false;
                chatInput.placeholder = 'Type a message to arrange campus meetup...';
                chatInput.style.backgroundColor = '';
                chatInput.style.cursor = '';
                if (sendBtn) {
                    sendBtn.disabled = false;
                    sendBtn.style.opacity = '1';
                    sendBtn.style.cursor = 'pointer';
                }
            }
        }

        chatUnreadMap[activeChatId] = 0;
        renderSidebar();
        markChatAsRead(activeChatId);
        await loadMessages(activeChatId);
    }
    window.selectChat = selectChat;

    async function loadMessages(chatId) {
        if (!msgContainer) return;
        msgContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-primary"></i> Loading messages...</div>';

        try {
            const res = await fetch(`${API_URL}/chat/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const messages = await res.json();
                renderMessagesList(messages);
            } else {
                msgContainer.innerHTML = '<div class="text-center py-4 text-secondary">Unable to load messages.</div>';
            }
        } catch (e) {
            msgContainer.innerHTML = '<div class="text-center py-4 text-secondary">Network error loading messages.</div>';
        }
    }

    function renderMessagesList(messages) {
        if (!msgContainer) return;

        const activeChat = conversations.find(c => (c._id || '').toString() === activeChatId);
        const other = getOtherParticipant(activeChat);
        const isDeleted = other && (other.isDeleted || other.name === 'Deleted User');

        let html = '';

        if (isDeleted) {
            html += `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--danger); padding: 0.85rem 1.15rem; border-radius: 12px; margin-bottom: 1rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); color: #DC2626; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                        <i class="fas fa-user-slash"></i>
                    </div>
                    <div>
                        <strong style="display: block; font-size: 0.9rem; margin-bottom: 0.15rem;">User deleted account</strong>
                        This student has permanently deleted their account. All their listed products have been removed from the campus marketplace, and further messages cannot be sent.
                    </div>
                </div>
            `;
        }

        if (!messages || messages.length === 0) {
            if (!isDeleted) {
                html += `
                    <div class="text-center py-4" style="color: var(--text-secondary); font-size: 0.85rem;">
                        <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem;">
                            <i class="far fa-paper-plane"></i>
                        </div>
                        Start the campus meetup conversation by typing a message below!
                    </div>
                `;
            }
            msgContainer.innerHTML = html;
            return;
        }

        const myId = (currentUser._id || currentUser.id || '').toString();

        html += messages.map(m => {
            const senderId = (m.sender?._id || m.sender?.id || m.sender || '').toString();
            const isMe = senderId === myId;
            const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            if (m.content && m.content.includes('User deleted account')) {
                return `
                    <div class="system-message text-center my-3" style="width: 100%; display: flex; justify-content: center;">
                        <span style="font-size: 0.8rem; color: #991B1B; background: #FEE2E2; padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid #FCA5A5; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem;">
                            <i class="fas fa-ban"></i> User deleted account
                        </span>
                    </div>
                `;
            }

            return `
                <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}" data-msg-id="${m._id || ''}">
                    ${escapeHtml(m.content)}
                    <div class="message-time">${timeStr}</div>
                </div>
            `;
        }).join('');

        msgContainer.innerHTML = html;
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function appendMessageBubble(m) {
        if (!msgContainer || !m) return;

        if (m._id) {
            const existing = msgContainer.querySelector(`[data-msg-id="${m._id}"]`);
            if (existing) return;
        }

        const myId = (currentUser._id || currentUser.id || '').toString();
        const senderId = (m.sender?._id || m.sender?.id || m.sender || '').toString();
        const isMe = senderId === myId;
        const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const emptyPlaceholder = msgContainer.querySelector('.text-center');
        if (emptyPlaceholder) emptyPlaceholder.remove();

        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${isMe ? 'message-sent' : 'message-received'}`;
        if (m._id) bubble.setAttribute('data-msg-id', m._id.toString());
        bubble.innerHTML = `
            ${escapeHtml(m.content)}
            <div class="message-time">${timeStr}</div>
        `;

        msgContainer.appendChild(bubble);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    async function markChatAsRead(chatId) {
        try {
            await fetch(`${API_URL}/chat/${chatId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            chatUnreadMap[chatId] = 0;
            updateNavbarUnreadIndicator();
        } catch (e) {}
    }

    function updateConversationInList(convId, newMsg) {
        const convIndex = conversations.findIndex(c => (c._id || '').toString() === convId.toString());
        if (convIndex !== -1) {
            const conv = conversations[convIndex];
            conv.lastMessage = {
                content: newMsg.content,
                createdAt: newMsg.createdAt || new Date().toISOString()
            };
            conv.updatedAt = new Date().toISOString();
            sortConversations();
            renderSidebar();
        } else {
            loadInitialConversations().then(() => renderSidebar());
        }
    }

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput?.value?.trim();
        if (!text || !activeChatId) return;

        const activeChat = conversations.find(c => (c._id || '').toString() === activeChatId);
        const other = getOtherParticipant(activeChat);
        if (other && (other.isDeleted || other.name === 'Deleted User')) {
            showToast('🚫 This user has deleted their account. You cannot send messages.', 'error');
            return;
        }

        const PROFANITY_PATTERN = /\b(fuck\w*|motherfuck\w*|mf\b|shit\w*|bullshit|bitch\w*|bastard\w*|asshole\w*|cunt\w*|dickhead\w*|prick\w*|whore\w*|slut\w*|faggot\w*|nigger\w*|nigga\w*|madarchod\w*|maderchod\w*|bhenchod\w*|behenchod\w*|bhen\s*ke\s*lod\w*|bkl\b|bsdk\b|bhosad\w*|bhosd\w*|chutiy\w*|chootiy\w*|gaand\b|gandu\w*|gaandu\w*|lund\w*|lodu\w*|lauda\w*|lawda\w*|harami\w*|kameena\w*|kamina\w*|randi\w*|raand\w*|kutte\b|tatte\w*|jhant\w*|jhaant\w*)\b/i;

        if (PROFANITY_PATTERN.test(text)) {
            showToast('🛡️ Message blocked: Profanity and abusive language are strictly prohibited.', 'error');
            return;
        }

        chatInput.value = '';

        if (socket) {
            socket.emit('stop typing', activeChatId);
        }

        try {
            const res = await fetch(`${API_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chatId: activeChatId,
                    content: text
                })
            });

            if (res.ok) {
                const message = await res.json();
                appendMessageBubble(message);
                updateConversationInList(activeChatId, message);
            } else {
                const err = await res.json().catch(() => ({}));
                chatInput.value = text;
                showToast(err.message || '🛡️ Message blocked by Campus Safety Moderation.', 'error');
            }
        } catch (err) {
            chatInput.value = text;
            showToast('Network error sending message', 'error');
        }
    });

    let typingTimer = null;
    chatInput?.addEventListener('input', () => {
        if (!socket || !activeChatId) return;
        socket.emit('typing', activeChatId);

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            socket.emit('stop typing', activeChatId);
        }, 2000);
    });

    async function deleteActiveChat() {
        if (!activeChatId) return;
        if (!confirm('Are you sure you want to delete this conversation and its messages?')) return;

        try {
            const res = await fetch(`${API_URL}/chat/${activeChatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                conversations = conversations.filter(c => (c._id || '').toString() !== activeChatId.toString());
                delete chatUnreadMap[activeChatId];
                activeChatId = null;

                if (conversations.length > 0) {
                    await selectChat(conversations[0]._id);
                } else {
                    if (activeView) activeView.style.display = 'none';
                    if (emptyView) emptyView.style.display = 'flex';
                    renderSidebar();
                }

                showToast('Conversation deleted', 'info');
                updateNavbarUnreadIndicator();
            } else {
                showToast('Could not delete conversation', 'error');
            }
        } catch (e) {
            showToast('Network error deleting conversation', 'error');
        }
    }
    window.deleteActiveChat = deleteActiveChat;

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            renderSidebar();
            return;
        }

        const filtered = conversations.filter(c => {
            const other = getOtherParticipant(c);
            const name = (other?.name || '').toLowerCase();
            const title = (c.product?.title || '').toLowerCase();
            const msg = (c.lastMessage?.content || '').toLowerCase();
            return name.includes(query) || title.includes(query) || msg.includes(query);
        });

        renderSidebar(filtered);
    });

    function formatChatTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}
