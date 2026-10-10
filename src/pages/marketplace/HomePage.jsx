import React from 'react';

export default function HomePage() {
    return (
        <>
            {/* Navbar injected by React / JS */}
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
                    <div className="products-grid" id="recent-products-grid">
                        {/* Skeletons injected by JS, then products */}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section bg-background reveal">
                <div className="container">
                    <div className="section-header text-center justify-center">
                        <h2>How CampusMart Works</h2>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                        {/* 1. Verified Students */}
                        <div className="how-it-works-card text-center" style={{ cursor: 'default', justifyContent: 'center' }}>
                            <div>
                                <div style={{ width: '72px', height: '72px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                                    <i className="fas fa-user-check"></i>
                                </div>
                                <h3 className="mb-2" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Verified Students</h3>
                                <p className="text-secondary" style={{ marginBottom: 0 }}>Sign up with your .edu email. Trade safely with verified peers on your campus.</p>
                            </div>
                        </div>

                        {/* 2. List or Buy */}
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

                        {/* 3. Chat & Meet */}
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

            {/* Footer injected by React / JS */}
            <div id="footer-container"></div>
        </>
    );
}
