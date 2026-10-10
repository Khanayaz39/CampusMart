// ============================================
// CampusMart — Real-Time Chat Engine
// Full MongoDB Persistence + Socket.IO WebSockets
// ============================================

let socket = null;
let conversations = [];
let activeChatId = null;
let chatUnreadMap = {};

document.addEventListener('DOMContentLoaded', async () => {
    protectPage();

    const currentUser = getUser();
    const token = getToken();

    // 1. DOM Elements
    const chatListContainer = document.getElementById('chat-list');
    const msgContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    const searchInput = document.getElementById('chat-search');
    const activeView = document.getElementById('chat-active-view');
    const emptyView = document.getElementById('chat-empty-view');

    // Attach global click delegation on sidebar chat list for 100% reliable clicking
    if (chatListContainer) {
        chatListContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.chat-item');
            if (item && item.dataset.chatId) {
                selectChat(item.dataset.chatId);
            }
        });
    }

    // 2. Initialize Socket.IO connection
    if (typeof io !== 'undefined') {
        socket = io();

        if (currentUser) {
            socket.emit('setup', currentUser);
        }

        // Listen for incoming private messages in real time
        const handleIncomingMessage = (data) => {
            const msg = data.message || data;
            const conv = data.conversation || msg.conversation;
            const convId = (conv?._id || msg.conversation?._id || msg.conversation || '').toString();

            if (!convId || !msg) return;

            const myId = (currentUser._id || currentUser.id || '').toString();
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender || '').toString();

            // If message was sent by me, do NOT append bubble (already appended when submitting form)
            if (senderId === myId) {
                updateConversationInList(convId, msg);
                return;
            }

            // If user is currently looking at this active conversation
            if (activeChatId && activeChatId.toString() === convId) {
                appendMessageBubble(msg);
                markChatAsRead(convId);
            } else {
                // Incoming message for another chat
                chatUnreadMap[convId] = (chatUnreadMap[convId] || 0) + 1;
                const senderName = msg.sender?.name || 'Campus Peer';
                showToast(`💬 ${senderName}: "${msg.content}"`, 'info');
            }

            // Update conversations list with latest message
            updateConversationInList(convId, msg);

            // Update unread indicator in navbar
            if (typeof updateNavbarUnreadIndicator === 'function') {
                updateNavbarUnreadIndicator();
            }
        };

        socket.on('message received', handleIncomingMessage);

        // Real-time typing indicators
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

        // Listen for peer account deletion in real-time
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

    // 3. Load user's conversations and unread count from MongoDB
    await loadInitialConversations();

    // 4. Render sidebar immediately with loaded chats
    renderSidebar();

    // 5. Handle URL parameters (e.g., clicking "Chat with Seller") or auto-select top chat
    const urlParams = new URLSearchParams(window.location.search);
    const sellerId = urlParams.get('sellerId');
    const sellerName = urlParams.get('seller');
    const productId = urlParams.get('productId');

    if (sellerId && sellerId !== currentUser._id && sellerId !== currentUser.id) {
        // Find or create conversation in MongoDB
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
        // Fallback: look up existing conversation by seller name
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
        // Auto-select the top conversation (sorted: unread first, active first)
        await selectChat(conversations[0]._id);
    } else {
        if (activeView) activeView.style.display = 'none';
        if (emptyView) emptyView.style.display = 'flex';
        renderSidebar();
    }

    // 6. Fetch conversations & unread mapping
    async function loadInitialConversations() {
        try {
            // Fetch unread count & per-chat unread map
            const unreadRes = await fetch(`${API_URL}/chat/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (unreadRes.ok) {
                const unreadData = await unreadRes.json();
                chatUnreadMap = unreadData.chatUnreadMap || {};
            }

            // Fetch conversations
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

    // Sort conversations: Unread first -> Active with messages -> Empty chats -> Latest updated
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

    // Helper: extract the other participant
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

    // ---- Render Sidebar Conversations ----
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
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #EEF2FF; color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; font-size: 1.25rem;">
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

    // ---- Select & Load Active Conversation ----
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

        // Join active conversation room on socket
        if (socket) {
            socket.emit('join chat', activeChatId);
        }

        // Show active view, hide empty view
        if (activeView) activeView.style.display = 'flex';
        if (emptyView) emptyView.style.display = 'none';

        // Update header details
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

        // Toggle message input & send button based on deleted status
        const sendBtn = chatForm ? chatForm.querySelector('button[type="submit"]') : null;
        if (chatInput) {
            if (isDeleted) {
                chatInput.disabled = true;
                chatInput.placeholder = '🚫 User deleted account. You cannot send new messages.';
                chatInput.style.backgroundColor = '#F1F5F9';
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

        // Clear unread badge for this chat locally & notify server
        chatUnreadMap[activeChatId] = 0;
        renderSidebar();
        markChatAsRead(activeChatId);

        // Fetch messages from MongoDB
        await loadMessages(activeChatId);
    }
    window.selectChat = selectChat;

    // ---- Fetch & Render Messages ----
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
                <div style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 0.85rem 1.15rem; border-radius: 12px; margin-bottom: 1rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.06);">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #FEE2E2; color: #DC2626; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
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
                        <div style="width: 44px; height: 44px; border-radius: 50%; background: #F1F5F9; color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem;">
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

            // Check if it's a system notice for user deleted account
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

        // Deduplication check: if message bubble already exists in DOM, do not re-add
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

    // ---- Mark Chat Messages as Read ----
    async function markChatAsRead(chatId) {
        try {
            await fetch(`${API_URL}/chat/${chatId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            chatUnreadMap[chatId] = 0;
            if (typeof updateNavbarUnreadIndicator === 'function') {
                updateNavbarUnreadIndicator();
            }
        } catch (e) {
            // Silent
        }
    }

    // ---- Update Conversation in Sidebar ----
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
            // New conversation arrived, refresh all from backend
            loadInitialConversations().then(() => renderSidebar());
        }
    }

    // ---- Handle Send Message Form Submit ----
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
                // Note: The server automatically dispatches real-time WebSocket delivery to the recipient!
            } else {
                const err = await res.json().catch(() => ({}));
                chatInput.value = text; // restore text so user can edit prohibited words
                showToast(err.message || '🛡️ Message blocked by Campus Safety Moderation.', 'error');
            }
        } catch (err) {
            chatInput.value = text;
            showToast('Network error sending message', 'error');
        }
    });

    // ---- Typing emit ----
    let typingTimer = null;
    chatInput?.addEventListener('input', () => {
        if (!socket || !activeChatId) return;
        socket.emit('typing', activeChatId);

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            socket.emit('stop typing', activeChatId);
        }, 2000);
    });

    // ---- Delete Active Conversation ----
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
                if (typeof updateNavbarUnreadIndicator === 'function') {
                    updateNavbarUnreadIndicator();
                }
            } else {
                showToast('Could not delete conversation', 'error');
            }
        } catch (e) {
            showToast('Network error deleting conversation', 'error');
        }
    }
    window.deleteActiveChat = deleteActiveChat;

    // ---- Search filter in sidebar ----
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

    // Helper: format chat timestamps cleanly
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
});

