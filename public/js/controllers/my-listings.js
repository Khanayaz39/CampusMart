// ============================================
// CampusMart — My Listings Script
// ============================================

let myListings = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    protectPage();

    await fetchUserListings();
    setupStatusTabs();
});

// ---- Fetch User Listings from Backend ----
async function fetchUserListings() {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;

    // Show table skeleton loader
    tbody.innerHTML = Array(3).fill(0).map(() => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="skeleton" style="width: 68px; height: 68px; border-radius: 12px; flex-shrink: 0;"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text" style="width: 70%; margin-bottom: 0.5rem;"></div>
                        <div class="skeleton skeleton-text" style="width: 40%;"></div>
                    </div>
                </div>
            </td>
            <td><div class="skeleton skeleton-text" style="width: 60px;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: 75px;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: 80px;"></div></td>
            <td style="text-align: right;"><div class="skeleton skeleton-text" style="width: 100px; margin-left: auto;"></div></td>
        </tr>
    `).join('');

    myListings = await getUserListings();

    updateCounters();
    renderListings();
}

// ---- Setup Filter Tabs ----
function setupStatusTabs() {
    const tabs = document.querySelectorAll('#status-tabs .profile-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            const clicked = e.currentTarget;
            clicked.classList.add('active');
            currentFilter = clicked.dataset.status || 'all';
            renderListings();
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || window.location.hash.replace('#', '');
    if (initialStatus === 'sold' || initialStatus === 'available') {
        const targetTab = document.querySelector(`#status-tabs .profile-tab[data-status="${initialStatus}"]`);
        if (targetTab) targetTab.click();
    }
}

// ---- Update Tab Counters ----
function updateCounters() {
    const allCount = myListings.length;
    const availableCount = myListings.filter(i => (i.status || 'available') === 'available').length;
    const soldCount = myListings.filter(i => i.status === 'sold').length;

    const elAll = document.getElementById('count-all');
    const elAvailable = document.getElementById('count-available');
    const elSold = document.getElementById('count-sold');

    if (elAll) elAll.innerText = allCount;
    if (elAvailable) elAvailable.innerText = availableCount;
    if (elSold) elSold.innerText = soldCount;
}

// ---- Render Table Rows ----
function renderListings() {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;

    let items = [...myListings];
    if (currentFilter === 'available') {
        items = items.filter(i => (i.status || 'available') === 'available');
    } else if (currentFilter === 'sold') {
        items = items.filter(i => i.status === 'sold');
    }

    if (items.length === 0) {
        const label = currentFilter === 'all' ? 'posted' : currentFilter;
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 4rem 1.5rem;">
                    <div style="max-width: 400px; margin: 0 auto;">
                        <div style="width: 58px; height: 58px; border-radius: 50%; background: #EEF2FF; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.25rem;">
                            <i class="fas fa-box-open" style="margin: 0; line-height: 1;"></i>
                        </div>
                        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">No ${label} listings yet</h3>
                        <p class="text-secondary" style="font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;">You haven't posted any items in this category yet. Start selling to fellow campus students!</p>
                        <a href="/create-listing.html" class="btn btn-primary btn-sm" style="font-weight: 600; padding: 0.55rem 1.25rem; font-size: 0.88rem; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; text-decoration: none;">
                            <i class="fas fa-plus" style="font-size: 0.85rem; margin: 0; line-height: 1;"></i>
                            <span>Post an Item</span>
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const imageUrl = (item.images && item.images.length > 0)
            ? item.images[0]
            : (item.img || 'https://via.placeholder.com/200?text=No+Photo');

        const isSold = item.status === 'sold';
        const dateStr = item.createdAt ? formatDate(item.createdAt) : (item.date || 'Recent');

        return `
            <tr>
                <!-- Item Info -->
                <td>
                    <div class="listing-item-info">
                        <img src="${imageUrl}" alt="${item.title}" class="listing-thumb">
                        <div>
                            <div class="listing-item-title" onclick="window.location.href='/product-detail.html?id=${item._id || item.id}'">
                                ${item.title}
                            </div>
                            <div class="flex items-center gap-2" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                                <span class="badge badge-primary" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">${item.category || 'General'}</span>
                                ${item.hostel ? `<span><i class="fas fa-hotel"></i> ${item.hostel}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </td>

                <!-- Price -->
                <td>
                    <div style="font-weight: 800; color: var(--primary); font-size: 1.1rem;">
                        ${formatPrice(item.price)}
                    </div>
                </td>

                <!-- Status -->
                <td>
                    ${isSold 
                        ? `<span class="badge badge-danger"><i class="fas fa-check-double mr-1"></i> Sold</span>` 
                        : `<span class="badge badge-success"><i class="fas fa-check-circle mr-1"></i> Available</span>`
                    }
                </td>

                <!-- Date -->
                <td>
                    <span class="text-secondary" style="font-size: 0.88rem;">
                        <i class="far fa-calendar-alt mr-1"></i> ${dateStr}
                    </span>
                </td>

                <!-- Actions -->
                <td style="text-align: right;">
                    <div class="flex items-center gap-2 justify-end" style="justify-content: flex-end;">
                        ${!isSold ? `
                            <button class="btn btn-success btn-sm" onclick="toggleSoldStatus('${item._id || item.id}', true)" title="Mark as Sold">
                                <i class="fas fa-check"></i> Mark Sold
                            </button>
                        ` : `
                            <button class="btn btn-outline btn-sm" onclick="toggleSoldStatus('${item._id || item.id}', false)" title="Relist Item">
                                <i class="fas fa-redo"></i> Relist
                            </button>
                        `}
                        <a href="/product-detail.html?id=${item._id || item.id}" class="btn btn-ghost btn-sm btn-icon" title="View Listing">
                            <i class="far fa-eye"></i>
                        </a>
                        <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="deleteListing('${item._id || item.id}')" title="Delete Listing">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ---- Toggle Sold / Available Status with Persistence ----
async function toggleSoldStatus(productId, markAsSold) {
    const newStatus = markAsSold ? 'sold' : 'available';
    const idStr = String(productId);
    const nowIso = new Date().toISOString();

    // Save status change into localStorage so refreshes remember it!
    saveItemStatus(idStr, newStatus);
    if (newStatus === 'available' && typeof saveRelistTimestamp === 'function') {
        saveRelistTimestamp(idStr);
    }

    try {
        const token = getToken();
        if (idStr.length === 24) {
            await fetch(`${API_URL}/products/${idStr}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    updatedAt: nowIso
                })
            });
        }

        // Update local array in memory
        const item = myListings.find(i => String(i._id || i.id) === idStr);
        if (item) {
            item.status = newStatus;
            if (newStatus === 'available') {
                item.updatedAt = nowIso;
            }
        }

        updateCounters();
        renderListings();
        showToast(markAsSold ? 'Item marked as Sold!' : 'Item relisted as Available!', 'success');
    } catch (err) {
        console.error('Error updating status:', err);
        // Even if API fails, local update persists
        const item = myListings.find(i => String(i._id || i.id) === idStr);
        if (item) {
            item.status = newStatus;
            if (newStatus === 'available') {
                item.updatedAt = nowIso;
            }
        }
        updateCounters();
        renderListings();
        showToast(markAsSold ? 'Marked as Sold!' : 'Relisted as Available!', 'success');
    }
}

// ---- Delete Listing with Persistence ----
async function deleteListing(productId) {
    if (!confirm('Are you sure you want to remove this listing? This action cannot be undone.')) {
        return;
    }

    const idStr = String(productId);

    // Save deletion into localStorage so refreshes don't bring it back
    addDeletedListing(idStr);

    try {
        const token = getToken();
        if (idStr.length === 24) {
            await fetch(`${API_URL}/products/${idStr}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
        }

        // Remove from local array
        myListings = myListings.filter(i => String(i._id || i.id) !== idStr);

        updateCounters();
        renderListings();
        showToast('Listing removed successfully', 'info');
    } catch (err) {
        console.error('Error deleting listing:', err);
        myListings = myListings.filter(i => String(i._id || i.id) !== idStr);
        updateCounters();
        renderListings();
        showToast('Listing removed', 'info');
    }
}

// ---- Fallback Demo Items (Disabled — only show real user listings) ----
function getDemoListings() {
    return [];
}
