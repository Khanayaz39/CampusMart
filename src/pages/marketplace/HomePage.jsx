import React, { useEffect } from 'react';
import {
    API_URL,
    initCommonLayout,
    getLocalUserListings,
    getSavedStatusMap,
    getDeletedListings,
    getRelistTimestamps,
    GLOBAL_PROFANITY_REGEX,
    createProductCardHTML
} from '../../utils/common.js';

export default function HomePage() {
    useEffect(() => {
        initCommonLayout();
        loadRecentProducts();
    }, []);

    async function loadRecentProducts() {
        const grid = document.getElementById('recent-products-grid');
        if (!grid) return;

        grid.innerHTML = Array(4).fill(0).map((_, i) => `
            <div class="card skeleton-card stagger-${i + 1}">
                <div class="skeleton skeleton-image"></div>
                <div class="p-3">
                    <div class="skeleton skeleton-text lg"></div>
                    <div class="skeleton skeleton-text sm"></div>
                    <div class="skeleton skeleton-text" style="width: 80%; margin-top: 1rem;"></div>
                </div>
            </div>
        `).join('');

        try {
            let rawList = [];
            try {
                const response = await fetch(`${API_URL}/products?limit=20`);
                if (response.ok) {
                    const data = await response.json();
                    rawList = Array.isArray(data) ? data : (data.products || []);
                }
            } catch (apiErr) {
                console.warn('API fetch warning on home:', apiErr);
            }

            const allProducts = [...rawList];
            const existingIds = new Set(allProducts.map(p => String(p._id || p.id)));
            const userListings = getLocalUserListings();

            userListings.forEach(item => {
                const id = String(item._id || item.id);
                if (!existingIds.has(id)) {
                    allProducts.push(item);
                    existingIds.add(id);
                }
            });

            const statusMap = getSavedStatusMap();
            const deletedListings = getDeletedListings();
            const relistTimestamps = getRelistTimestamps();

            const freshProducts = allProducts.filter(p => {
                const id = String(p._id || p.id);
                if (deletedListings.includes(id)) return false;
                if (GLOBAL_PROFANITY_REGEX.test(p.title || '') || GLOBAL_PROFANITY_REGEX.test(p.description || '')) return false;
                return (statusMap[id] || p.status || 'available') !== 'sold';
            }).sort((a, b) => {
                const idA = String(a._id || a.id);
                const idB = String(b._id || b.id);
                const timeA = new Date(relistTimestamps[idA] || a.updatedAt || a.createdAt || 0).getTime();
                const timeB = new Date(relistTimestamps[idB] || b.updatedAt || b.createdAt || 0).getTime();
                return timeB - timeA;
            });

            setTimeout(() => renderProducts(freshProducts.slice(0, 4), grid), 300);
        } catch (error) {
            console.error('Error fetching products:', error);
            renderProducts([], grid);
        }
    }

    function renderProducts(products, container) {
        if (!products || products.length === 0) {
            container.innerHTML = `<div class="empty-state w-full" style="grid-column: 1 / -1;">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>Check back later for new listings.</p>
            </div>`;
            return;
        }
        container.innerHTML = products.map((p, i) => createProductCardHTML(p, i)).join('');
    }

    return (
        <>
            <div id="navbar-container"></div>

            {/* Hero Section */}
            <header className="hero">
                <div className="container relative z-10">
                    <h1>Buy &amp; Sell on Campus</h1>
                    <p>The exclusive marketplace for college students. Find great deals on textbooks, electronics, furniture, and more.</p>
                    <div className="search-container">
                        <form id="hero-search-form" className="hero-search" action="/products.html" method="GET">
                            <input type="text" name="q" placeholder="What are you looking for? (e.g., Biology Textbook)" required />
                            <button type="submit">Search <i className="fas fa-search ml-1"></i></button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Categories Section */}
            <section className="section bg-background reveal">
                <div className="container">
                    <div className="section-header">
                        <h2>Explore Categories</h2>
                        <a href="/products.html" className="view-all">All Categories <i className="fas fa-arrow-right"></i></a>
                    </div>
                    <div className="categories-grid">
                        <a href="/products.html?category=books" className="category-tile cat-books stagger-1">
                            <div className="category-icon"><i className="fas fa-book"></i></div>
                            <span className="category-name">Textbooks</span>
                        </a>
                        <a href="/products.html?category=electronics" className="category-tile cat-electronics stagger-2">
                            <div className="category-icon"><i className="fas fa-laptop"></i></div>
                            <span className="category-name">Electronics</span>
                        </a>
                        <a href="/products.html?category=furniture" className="category-tile cat-furniture stagger-3">
                            <div className="category-icon"><i className="fas fa-chair"></i></div>
                            <span className="category-name">Furniture</span>
                        </a>
                        <a href="/products.html?category=clothing" className="category-tile cat-clothing stagger-4">
                            <div className="category-icon"><i className="fas fa-tshirt"></i></div>
                            <span className="category-name">Clothing</span>
                        </a>
                        <a href="/products.html?category=transport" className="category-tile cat-transport stagger-5">
                            <div className="category-icon"><i className="fas fa-bicycle"></i></div>
                            <span className="category-name">Transport</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Recent Products Section */}
            <section className="section bg-surface reveal border-y border-border">
                <div className="container">
                    <div className="section-header">
                        <h2>Fresh Listings</h2>
                        <a href="/products.html" className="view-all">View All <i className="fas fa-arrow-right"></i></a>
                    </div>
                    <div className="products-grid" id="recent-products-grid"></div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section bg-background reveal">
                <div className="container">
                    <div className="section-header text-center justify-center">
                        <h2>How CampusMart Works</h2>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                        <div className="how-it-works-card text-center" style={{ cursor: 'default', justifyContent: 'center' }}>
                            <div>
                                <div style={{ width: '72px', height: '72px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                                    <i className="fas fa-user-check"></i>
                                </div>
                                <h3 className="mb-2" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Verified Students</h3>
                                <p className="text-secondary" style={{ marginBottom: 0 }}>Sign up with your .edu email. Trade safely with verified peers on your campus.</p>
                            </div>
                        </div>

                        <a href="/products.html" className="how-it-works-card text-center">
                            <div>
                                <div style={{ width: '72px', height: '72px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                                    <i className="fas fa-tags"></i>
                                </div>
                                <h3 className="mb-2" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>List or Buy</h3>
                                <p className="text-secondary mb-3">Snap a photo to sell in seconds, or browse thousands of items listed by other students.</p>
                            </div>
                            <span className="btn btn-outline btn-sm mt-2" style={{ borderRadius: '20px', fontSize: '0.8rem', pointerEvents: 'none' }}>
                                Browse Catalog <i className="fas fa-arrow-right ml-1"></i>
                            </span>
                        </a>

                        <a href="/chat.html" className="how-it-works-card text-center">
                            <div>
                                <div style={{ width: '72px', height: '72px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                                    <i className="fas fa-comments"></i>
                                </div>
                                <h3 className="mb-2" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Chat &amp; Meet</h3>
                                <p className="text-secondary mb-3">Use our in-app chat to negotiate prices and safely arrange on-campus meetups.</p>
                            </div>
                            <span className="btn btn-outline btn-sm mt-2" style={{ borderRadius: '20px', fontSize: '0.8rem', pointerEvents: 'none' }}>
                                Open Messages <i className="fas fa-arrow-right ml-1"></i>
                            </span>
                        </a>
                    </div>
                </div>
            </section>

            <div id="footer-container"></div>
        </>
    );
}
