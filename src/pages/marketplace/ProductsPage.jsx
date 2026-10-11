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

const CATEGORIES_LIST = [
    { label: 'Books & Notes', value: 'Books & Notes' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Kitchen Items', value: 'Kitchen Items' },
    { label: 'Electrical', value: 'Electrical' }
];

let allLoadedProducts = [];
let currentFilteredProducts = [];
const PRODUCTS_PAGE_SIZE = 12;
let visibleProductsCount = PRODUCTS_PAGE_SIZE;

export default function ProductsPage() {
    useEffect(() => {
        initCommonLayout();

        const catContainer = document.getElementById('category-filters');
        if (catContainer) {
            catContainer.innerHTML = CATEGORIES_LIST.map(c => `
                <label class="filter-checkbox">
                    <input type="checkbox" name="category" value="${c.value}"> ${c.label}
                </label>
            `).join('');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const urlCat = urlParams.get('category');
        if (urlCat) {
            const found = Array.from(document.querySelectorAll('input[name="category"]')).find(
                input => input.value.toLowerCase().includes(urlCat.toLowerCase())
            );
            if (found) found.checked = true;
        }

        window.removeFilter = removeFilter;
        window.clearAllFilters = clearAllFilters;
        window.filterAndRender = filterAndRender;

        fetchAndDisplayProducts();

        document.querySelectorAll('input[name="category"], input[name="condition"]').forEach(input => {
            input.addEventListener('change', () => filterAndRender(true));
        });
        document.getElementById('sort-select')?.addEventListener('change', () => filterAndRender(true));
        document.getElementById('apply-price')?.addEventListener('click', () => filterAndRender(true));
        document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);

        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
            loadMoreBtn.addEventListener('click', () => {
                visibleProductsCount += PRODUCTS_PAGE_SIZE;
                const grid = document.getElementById('main-products-grid');
                if (grid) renderProducts(currentFilteredProducts, grid);
            });
        }
    }, []);

    async function fetchAndDisplayProducts() {
        const grid = document.getElementById('main-products-grid');
        if (!grid) return;

        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

        grid.innerHTML = Array(6).fill(0).map(() => `
            <div class="card skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div style="padding: 1rem;">
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text" style="width: 50%;"></div>
                </div>
            </div>
        `).join('');

        try {
            const res = await fetch(`${API_URL}/products`);
            if (res.ok) {
                const data = await res.json();
                allLoadedProducts = Array.isArray(data) ? data : (data.products || []);
            } else {
                allLoadedProducts = [];
            }
        } catch (err) {
            console.warn('API error loading products:', err);
            allLoadedProducts = [];
        }

        const existingIds = new Set(allLoadedProducts.map(p => String(p._id || p.id)));
        const userListings = getLocalUserListings();
        userListings.forEach(item => {
            const id = String(item._id || item.id);
            if (!existingIds.has(id)) {
                allLoadedProducts.push(item);
                existingIds.add(id);
            }
        });

        filterAndRender(true);
    }

    function filterAndRender(resetCount = true) {
        const grid = document.getElementById('main-products-grid');
        if (!grid) return;

        if (resetCount) visibleProductsCount = PRODUCTS_PAGE_SIZE;

        const statusMap = getSavedStatusMap();
        const deletedListings = getDeletedListings();
        const relistTimestamps = getRelistTimestamps();

        let filtered = allLoadedProducts.filter(p => {
            const id = String(p._id || p.id);
            if (deletedListings.includes(id)) return false;
            if (GLOBAL_PROFANITY_REGEX.test(p.title || '') || GLOBAL_PROFANITY_REGEX.test(p.description || '')) return false;
            return (statusMap[id] || p.status || 'available') !== 'sold';
        });

        const checkedCats = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value.toLowerCase());
        if (checkedCats.length > 0) {
            filtered = filtered.filter(p => checkedCats.some(cat => p.category?.toLowerCase().includes(cat)));
        }

        const checkedConds = Array.from(document.querySelectorAll('input[name="condition"]:checked')).map(cb => cb.value.toLowerCase());
        if (checkedConds.length > 0) {
            filtered = filtered.filter(p => checkedConds.some(c => p.condition?.toLowerCase() === c));
        }

        const minPrice = parseFloat(document.getElementById('price-min')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('price-max')?.value) || Infinity;
        filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

        const urlParams = new URLSearchParams(window.location.search);
        const searchKeyword = urlParams.get('q') || urlParams.get('search');
        if (searchKeyword) {
            const kw = searchKeyword.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(kw) ||
                (p.description && p.description.toLowerCase().includes(kw))
            );
        }

        const sortBy = document.getElementById('sort-select')?.value || 'newest';
        if (sortBy === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else {
            filtered.sort((a, b) => {
                const idA = String(a._id || a.id);
                const idB = String(b._id || b.id);
                const timeA = new Date(relistTimestamps[idA] || a.updatedAt || a.createdAt || 0).getTime();
                const timeB = new Date(relistTimestamps[idB] || b.updatedAt || b.createdAt || 0).getTime();
                return timeB - timeA;
            });
        }

        currentFilteredProducts = filtered;
        renderProducts(filtered, grid);
        updateActiveFilterPills(checkedCats, checkedConds, minPrice, maxPrice);
    }

    function clearAllFilters() {
        document.querySelectorAll('.filter-checkbox input').forEach(i => i.checked = false);
        const minEl = document.getElementById('price-min');
        const maxEl = document.getElementById('price-max');
        if (minEl) minEl.value = '';
        if (maxEl) maxEl.value = '';
        const sortEl = document.getElementById('sort-select');
        if (sortEl) sortEl.value = 'newest';
        filterAndRender(true);
    }

    function updateActiveFilterPills(cats, conditions, minPrice, maxPrice) {
        const container = document.getElementById('active-filters');
        if (!container) return;

        let pills = '';
        cats.forEach(c => {
            pills += `<span class="filter-pill">${c} <span class="remove-pill" onclick="window.removeFilter('category', '${c}')">&times;</span></span>`;
        });
        conditions.forEach(c => {
            pills += `<span class="filter-pill">${c} <span class="remove-pill" onclick="window.removeFilter('condition', '${c}')">&times;</span></span>`;
        });
        if (minPrice > 0) {
            pills += `<span class="filter-pill">Min: ₹${minPrice} <span class="remove-pill" onclick="document.getElementById('price-min').value=''; window.filterAndRender(true);">&times;</span></span>`;
        }
        if (maxPrice < Infinity) {
            pills += `<span class="filter-pill">Max: ₹${maxPrice} <span class="remove-pill" onclick="document.getElementById('price-max').value=''; window.filterAndRender(true);">&times;</span></span>`;
        }
        container.innerHTML = pills;
    }

    function removeFilter(name, value) {
        const target = Array.from(document.querySelectorAll(`input[name="${name}"]`)).find(i => i.value.toLowerCase() === value.toLowerCase());
        if (target) {
            target.checked = false;
            filterAndRender(true);
        }
    }

    function renderProducts(products, container) {
        const loadMoreBtn = document.getElementById('load-more');

        if (!products || products.length === 0) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            container.innerHTML = `
                <div class="empty-state w-full" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p class="text-secondary">Try adjusting your filters or price range</p>
                    <button class="btn btn-outline mt-3" onclick="window.clearAllFilters()">Clear All Filters</button>
                </div>`;
            return;
        }

        const visibleItems = products.slice(0, visibleProductsCount);
        const remainingCount = products.length - visibleItems.length;

        if (loadMoreBtn) {
            if (remainingCount > 0) {
                loadMoreBtn.style.display = 'inline-flex';
                loadMoreBtn.innerHTML = `<i class="fas fa-plus-circle mr-1"></i> Load More (${remainingCount} more)`;
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }

        container.innerHTML = visibleItems.map((p, i) => createProductCardHTML(p, i)).join('');
    }

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

                <div className="products-layout-grid">
                    {/* Filters Sidebar */}
                    <aside className="filters-sidebar">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold">Filters</h3>
                            <button id="clear-filters" className="btn btn-ghost btn-sm text-primary-color">Clear All</button>
                        </div>

                        <div className="filter-group">
                            <h3>Categories</h3>
                            <div id="category-filters"></div>
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
                        <div className="mb-3 flex items-center gap-2 flex-wrap" id="active-filters"></div>
                        <div className="products-grid" id="main-products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}></div>
                        <div className="flex justify-center mt-5 gap-1" id="pagination"></div>
                    </div>
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
