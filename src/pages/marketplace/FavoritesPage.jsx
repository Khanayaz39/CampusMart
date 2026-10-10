import React from 'react';

export default function FavoritesPage() {
    return (
        <>
            <div id="navbar-container"></div>

            <div className="container mb-5" style={{ paddingTop: '6rem', minHeight: '70vh' }}>
                <div className="section-header">
                    <h2><i className="fas fa-heart text-danger"></i> Saved Items</h2>
                </div>

                <div className="products-grid" id="favorites-grid">
                    {/* Skeletons injected by JS, then products */}
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
