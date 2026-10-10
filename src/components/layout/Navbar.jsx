import React, { useState, useEffect } from 'react';

export default function Navbar({ user, isAuth, isAdmin, pathname = '/', getAvatarUrl, onLogout }) {
    const isHome = pathname === '/' || pathname.endsWith('index.html');
    const linkClass = 'inline-flex items-center gap-1.5';
    const avatarSrc = typeof getAvatarUrl === 'function'
        ? getAvatarUrl(user)
        : 'https://ui-avatars.com/api/?name=Student&background=27272A&color=fff&bold=true';

    const [isDark, setIsDark] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const syncThemeState = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        window.addEventListener('campusmart-theme-change', syncThemeState);
        return () => window.removeEventListener('campusmart-theme-change', syncThemeState);
    }, []);

    const handleThemeToggle = () => {
        if (typeof window.toggleTheme === 'function') {
            window.toggleTheme();
        } else {
            const nextDark = !document.documentElement.classList.contains('dark');
            document.documentElement.classList.toggle('dark', nextDark);
            localStorage.setItem('campusmart_theme', nextDark ? 'dark' : 'light');
            setIsDark(nextDark);
        }
    };

    return (
        <nav className="navbar antialiased">
            <div className="container">
                <a href="/" className="logo">
                    Campus<span>Mart</span>
                </a>

                <div className="nav-menu flex items-center">
                    <div className="nav-links">
                        <a href="/" className={`${linkClass} ${isHome ? 'active' : ''}`}>
                            <i className="fas fa-home"></i>
                            <span>Home</span>
                        </a>

                        <a href="/products.html" className={`${linkClass} ${pathname.includes('products') ? 'active' : ''}`}>
                            <i className="fas fa-compass"></i>
                            <span>Browse</span>
                        </a>

                        <a href="/create-listing.html" className={`${linkClass} ${pathname.includes('create-listing') ? 'active' : ''}`}>
                            <i className="fas fa-plus-circle"></i>
                            <span>Sell Item</span>
                        </a>

                        <a
                            href="/offers.html"
                            className={`${linkClass} relative ${pathname.includes('offers') ? 'active' : ''}`}
                        >
                            <i className="fas fa-handshake"></i>
                            <span>Offers</span>
                            <span
                                id="nav-offers-badge"
                                className="nav-unread-pill !bg-emerald-600"
                                style={{ display: 'none' }}
                            >
                                0
                            </span>
                        </a>

                        {isAuth && (
                            <a
                                href="/chat.html"
                                className={`${linkClass} relative ${pathname.includes('chat') ? 'active' : ''}`}
                            >
                                <i className="fas fa-comment-dots"></i>
                                <span>Messages</span>
                                <span
                                    id="nav-unread-badge"
                                    className="nav-unread-pill"
                                    style={{ display: 'none' }}
                                >
                                    0
                                </span>
                            </a>
                        )}

                        {isAdmin && (
                            <a
                                href="/admin/dashboard.html"
                                className={`${linkClass} !text-red-500 !font-bold ${pathname.includes('admin') ? 'active' : ''}`}
                            >
                                <i className="fas fa-shield-alt"></i>
                                <span>Admin</span>
                            </a>
                        )}
                    </div>

                    <div className="nav-auth hidden-mobile ml-8">
                        <button
                            type="button"
                            onClick={handleThemeToggle}
                            className="theme-toggle-btn"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle Dark Mode"
                        >
                            <i key={isDark ? 'sun' : 'moon'} className={isDark ? 'fas fa-sun text-amber-400' : 'fas fa-moon'}></i>
                        </button>

                        {isAuth ? (
                            <div className="nav-user">
                                <div className="relative inline-block">
                                    <img src={avatarSrc} alt="Profile" className="nav-avatar" />
                                    {isAdmin && (
                                        <span
                                            title="Administrator"
                                            className="absolute -bottom-0.5 -right-0.5 bg-danger text-white text-[0.55rem] font-extrabold px-1 py-px rounded-[6px] border-[1.5px] border-white"
                                        >
                                            ADMIN
                                        </span>
                                    )}
                                </div>

                                <div className="dropdown-menu">
                                    {isAdmin && (
                                        <a
                                            href="/admin/dashboard.html"
                                            className="!text-red-500 !font-bold border-b border-border"
                                        >
                                            <i className="fas fa-shield-alt fa-fw"></i> Admin Dashboard
                                        </a>
                                    )}
                                    <a href="/profile.html">
                                        <i className="fas fa-user fa-fw"></i> My Profile
                                    </a>
                                    <a href="/my-listings.html">
                                        <i className="fas fa-list fa-fw"></i> My Listings
                                    </a>
                                    <a href="/favorites.html">
                                        <i className="fas fa-heart fa-fw"></i> Favorites
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (typeof onLogout === 'function') onLogout();
                                        }}
                                        className="text-danger"
                                    >
                                        <i className="fas fa-sign-out-alt fa-fw"></i> Logout
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <>
                                <a href="/login.html" className="btn btn-ghost btn-sm">
                                    Log in
                                </a>
                                <a href="/register.html" className="btn btn-primary btn-sm">
                                    Sign up
                                </a>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2.5 md:hidden">
                    <button
                        type="button"
                        onClick={handleThemeToggle}
                        className="theme-toggle-btn"
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle Dark Mode"
                    >
                        <i key={isDark ? 'sun-m' : 'moon-m'} className={isDark ? 'fas fa-sun text-amber-400' : 'fas fa-moon'}></i>
                    </button>
                    <button className="hamburger" type="button" aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
