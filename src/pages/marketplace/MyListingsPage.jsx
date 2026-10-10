import React from 'react';

export default function MyListingsPage() {
    return (
        <>
            <div id="navbar-container"></div>

            <div className="container mb-5" style={{ paddingTop: '6.5rem' }}>
                <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>My Campus Listings</h1>
                        <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Track, manage, and update items you have posted on campus</p>
                    </div>
                    <a href="/create-listing.html" className="btn btn-primary">
                        <i className="fas fa-plus"></i> Post New Item
                    </a>
                </div>

                {/* Filter Status Tabs */}
                <div className="profile-tabs mt-3" id="status-tabs">
                    <div className="profile-tab active" data-status="all">
                        <i className="fas fa-th-list"></i> All Items (<span id="count-all">0</span>)
                    </div>
                    <div className="profile-tab" data-status="available">
                        <i className="fas fa-check-circle"></i> Available (<span id="count-available">0</span>)
                    </div>
                    <div className="profile-tab" data-status="sold">
                        <i className="fas fa-handshake"></i> Sold (<span id="count-sold">0</span>)
                    </div>
                </div>

                {/* Listings Table Card */}
                <div className="card mt-3" style={{ boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ minWidth: '260px' }}>Item Details</th>
                                <th style={{ minWidth: '120px' }}>Price</th>
                                <th style={{ minWidth: '110px' }}>Status</th>
                                <th style={{ minWidth: '140px' }}>Date Listed</th>
                                <th style={{ minWidth: '180px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="listings-table-body">
                            {/* Populated dynamically via JS */}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
