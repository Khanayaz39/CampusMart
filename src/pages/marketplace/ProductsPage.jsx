import React from 'react';

export default function ProductsPage() {
    return (
        <>
            <div id="navbar-container"></div>

            <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
                <div className="section-header">
                    <h2>Browse Marketplace</h2>
                    <div className="sort-dropdown">
                        <select id="sort-select" className="form-control" defaultValue="newest" style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
                    {/* Filters Sidebar */}
                    <aside className="filters-sidebar">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold">Filters</h3>
                            <button id="clear-filters" className="btn btn-ghost btn-sm text-primary-color">Clear All</button>
                        </div>

                        <div className="filter-group">
                            <h3>Categories</h3>
                            <div id="category-filters">
                                {/* Populated by JS */}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3>Condition</h3>
                            <label className="filter-checkbox"><input type="checkbox" name="condition" value="New" /> New</label>
                            <label className="filter-checkbox"><input type="checkbox" name="condition" value="Like New" /> Like New</label>
                            <label className="filter-checkbox"><input type="checkbox" name="condition" value="Good" /> Good</label>
                            <label className="filter-checkbox"><input type="checkbox" name="condition" value="Fair" /> Fair</label>
                        </div>

                        <div className="filter-group">
                            <h3>Price Range (₹)</h3>
                            <div className="price-inputs">
                                <input type="number" id="price-min" className="form-control" placeholder="Min" min="0" />
                                <input type="number" id="price-max" className="form-control" placeholder="Max" min="0" />
                            </div>
                            <button id="apply-price" className="btn btn-outline w-full mt-2 btn-sm">Apply Price</button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div>
                        <div className="mb-3 flex items-center gap-2" id="active-filters">
                            {/* Active filter pills */}
                        </div>
                        <div className="products-grid" id="main-products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                            {/* Skeletons / Products injected by JS */}
                        </div>
                        <div className="text-center mt-5">
                            <button id="load-more" className="btn btn-secondary">Load More</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
