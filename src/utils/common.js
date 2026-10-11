import React from 'react';

export const API_URL = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:'))
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

// --- Theme Helpers (Light / Dark Mode) ---
export function getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('campusmart_theme', isDark ? 'dark' : 'light');

    document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
        icon.className = isDark ? 'fas fa-sun text-amber-400' : 'fas fa-moon';
    });
    window.dispatchEvent(new CustomEvent('campusmart-theme-change', { detail: { theme: isDark ? 'dark' : 'light' } }));
}

export function toggleTheme() {
    const nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
}

// --- Auth Helpers ---
export function getToken() {
    const token = localStorage.getItem('token');
    return (!token || token === 'undefined' || token === 'null' || !token.trim()) ? null : token;
}

export function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null' || !userStr.trim()) return null;
    try { return JSON.parse(userStr); } catch (e) { return null; }
}

export function isLoggedIn() {
    return !!getToken() && !!getUser();
}

export function logout() {
    ['token', 'user', 'campusmart_user_listings', 'campusmart_listing_status_map', 'campusmart_deleted_listings', 'campusmart_favorites']
        .forEach(k => localStorage.removeItem(k));
    window.location.href = '/login.html';
}

export function protectPage() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
}

// --- Format & Escaping Helpers ---
export function formatPrice(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function getConditionClass(condition) {
    if (!condition) return 'condition-good';
    const c = condition.toLowerCase();
    if (c.includes('new') && !c.includes('like')) return 'condition-new';
    if (c.includes('like')) return 'condition-like-new';
    if (c.includes('fair')) return 'condition-fair';
    if (c.includes('poor')) return 'condition-poor';
    return 'condition-good';
}

// --- Toast Notifications ---
export function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const typeClasses = { success: 'toast-success', error: 'toast-error', warning: 'toast-warning', info: 'toast-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${typeClasses[type] || 'toast-info'}`;
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
}

export const openModal = (id) => document.getElementById(id)?.classList.add('active');
export const closeModal = (id) => document.getElementById(id)?.classList.remove('active');

// --- Avatar Helper ---
export function getAvatarUrl(user) {
    if (!user) return 'https://ui-avatars.com/api/?name=Student&background=27272A&color=fff';
    if (user.profileImage && user.profileImage.includes('cloudinary.com')) return user.profileImage;
    const name = (user.name && user.name.trim()) ? user.name.trim() : 'Student';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=27272A&color=fff&bold=true`;
}

export function injectNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return;

    const user = getUser();
    const isAuth = isLoggedIn();
    const isAdmin = Boolean(user && (user.role === 'admin' || user.isAdmin === true));
    const pathname = window.location.pathname;

    if (window.CampusReact && window.CampusReact.mountNavbar) {
        window.CampusReact.mountNavbar(navContainer, {
            user,
            isAuth,
            isAdmin,
            pathname,
            getAvatarUrl,
            onLogout: logout
        });
    }

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
    });

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.onclick = () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        };
    }
}

export function injectFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    if (window.CampusReact && window.CampusReact.mountFooter) {
        window.CampusReact.mountFooter(footerContainer);
    }
}

export function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

export async function syncUserProfile() {
    const token = getToken();
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const freshUser = await res.json();
            if (freshUser && freshUser.role) {
                const currentUser = getUser() || {};
                if (currentUser.role !== freshUser.role || currentUser.isVerified !== freshUser.isVerified) {
                    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...freshUser }));
                    injectNavbar();
                }
            }
        }
    } catch (e) {}
}

export function setBadgeElementCount(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
        el.innerText = count > 99 ? '99+' : count;
        el.style.display = 'inline-block';
    } else {
        el.style.display = 'none';
    }
}

export async function updateNavbarUnreadIndicator() {
    const token = getToken();
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/chat/unread-count`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            const count = data.unreadCount || 0;
            setBadgeElementCount('nav-unread-badge', count);
            setBadgeElementCount('dropdown-unread-badge', count);
        }

        const offerRes = await fetch(`${API_URL}/offers/received`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (offerRes.ok) {
            const receivedOffers = await offerRes.json();
            if (Array.isArray(receivedOffers)) {
                const pendingCount = receivedOffers.filter(o => o.status === 'pending').length;
                setBadgeElementCount('nav-offers-badge', pendingCount);
                setBadgeElementCount('dropdown-offers-badge', pendingCount);
            }
        }
    } catch (e) {}
}

let badgeIntervalId = null;

export function initCommonLayout() {
    injectNavbar();
    injectFooter();
    initScrollReveal();
    syncUserProfile();
    updateNavbarUnreadIndicator();

    if (isLoggedIn() && !badgeIntervalId) {
        badgeIntervalId = setInterval(updateNavbarUnreadIndicator, 10000);
        window.addEventListener('focus', updateNavbarUnreadIndicator);
    }
}

// === Persistent Favorites Management ===
export function getFavoriteIds() {
    try {
        const parsed = JSON.parse(localStorage.getItem('campusmart_favorites') || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

export function isProductFavorited(id) {
    return id ? getFavoriteIds().includes(String(id)) : false;
}

export async function toggleProductFavorite(id) {
    if (!id) return false;
    let favs = getFavoriteIds();
    const idStr = String(id);
    const isAdded = !favs.includes(idStr);
    favs = isAdded ? [...favs, idStr] : favs.filter(item => item !== idStr);
    localStorage.setItem('campusmart_favorites', JSON.stringify(favs));

    if (isLoggedIn() && idStr.length === 24) {
        try {
            await fetch(`${API_URL}/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ productId: idStr })
            });
        } catch (err) {
            console.warn('Could not sync favorite to backend:', err);
        }
    }
    return isAdded;
}

export async function toggleFavorite(event, productId, btn) {
    event.stopPropagation();
    const targetBtn = btn || event.currentTarget;
    const isAdded = await toggleProductFavorite(productId);
    if (targetBtn) {
        const icon = targetBtn.querySelector('i');
        targetBtn.classList.toggle('active', isAdded);
        if (icon) icon.className = isAdded ? 'fas fa-heart text-danger' : 'far fa-heart';
    }
    showToast(isAdded ? 'Saved to Favorites' : 'Removed from Favorites', isAdded ? 'success' : 'info');
}

export function createProductCardHTML(product, i = 0, options = {}) {
    const id = product._id || product.id;
    const conditionClass = getConditionClass(product.condition);
    const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/400x300?text=No+Image';
    const isFav = options.forceFavorited ? true : isProductFavorited(id);
    const favAction = options.favHandlerName || 'toggleFavorite';
    const favTitle = options.favTitle || (isFav ? 'Remove from Saved' : 'Save to Favorites');
    const cardIdAttr = options.includeCardId ? `id="fav-card-${id}"` : '';

    return `
        <div class="product-card stagger-${(i % 5) + 1} animate-fade-in-up" ${cardIdAttr} onclick="window.location.href='/product-detail.html?id=${id}'">
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${escapeHtml(product.title)}" class="product-image" loading="lazy">
                <span class="product-badge badge-primary">${escapeHtml(product.category || 'NEW')}</span>
                <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="${favAction}(event, '${id}', this)" title="${favTitle}">
                    <i class="${isFav ? 'fas fa-heart text-danger' : 'far fa-heart'}"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${escapeHtml(product.title)}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-meta">
                    <span class="condition-badge ${conditionClass}">${escapeHtml(product.condition || 'Used')}</span>
                    <span><i class="fas fa-clock mr-1"></i> ${formatDate(product.createdAt || new Date())}</span>
                </div>
            </div>
        </div>
    `;
}

export function buildAdminPaginationHTML({ totalItems, perPage, currentPage, pageFnName, sliderId }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startIdx = (safePage - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, totalItems);

    if (totalItems <= perPage) return '';

    return `
        <div class="flex items-center justify-between" style="padding: 1rem 1.25rem; background: var(--surface); border-top: 1px solid var(--border); flex-wrap: wrap; gap: 1rem;">
            <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">
                Showing <strong style="color: var(--text-primary);">${startIdx + 1}–${endIdx}</strong> of <strong style="color: var(--text-primary);">${totalItems}</strong>
            </div>
            <div class="flex items-center gap-3" style="flex: 1; max-width: 380px; min-width: 240px;">
                <button class="btn btn-outline btn-sm" ${safePage <= 1 ? 'disabled style="opacity:0.45; cursor:not-allowed;"' : ''} onclick="window.${pageFnName}(${safePage - 1})">
                    <i class="fas fa-chevron-left"></i> Prev
                </button>
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                    <input
                        type="range"
                        id="${sliderId}"
                        min="1"
                        max="${totalPages}"
                        value="${safePage}"
                        step="1"
                        style="width: 100%; accent-color: var(--primary); cursor: pointer; height: 6px;"
                        oninput="window.${pageFnName}(Number(this.value))"
                        title="Slide to switch page"
                    >
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">
                        Page ${safePage} of ${totalPages}
                    </span>
                </div>
                <button class="btn btn-outline btn-sm" ${safePage >= totalPages ? 'disabled style="opacity:0.45; cursor:not-allowed;"' : ''} onclick="window.${pageFnName}(${safePage + 1})">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
}

// === Shared UPI QR Code Decoder ===
export async function decodeSellerQrImage(imageUrl) {
    return new Promise((resolve) => {
        if (!imageUrl) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = async () => {
            if ('BarcodeDetector' in window) {
                try {
                    const detector = new BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(img);
                    if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                        return resolve(barcodes[0].rawValue);
                    }
                } catch (e) {}
            }
            if (typeof window.jsQR === 'function') {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const tryRegions = [
                    { sx: 0, sy: 0, sw: img.width, sh: img.height, maxDim: 800 },
                    { sx: 0, sy: 0, sw: img.width, sh: img.height, maxDim: 1200 },
                    { sx: 0, sy: 0, sw: img.width, sh: img.height, maxDim: 500 },
                    { sx: img.width * 0.1, sy: img.height * 0.15, sw: img.width * 0.8, sh: img.height * 0.65, maxDim: 800 },
                    { sx: img.width * 0.15, sy: img.height * 0.2, sw: img.width * 0.7, sh: img.height * 0.55, maxDim: 800 }
                ];
                for (const reg of tryRegions) {
                    const scale = Math.min(1, reg.maxDim / Math.max(reg.sw, reg.sh));
                    const w = Math.max(1, Math.floor(reg.sw * scale));
                    const h = Math.max(1, Math.floor(reg.sh * scale));
                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(img, reg.sx, reg.sy, reg.sw, reg.sh, 0, 0, w, h);
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const code = window.jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
                    if (code && code.data) return resolve(code.data);
                }
            }
            resolve(null);
        };
        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
}

export const decodeUpiFromQrImage = decodeSellerQrImage;

export function extractVpaFromQrString(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    const trimmed = rawText.trim();
    const paMatch = trimmed.match(/[?&]pa=([^&\s]+)/i);
    if (paMatch && paMatch[1]) return decodeURIComponent(paMatch[1]).trim();
    if (/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed)) return trimmed;
    return '';
}

export function parseUpiQrData(rawQrText) {
    const upiId = extractVpaFromQrString(rawQrText);
    if (!upiId) return null;
    const trimmed = String(rawQrText).trim();
    const pnMatch = trimmed.match(/[?&]pn=([^&\s]+)/i);
    const payeeName = pnMatch && pnMatch[1] ? decodeURIComponent(pnMatch[1]).trim() : '';
    return { upiId, payeeName, rawUri: trimmed.startsWith('upi://') ? trimmed : `upi://pay?pa=${upiId}` };
}

// === User Listings Shared Management ===
export function getSavedStatusMap() {
    try { return JSON.parse(localStorage.getItem('campusmart_listing_status_map') || '{}'); } catch (e) { return {}; }
}

export function getRelistTimestamps() {
    try { return JSON.parse(localStorage.getItem('campusmart_relist_timestamps') || '{}'); } catch (e) { return {}; }
}

export function saveRelistTimestamp(id) {
    const map = getRelistTimestamps();
    map[String(id)] = new Date().toISOString();
    localStorage.setItem('campusmart_relist_timestamps', JSON.stringify(map));
}

export function saveItemStatus(id, status) {
    const map = getSavedStatusMap();
    map[String(id)] = status;
    localStorage.setItem('campusmart_listing_status_map', JSON.stringify(map));
    if (status === 'available') saveRelistTimestamp(id);

    try {
        const localList = JSON.parse(localStorage.getItem('campusmart_user_listings') || '[]');
        let modified = false;
        localList.forEach(item => {
            if (String(item._id || item.id) === String(id)) {
                item.status = status;
                if (status === 'available') item.updatedAt = new Date().toISOString();
                modified = true;
            }
        });
        if (modified) localStorage.setItem('campusmart_user_listings', JSON.stringify(localList));
    } catch (e) {}
}

export function getDeletedListings() {
    try { return JSON.parse(localStorage.getItem('campusmart_deleted_listings') || '[]'); } catch (e) { return []; }
}

export function addDeletedListing(id) {
    const list = getDeletedListings();
    const idStr = String(id);
    if (!list.includes(idStr)) {
        list.push(idStr);
        localStorage.setItem('campusmart_deleted_listings', JSON.stringify(list));
    }
}

export const GLOBAL_PROFANITY_REGEX = /\b(fuck\w*|motherfuck\w*|mf\b|shit\w*|bullshit|bitch\w*|bastard\w*|asshole\w*|cunt\w*|dickhead\w*|prick\w*|whore\w*|slut\w*|faggot\w*|nigger\w*|nigga\w*|madarchod\w*|maderchod\w*|bhenchod\w*|behenchod\w*|bhen\s*ke\s*lod\w*|bkl\b|bsdk\b|bhosad\w*|bhosd\w*|chutiy\w*|chootiy\w*|gaand\b|gandu\w*|gaandu\w*|lund\w*|lodu\w*|lauda\w*|lawda\w*|harami\w*|kameena\w*|kamina\w*|randi\w*|raand\w*|kutte\b|tatte\w*|jhant\w*|jhaant\w*)\b/i;

export function getLocalUserListings() {
    try {
        const raw = JSON.parse(localStorage.getItem('campusmart_user_listings') || '[]');
        return raw.filter(item => !GLOBAL_PROFANITY_REGEX.test(item.title || '') && !GLOBAL_PROFANITY_REGEX.test(item.description || ''));
    } catch (e) { return []; }
}

export function saveLocalUserListing(item) {
    if (!item || GLOBAL_PROFANITY_REGEX.test(item.title || '') || GLOBAL_PROFANITY_REGEX.test(item.description || '')) return;
    const list = getLocalUserListings();
    item._id = String(item._id || item.id || ('local_' + Date.now()));
    list.unshift(item);
    localStorage.setItem('campusmart_user_listings', JSON.stringify(list));
}

export function getInitialDemoListings() { return []; }

export async function getUserListings() {
    let listings = [];
    const token = getToken();
    const currentUser = getUser();
    const currentUserId = currentUser ? String(currentUser._id || currentUser.id || '') : '';

    if (token) {
        try {
            const res = await fetch(`${API_URL}/products/my-products`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const apiListings = await res.json();
                if (Array.isArray(apiListings)) listings = apiListings;
            }
        } catch (e) { console.warn('Could not fetch listings from backend:', e); }
    }

    if (currentUserId) {
        const existingIds = new Set(listings.map(l => String(l._id || l.id)));
        for (const item of getLocalUserListings()) {
            const itemSellerId = String(item.seller?._id || item.seller || '');
            const id = String(item._id || item.id);
            if (itemSellerId === currentUserId && !existingIds.has(id)) {
                listings.unshift(item);
                existingIds.add(id);
            }
        }
    }

    const statusMap = getSavedStatusMap();
    const deletedListings = getDeletedListings();
    return listings
        .filter(item => !deletedListings.includes(String(item._id || item.id)))
        .map(item => {
            const id = String(item._id || item.id);
            if (statusMap[id]) item.status = statusMap[id];
            return item;
        });
}

// Expose shared utilities on window for global accessibility
if (typeof window !== 'undefined') {
    Object.assign(window, {
        API_URL,
        getTheme,
        applyTheme,
        toggleTheme,
        getToken,
        getUser,
        isLoggedIn,
        logout,
        protectPage,
        formatPrice,
        formatDate,
        escapeHtml,
        getConditionClass,
        showToast,
        openModal,
        closeModal,
        getAvatarUrl,
        injectNavbar,
        injectFooter,
        initScrollReveal,
        syncUserProfile,
        updateNavbarUnreadIndicator,
        getFavoriteIds,
        isProductFavorited,
        toggleProductFavorite,
        toggleFavorite,
        createProductCardHTML,
        buildAdminPaginationHTML,
        decodeSellerQrImage,
        decodeUpiFromQrImage,
        extractVpaFromQrString,
        parseUpiQrData,
        getSavedStatusMap,
        getRelistTimestamps,
        saveRelistTimestamp,
        saveItemStatus,
        getDeletedListings,
        addDeletedListing,
        GLOBAL_PROFANITY_REGEX,
        getLocalUserListings,
        saveLocalUserListing,
        getInitialDemoListings,
        getUserListings
    });
}
