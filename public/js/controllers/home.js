document.addEventListener('DOMContentLoaded', () => {
    loadRecentProducts();
});

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
        const userListings = (typeof getLocalUserListings === 'function') ? getLocalUserListings() : [];

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
            if (typeof GLOBAL_PROFANITY_REGEX !== 'undefined' && (GLOBAL_PROFANITY_REGEX.test(p.title || '') || GLOBAL_PROFANITY_REGEX.test(p.description || ''))) return false;
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
