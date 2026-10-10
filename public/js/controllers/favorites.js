// ============================================
// CampusMart — Favorites Script
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    protectPage();
    await loadFavorites();
});

async function loadFavorites() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    grid.innerHTML = Array(2).fill(0).map(() => `
        <div class="card skeleton-card">
            <div class="skeleton skeleton-image" style="height: 220px;"></div>
            <div style="padding: 1.25rem;">
                <div class="skeleton skeleton-text" style="width: 75%; margin-bottom: 0.5rem;"></div>
                <div class="skeleton skeleton-text" style="width: 45%;"></div>
            </div>
        </div>
    `).join('');

    const populatedMap = new Map();

    if (isLoggedIn()) {
        try {
            const res = await fetch(`${API_URL}/favorites`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const apiFavs = await res.json();
                if (Array.isArray(apiFavs)) {
                    const backendIds = [];
                    apiFavs.forEach(f => {
                        if (f.product && f.product._id) {
                            const pid = String(f.product._id);
                            backendIds.push(pid);
                            populatedMap.set(pid, f.product);
                        }
                    });
                    if (backendIds.length > 0) {
                        const merged = Array.from(new Set([...getFavoriteIds(), ...backendIds]));
                        localStorage.setItem('campusmart_favorites', JSON.stringify(merged));
                    }
                }
            }
        } catch (e) {
            console.warn('Could not fetch backend favorites:', e);
        }
    }

    const favoriteIds = getFavoriteIds();
    if (!favoriteIds || favoriteIds.length === 0) {
        renderEmptyState(grid);
        return;
    }

    const favoriteProducts = [];
    for (const id of favoriteIds) {
        if (populatedMap.has(id)) {
            favoriteProducts.push(populatedMap.get(id));
        } else if (id.length === 24) {
            try {
                const res = await fetch(`${API_URL}/products/${id}`);
                if (res.ok) favoriteProducts.push(await res.json());
            } catch (err) {}
        }
    }

    if (favoriteProducts.length === 0) {
        renderEmptyState(grid);
        return;
    }

    grid.innerHTML = favoriteProducts.map((p, i) => createProductCardHTML(p, i, {
        forceFavorited: true,
        favHandlerName: 'handleRemoveFavorite',
        favTitle: 'Remove from favorites',
        includeCardId: true
    })).join('');
}

async function handleRemoveFavorite(e, id) {
    e.stopPropagation();
    await toggleProductFavorite(id);

    const card = document.getElementById(`fav-card-${id}`);
    if (card) {
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'scale(0.85)';
        card.style.opacity = '0';
        setTimeout(() => {
            card.remove();
            const grid = document.getElementById('favorites-grid');
            if (grid && grid.querySelectorAll('.product-card').length === 0) {
                renderEmptyState(grid);
            }
        }, 300);
    }
    showToast('Item removed from Saved Items', 'info');
}

function renderEmptyState(grid) {
    grid.innerHTML = `
        <div class="empty-state w-full" style="grid-column: 1 / -1; padding: 4rem 1.5rem; background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow-sm); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #FEF2F2; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
                <i class="far fa-heart" style="font-size: 1.75rem; color: var(--danger); margin: 0; line-height: 1; display: block;"></i>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">No saved items yet</h3>
            <p class="text-secondary" style="font-size: 0.92rem; margin-bottom: 1.75rem; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                Tap the heart icon on textbooks, electronics, cycles, or hostel essentials while browsing to save them here!
            </p>
            <a href="/products.html" class="btn btn-primary btn-sm" style="font-weight: 600; padding: 0.55rem 1.25rem; font-size: 0.9rem; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none;">
                <i class="fas fa-compass" style="font-size: 0.95rem; margin: 0; line-height: 1;"></i>
                <span>Browse Campus Marketplace</span>
            </a>
        </div>
    `;
}
