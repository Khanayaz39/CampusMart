import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

export default function AdminDashboardPage() {
    useAdminDashboard();
    const [isDark, setIsDark] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const syncTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
        window.addEventListener('campusmart-theme-change', syncTheme);
        return () => window.removeEventListener('campusmart-theme-change', syncTheme);
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
        <>
            {/* Clean Admin Navbar */}
            <nav className="admin-navbar">
                <div className="container flex justify-between items-center">
                    <div className="flex items-center">
                        <a href="/" className="logo no-underline font-extrabold text-2xl tracking-tight">Campus<span className="text-secondary font-semibold">Mart</span></a>
                        <span className="admin-badge-tag"><i className="fas fa-shield-alt"></i> Admin Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleThemeToggle}
                            className="theme-toggle-btn"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle Dark Mode"
                        >
                            <i key={isDark ? 'sun' : 'moon'} className={isDark ? 'fas fa-sun text-amber-400' : 'fas fa-moon'}></i>
                        </button>
                        <a href="/" className="btn btn-outline btn-sm rounded-sm">
                            <i className="fas fa-store"></i> View Marketplace
                        </a>
                        <a href="/profile.html" className="btn btn-ghost btn-sm rounded-sm">
                            <i className="fas fa-user-circle"></i> My Account
                        </a>
                    </div>
                </div>
            </nav>

            <div className="container mt-4 mb-5">
                {/* Dashboard Header */}
                <div className="admin-header-box">
                    <div>
                        <h1 className="admin-header-title">Marketplace Administration</h1>
                        <p className="admin-header-desc">Real-time overview of campus users, active listings, and community moderation.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm rounded-sm" onClick={() => window.loadAdminDashboard && window.loadAdminDashboard()}>
                            <i className="fas fa-sync-alt"></i> Refresh Data
                        </button>
                    </div>
                </div>

                {/* 4 Key Stat Cards */}
                <div className="admin-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon users"><i className="fas fa-user-graduate"></i></div>
                        <div className="stat-info">
                            <div className="stat-number" id="stat-total-users">--</div>
                            <div className="stat-label">Registered Students</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon products"><i className="fas fa-tags"></i></div>
                        <div className="stat-info">
                            <div className="stat-number" id="stat-active-products">--</div>
                            <div className="stat-label">Active Campus Listings</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon offers"><i className="fas fa-handshake"></i></div>
                        <div className="stat-info">
                            <div className="stat-number" id="stat-total-offers">--</div>
                            <div className="stat-label">Student Peer Trades</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon reports"><i className="fas fa-shield-virus"></i></div>
                        <div className="stat-info">
                            <div className="stat-number" id="stat-pending-reports">0</div>
                            <div className="stat-label">Pending Safety Reports</div>
                        </div>
                    </div>
                </div>

                {/* Middle Row: Users Directory & Safety Status */}
                <div className="admin-middle-grid mb-5">
                    {/* Registered Students Directory */}
                    <div className="admin-card flex flex-col justify-between">
                        <div>
                            <div className="admin-card-header">
                                <div>
                                    <h3 className="font-bold text-base"><i className="fas fa-users text-primary mr-1"></i> Registered Students</h3>
                                    <p className="text-xs text-secondary mt-0.5">Verified campus peers enrolled in the marketplace</p>
                                </div>
                                <span className="badge badge-primary text-xs" id="admin-users-count">Loading...</span>
                            </div>
                            <div id="admin-users-list" className="overflow-hidden">
                                <div className="text-center text-secondary py-4"><i className="fas fa-spinner fa-spin"></i> Loading students...</div>
                            </div>
                        </div>
                        <div id="admin-users-pagination"></div>
                    </div>

                    {/* Campus Safety & Reports Panel */}
                    <div className="admin-card flex flex-col justify-between">
                        <div>
                            <div className="admin-card-header">
                                <div>
                                    <h3 className="font-bold text-base text-danger"><i className="fas fa-shield-virus mr-1"></i> Community Reports</h3>
                                    <p className="text-xs text-secondary mt-0.5">Flagged accounts &amp; listing alerts</p>
                                </div>
                                <span className="badge badge-warning text-xs" id="admin-reports-count">0</span>
                            </div>
                            <div className="admin-card-body !p-4" id="admin-reports">
                                {/* Populated by JS */}
                            </div>
                        </div>
                        <div id="admin-reports-pagination"></div>
                    </div>
                </div>

                {/* Bottom Row: Campus Marketplace Moderation */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <h3 className="font-bold text-base"><i className="fas fa-boxes text-primary mr-1"></i> Campus Marketplace Listings</h3>
                            <p className="text-xs text-secondary mt-0.5">Review items listed by students and remove policy violations.</p>
                        </div>
                        <span className="badge badge-primary text-xs" id="admin-products-count">Loading...</span>
                    </div>

                    {/* Live Search Bar inside Listings Table */}
                    <div className="admin-filter-bar">
                        <div className="admin-search-wrap">
                            <i className="fas fa-search"></i>
                            <input type="text" id="admin-listing-search" className="admin-search-input" placeholder="Search listings by title, category, or seller email..." onKeyUp={() => window.filterAdminListings && window.filterAdminListings()} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Student Seller</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="admin-products-table">
                                <tr><td colSpan="6" className="text-center text-secondary py-4"><i className="fas fa-spinner fa-spin"></i> Loading campus listings...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="admin-products-pagination"></div>
                </div>
            </div>
        </>
    );
}
