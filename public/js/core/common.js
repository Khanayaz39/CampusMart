// --- CampusMart Common Utility Functions + React 18 & Tailwind CSS UI Layer ---
const API_URL = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:'))
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

// Automatically ensure compiled Tailwind CSS is linked in <head>
(function ensureTailwindCss() {
    if (typeof document !== 'undefined' && !document.querySelector('link[href*="tailwind.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/tailwind.css?v=20';
        document.head.appendChild(link);
    }
})();

// --- Auth Helpers ---
function getToken() {
    const token = localStorage.getItem('token');
    return (!token || token === 'undefined' || token === 'null' || !token.trim()) ? null : token;
}

function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null' || !userStr.trim()) return null;
    try { return JSON.parse(userStr); } catch (e) { return null; }
}

function isLoggedIn() {
    return !!getToken() && !!getUser();
}

function logout() {
    ['token', 'user', 'campusmart_user_listings', 'campusmart_listing_status_map', 'campusmart_deleted_listings', 'campusmart_favorites']
        .forEach(k => localStorage.removeItem(k));
    window.location.href = '/login.html';
}

function protectPage() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
}

// --- Format & Escaping Helpers ---
function formatPrice(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function getConditionClass(condition) {
    if (!condition) return 'condition-good';
    const c = condition.toLowerCase();
    if (c.includes('new') && !c.includes('like')) return 'condition-new';
    if (c.includes('like')) return 'condition-like-new';
    if (c.includes('fair')) return 'condition-fair';
    return 'condition-good';
}
window.getConditionClass = getConditionClass;

// --- Toast Notifications ---
function showToast(message, type = 'info') {
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

// --- Global Modal Helpers ---
window.openModal = (id) => document.getElementById(id)?.classList.add('active');
window.closeModal = (id) => document.getElementById(id)?.classList.remove('active');

// --- Avatar Helper ---
function getAvatarUrl(user) {
    if (!user) return 'https://ui-avatars.com/api/?name=Student&background=4F46E5&color=fff';
    if (user.profileImage && user.profileImage.includes('cloudinary.com')) return user.profileImage;
    const name = (user.name && user.name.trim()) ? user.name.trim() : 'Student';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&bold=true`;
}

// --- React 18 Synchronous Render Helper ---
const _reactRoots = new WeakMap();
function renderReactSync(container, element) {
    if (!container || !window.React || !window.ReactDOM) return false;
    try {
        let root = _reactRoots.get(container);
        if (!root && typeof ReactDOM.createRoot === 'function') {
            root = ReactDOM.createRoot(container);
            _reactRoots.set(container, root);
        }
        if (root && typeof ReactDOM.flushSync === 'function') {
            ReactDOM.flushSync(() => root.render(element));
            return true;
        }
    } catch (e) {
        console.warn('React render fallback:', e);
    }
    return false;
}

// --- React 18 Navbar Component + Tailwind CSS ---
function CampusNavbarComponent({ user, isAuth, isAdmin, pathname }) {
    const h = React.createElement;
    const isHome = pathname === '/' || pathname.endsWith('index.html');
    const linkStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.35rem' };

    return h('nav', { className: 'navbar' },
        h('div', { className: 'container' },
            h('a', { href: '/', className: 'logo' }, 'Campus', h('span', null, 'Mart')),
            h('div', { className: 'nav-menu flex items-center' },
                h('div', { className: 'nav-links' },
                    h('a', { href: '/', className: isHome ? 'active' : '', style: linkStyle },
                        h('i', { className: 'fas fa-home' }), h('span', null, 'Home')
                    ),
                    h('a', { href: '/products.html', className: pathname.includes('products') ? 'active' : '', style: linkStyle },
                        h('i', { className: 'fas fa-compass' }), h('span', null, 'Browse')
                    ),
                    h('a', { href: '/create-listing.html', className: pathname.includes('create-listing') ? 'active' : '', style: linkStyle },
                        h('i', { className: 'fas fa-plus-circle' }), h('span', null, 'Sell Item')
                    ),
                    h('a', { href: '/offers.html', className: pathname.includes('offers') ? 'active' : '', style: { ...linkStyle, position: 'relative' } },
                        h('i', { className: 'fas fa-handshake' }),
                        h('span', null, 'Offers'),
                        h('span', { id: 'nav-offers-badge', className: 'nav-unread-pill', style: { display: 'none', background: '#10B981' } }, '0')
                    ),
                    isAuth ? h('a', { href: '/chat.html', className: pathname.includes('chat') ? 'active' : '', style: { ...linkStyle, position: 'relative' } },
                        h('i', { className: 'fas fa-comment-dots' }),
                        h('span', null, 'Messages'),
                        h('span', { id: 'nav-unread-badge', className: 'nav-unread-pill', style: { display: 'none' } }, '0')
                    ) : null,
                    isAdmin ? h('a', { href: '/admin/dashboard.html', className: pathname.includes('admin') ? 'active' : '', style: { ...linkStyle, color: '#DC2626', fontWeight: 700 } },
                        h('i', { className: 'fas fa-shield-alt' }), h('span', null, 'Admin')
                    ) : null
                ),
                h('div', { className: 'nav-auth hidden-mobile', style: { marginLeft: '2rem' } },
                    isAuth ? h('div', { className: 'nav-user' },
                        h('div', { style: { position: 'relative', display: 'inline-block' } },
                            h('img', { src: getAvatarUrl(user), alt: 'Profile', className: 'nav-avatar' }),
                            isAdmin ? h('span', {
                                title: 'Administrator',
                                style: { position: 'absolute', bottom: '-2px', right: '-2px', background: '#EF4444', color: 'white', fontSize: '0.55rem', fontWeight: 800, padding: '1px 4px', borderRadius: '6px', border: '1.5px solid white' }
                            }, 'ADMIN') : null
                        ),
                        h('div', { className: 'dropdown-menu' },
                            isAdmin ? h('a', {
                                href: '/admin/dashboard.html',
                                style: { color: '#DC2626', fontWeight: 700, background: '#FEF2F2', borderBottom: '1px solid #FEE2E2' }
                            }, h('i', { className: 'fas fa-shield-alt fa-fw' }), ' Admin Dashboard') : null,
                            h('a', { href: '/profile.html' }, h('i', { className: 'fas fa-user fa-fw' }), ' My Profile'),
                            h('a', { href: '/my-listings.html' }, h('i', { className: 'fas fa-list fa-fw' }), ' My Listings'),
                            h('a', { href: '/favorites.html' }, h('i', { className: 'fas fa-heart fa-fw' }), ' Favorites'),
                            h('a', { href: '#', onClick: (e) => { e.preventDefault(); logout(); }, className: 'text-danger' },
                                h('i', { className: 'fas fa-sign-out-alt fa-fw' }), ' Logout'
                            )
                        )
                    ) : h(React.Fragment, null,
                        h('a', { href: '/login.html', className: 'btn btn-ghost btn-sm' }, 'Log in'),
                        h('a', { href: '/register.html', className: 'btn btn-primary btn-sm' }, 'Sign up')
                    )
                )
            ),
            h('button', { className: 'hamburger', type: 'button', 'aria-label': 'Menu' },
                h('span'), h('span'), h('span')
            )
        )
    );
}

// --- React 18 Footer Component + Tailwind CSS ---
function CampusFooterComponent() {
    const h = React.createElement;
    return h('footer', { className: 'footer' },
        h('div', { className: 'container' },
            h('div', { className: 'footer-grid' },
                h('div', { className: 'footer-brand' },
                    h('h3', null, 'Campus', h('span', null, 'Mart')),
                    h('p', null, 'The premier marketplace for college students to buy, sell, and connect on campus securely.'),
                    h('div', { className: 'flex gap-2', style: { fontSize: '1.25rem' } },
                        h('a', { href: '#' }, h('i', { className: 'fab fa-twitter' })),
                        h('a', { href: '#' }, h('i', { className: 'fab fa-instagram' })),
                        h('a', { href: '#' }, h('i', { className: 'fab fa-facebook' }))
                    )
                ),
                h('div', null,
                    h('h4', null, 'Quick Links'),
                    h('ul', null,
                        h('li', null, h('a', { href: '/products.html' }, 'Browse Items')),
                        h('li', null, h('a', { href: '/create-listing.html' }, 'Sell an Item')),
                        h('li', null, h('a', { href: '/login.html' }, 'Sign In')),
                        h('li', null, h('a', { href: '#' }, 'Help Center'))
                    )
                ),
                h('div', null,
                    h('h4', null, 'Categories'),
                    h('ul', null,
                        h('li', null, h('a', { href: '/products.html?category=books' }, 'Textbooks')),
                        h('li', null, h('a', { href: '/products.html?category=electronics' }, 'Electronics')),
                        h('li', null, h('a', { href: '/products.html?category=furniture' }, 'Furniture')),
                        h('li', null, h('a', { href: '/products.html?category=clothing' }, 'Clothing'))
                    )
                ),
                h('div', null,
                    h('h4', null, 'Legal'),
                    h('ul', null,
                        h('li', null, h('a', { href: '#' }, 'Terms of Service')),
                        h('li', null, h('a', { href: '#' }, 'Privacy Policy')),
                        h('li', null, h('a', { href: '#' }, 'Safety Guidelines'))
                    )
                )
            ),
            h('div', { className: 'footer-bottom' },
                h('p', null, `\u00A9 ${new Date().getFullYear()} CampusMart. All rights reserved.`),
                h('p', null, 'Made for students, by students.')
            )
        )
    );
}

function injectNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return;

    const user = getUser();
    const isAuth = isLoggedIn();
    const isAdmin = Boolean(user && (user.role === 'admin' || user.isAdmin === true));
    const pathname = window.location.pathname;

    const renderedViaReact = (window.CampusReact && window.CampusReact.mountNavbar(navContainer, {
        user,
        isAuth,
        isAdmin,
        pathname,
        getAvatarUrl,
        onLogout: logout
    })) || (window.React && window.ReactDOM && renderReactSync(
        navContainer,
        React.createElement(CampusNavbarComponent, { user, isAuth, isAdmin, pathname })
    ));

    if (!renderedViaReact) {
        const authHTML = isAuth ? `
            <div class="nav-user">
                <div style="position: relative; display: inline-block;">
                    <img src="${getAvatarUrl(user)}" alt="Profile" class="nav-avatar">
                    ${isAdmin ? `<span title="Administrator" style="position: absolute; bottom: -2px; right: -2px; background: #EF4444; color: white; font-size: 0.55rem; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white;">ADMIN</span>` : ''}
                </div>
                <div class="dropdown-menu">
                    ${isAdmin ? `<a href="/admin/dashboard.html" style="color: #DC2626; font-weight: 700; background: #FEF2F2; border-bottom: 1px solid #FEE2E2;"><i class="fas fa-shield-alt fa-fw"></i> Admin Dashboard</a>` : ''}
                    <a href="/profile.html"><i class="fas fa-user fa-fw"></i> My Profile</a>
                    <a href="/my-listings.html"><i class="fas fa-list fa-fw"></i> My Listings</a>
                    <a href="/favorites.html"><i class="fas fa-heart fa-fw"></i> Favorites</a>
                    <a href="#" onclick="logout(); return false;" class="text-danger"><i class="fas fa-sign-out-alt fa-fw"></i> Logout</a>
                </div>
            </div>
        ` : `<a href="/login.html" class="btn btn-ghost btn-sm">Log in</a><a href="/register.html" class="btn btn-primary btn-sm">Sign up</a>`;

        navContainer.innerHTML = `
            <nav class="navbar">
                <div class="container">
                    <a href="/" class="logo">Campus<span>Mart</span></a>
                    <div class="nav-menu flex items-center">
                        <div class="nav-links">
                            <a href="/" class="${pathname === '/' || pathname.endsWith('index.html') ? 'active' : ''}" style="display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fas fa-home"></i><span>Home</span></a>
                            <a href="/products.html" class="${pathname.includes('products') ? 'active' : ''}" style="display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fas fa-compass"></i><span>Browse</span></a>
                            <a href="/create-listing.html" class="${pathname.includes('create-listing') ? 'active' : ''}" style="display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fas fa-plus-circle"></i><span>Sell Item</span></a>
                            <a href="/offers.html" class="${pathname.includes('offers') ? 'active' : ''}" style="position: relative; display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fas fa-handshake"></i><span>Offers</span><span id="nav-offers-badge" class="nav-unread-pill" style="display: none; background: #10B981;">0</span></a>
                            ${isAuth ? `<a href="/chat.html" class="${pathname.includes('chat') ? 'active' : ''}" style="position: relative; display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fas fa-comment-dots"></i><span>Messages</span><span id="nav-unread-badge" class="nav-unread-pill" style="display: none;">0</span></a>` : ''}
                            ${isAdmin ? `<a href="/admin/dashboard.html" class="${pathname.includes('admin') ? 'active' : ''}" style="color: #DC2626; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fas fa-shield-alt"></i> <span>Admin</span></a>` : ''}
                        </div>
                        <div class="nav-auth hidden-mobile" style="margin-left: 2rem;">${authHTML}</div>
                    </div>
                    <button class="hamburger"><span></span><span></span><span></span></button>
                </div>
            </nav>
        `;
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

function injectFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    const renderedViaReact = (window.CampusReact && window.CampusReact.mountFooter(footerContainer)) || (window.React && window.ReactDOM && renderReactSync(
        footerContainer,
        React.createElement(CampusFooterComponent)
    ));

    if (!renderedViaReact) {
        footerContainer.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <h3>Campus<span>Mart</span></h3>
                            <p>The premier marketplace for college students to buy, sell, and connect on campus securely.</p>
                            <div class="flex gap-2" style="font-size: 1.25rem;">
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-facebook"></i></a>
                            </div>
                        </div>
                        <div><h4>Quick Links</h4><ul><li><a href="/products.html">Browse Items</a></li><li><a href="/create-listing.html">Sell an Item</a></li><li><a href="/login.html">Sign In</a></li><li><a href="#">Help Center</a></li></ul></div>
                        <div><h4>Categories</h4><ul><li><a href="/products.html?category=books">Textbooks</a></li><li><a href="/products.html?category=electronics">Electronics</a></li><li><a href="/products.html?category=furniture">Furniture</a></li><li><a href="/products.html?category=clothing">Clothing</a></li></ul></div>
                        <div><h4>Legal</h4><ul><li><a href="#">Terms of Service</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Safety Guidelines</a></li></ul></div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; ${new Date().getFullYear()} CampusMart. All rights reserved.</p>
                        <p>Made for students, by students.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

function initScrollReveal() {
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

async function syncUserProfile() {
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

function setBadgeElementCount(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
        el.innerText = count > 99 ? '99+' : count;
        el.style.display = 'inline-block';
    } else {
        el.style.display = 'none';
    }
}

async function updateNavbarUnreadIndicator() {
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
window.updateNavbarUnreadIndicator = updateNavbarUnreadIndicator;

document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
    initScrollReveal();
    syncUserProfile();
    updateNavbarUnreadIndicator();

    if (isLoggedIn()) {
        setInterval(updateNavbarUnreadIndicator, 10000);
        window.addEventListener('focus', updateNavbarUnreadIndicator);
    }
});

// === Persistent Favorites Management ===
function getFavoriteIds() {
    try {
        const parsed = JSON.parse(localStorage.getItem('campusmart_favorites') || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function isProductFavorited(id) {
    return id ? getFavoriteIds().includes(String(id)) : false;
}

async function toggleProductFavorite(id) {
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

// Shared Favorite Button Click Handler (used across Home, Browse, etc.)
async function toggleFavorite(event, productId, btn) {
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
window.toggleFavorite = toggleFavorite;

// Shared Product Card HTML Builder (used across Home, Browse, Favorites)
function createProductCardHTML(product, i = 0, options = {}) {
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
window.createProductCardHTML = createProductCardHTML;

// Shared Admin Pagination & Range Slider Builder (used for both Users & Listings in Admin Dashboard)
function buildAdminPaginationHTML({ totalItems, perPage, currentPage, pageFnName, sliderId }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startIdx = (safePage - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, totalItems);

    if (totalItems <= perPage) return '';

    return `
        <div class="flex items-center justify-between" style="padding: 1rem 1.25rem; background: #F8FAFC; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 1rem;">
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
window.buildAdminPaginationHTML = buildAdminPaginationHTML;

// === Shared UPI QR Code Decoder (used across profile.js and offers.js) ===
async function decodeSellerQrImage(imageUrl) {
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
            if (typeof jsQR === 'function') {
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
                    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
                    if (code && code.data) return resolve(code.data);
                }
            }
            resolve(null);
        };
        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
}
window.decodeSellerQrImage = decodeSellerQrImage;
window.decodeUpiFromQrImage = decodeSellerQrImage;

function extractVpaFromQrString(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    const trimmed = rawText.trim();
    const paMatch = trimmed.match(/[?&]pa=([^&\s]+)/i);
    if (paMatch && paMatch[1]) return decodeURIComponent(paMatch[1]).trim();
    if (/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed)) return trimmed;
    return '';
}
window.extractVpaFromQrString = extractVpaFromQrString;

function parseUpiQrData(rawQrText) {
    const upiId = extractVpaFromQrString(rawQrText);
    if (!upiId) return null;
    const trimmed = String(rawQrText).trim();
    const pnMatch = trimmed.match(/[?&]pn=([^&\s]+)/i);
    const payeeName = pnMatch && pnMatch[1] ? decodeURIComponent(pnMatch[1]).trim() : '';
    return { upiId, payeeName, rawUri: trimmed.startsWith('upi://') ? trimmed : `upi://pay?pa=${upiId}` };
}
window.parseUpiQrData = parseUpiQrData;

// === User Listings Shared Management ===
function getSavedStatusMap() {
    try { return JSON.parse(localStorage.getItem('campusmart_listing_status_map') || '{}'); } catch (e) { return {}; }
}

function getRelistTimestamps() {
    try { return JSON.parse(localStorage.getItem('campusmart_relist_timestamps') || '{}'); } catch (e) { return {}; }
}

function saveRelistTimestamp(id) {
    const map = getRelistTimestamps();
    map[String(id)] = new Date().toISOString();
    localStorage.setItem('campusmart_relist_timestamps', JSON.stringify(map));
}

function saveItemStatus(id, status) {
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

function getDeletedListings() {
    try { return JSON.parse(localStorage.getItem('campusmart_deleted_listings') || '[]'); } catch (e) { return []; }
}

function addDeletedListing(id) {
    const list = getDeletedListings();
    const idStr = String(id);
    if (!list.includes(idStr)) {
        list.push(idStr);
        localStorage.setItem('campusmart_deleted_listings', JSON.stringify(list));
    }
}

const GLOBAL_PROFANITY_REGEX = /\b(fuck\w*|motherfuck\w*|mf\b|shit\w*|bullshit|bitch\w*|bastard\w*|asshole\w*|cunt\w*|dickhead\w*|prick\w*|whore\w*|slut\w*|faggot\w*|nigger\w*|nigga\w*|madarchod\w*|maderchod\w*|bhenchod\w*|behenchod\w*|bhen\s*ke\s*lod\w*|bkl\b|bsdk\b|bhosad\w*|bhosd\w*|chutiy\w*|chootiy\w*|gaand\b|gandu\w*|gaandu\w*|lund\w*|lodu\w*|lauda\w*|lawda\w*|harami\w*|kameena\w*|kamina\w*|randi\w*|raand\w*|kutte\b|tatte\w*|jhant\w*|jhaant\w*)\b/i;

function getLocalUserListings() {
    try {
        const raw = JSON.parse(localStorage.getItem('campusmart_user_listings') || '[]');
        return raw.filter(item => !GLOBAL_PROFANITY_REGEX.test(item.title || '') && !GLOBAL_PROFANITY_REGEX.test(item.description || ''));
    } catch (e) { return []; }
}

function saveLocalUserListing(item) {
    if (!item || GLOBAL_PROFANITY_REGEX.test(item.title || '') || GLOBAL_PROFANITY_REGEX.test(item.description || '')) return;
    const list = getLocalUserListings();
    item._id = String(item._id || item.id || ('local_' + Date.now()));
    list.unshift(item);
    localStorage.setItem('campusmart_user_listings', JSON.stringify(list));
}

function getInitialDemoListings() { return []; }

window.getSavedStatusMap = getSavedStatusMap;
window.saveItemStatus = saveItemStatus;
window.getDeletedListings = getDeletedListings;
window.addDeletedListing = addDeletedListing;
window.getRelistTimestamps = getRelistTimestamps;
window.saveRelistTimestamp = saveRelistTimestamp;
window.getLocalUserListings = getLocalUserListings;
window.getInitialDemoListings = getInitialDemoListings;

async function getUserListings() {
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
