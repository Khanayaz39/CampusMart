let allAdminProducts = [];
let filteredAdminProducts = [];
let currentAdminProductsPage = 1;
const ADMIN_PRODUCTS_PER_PAGE = 10;

let allAdminUsers = [];
let currentAdminUsersPage = 1;
const ADMIN_USERS_PER_PAGE = 4;

let allAdminReports = [];
let currentAdminReportsPage = 1;
const ADMIN_REPORTS_PER_PAGE = 1;

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    const user = getUser();

    // Permission check
    if (!token || !user || user.role !== 'admin') {
        showToast('Admin privilege required. Please log in as an administrator.', 'warning');
    }

    await loadAdminDashboard();
});

async function loadAdminDashboard() {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    // 1. Fetch Real Dashboard Stats
    try {
        const statsRes = await fetch(`${API_URL}/admin/dashboard`, { headers });
        if (statsRes.ok) {
            const stats = await statsRes.json();
            const elUsers = document.getElementById('stat-total-users');
            const elProducts = document.getElementById('stat-active-products');
            const elOffers = document.getElementById('stat-total-offers');
            const elReports = document.getElementById('stat-pending-reports');

            if (elUsers) elUsers.innerText = stats.totalUsers ?? 0;
            if (elProducts) elProducts.innerText = stats.totalProducts ?? 0;
            if (elOffers) elOffers.innerText = stats.totalOffers ?? 0;
            if (elReports) elReports.innerText = stats.pendingReports ?? 0;
        }
    } catch (e) {
        console.warn('Could not load admin stats:', e);
    }

    // 2. Fetch Users
    await loadAdminUsers(headers);

    // 3. Fetch Listings
    await loadAdminProducts(headers);

    // 4. Fetch Reports
    await loadAdminReports(headers);
}

async function loadAdminUsers(headers) {
    const usersContainer = document.getElementById('admin-users-list') || document.getElementById('admin-users-table');
    const paginationContainer = document.getElementById('admin-users-pagination');
    const countBadge = document.getElementById('admin-users-count');
    if (!usersContainer) return;

    try {
        const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
        if (usersRes.ok) {
            allAdminUsers = (await usersRes.json()) || [];
            if (countBadge) countBadge.innerText = `${allAdminUsers.length} Students`;

            const totalPages = Math.max(1, Math.ceil(allAdminUsers.length / ADMIN_USERS_PER_PAGE));
            if (currentAdminUsersPage > totalPages) {
                currentAdminUsersPage = totalPages;
            }
            renderAdminUsersPage(currentAdminUsersPage);
        } else {
            usersContainer.innerHTML = `<div class="text-center text-danger py-4" style="padding: 2rem;">Access restricted to Admin role.</div>`;
            if (paginationContainer) paginationContainer.innerHTML = '';
        }
    } catch (e) {
        usersContainer.innerHTML = `<div class="text-center text-secondary py-4" style="padding: 2rem;">Error loading students list.</div>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
    }
}

window.changeAdminUsersPage = function(page) {
    const totalPages = Math.max(1, Math.ceil(allAdminUsers.length / ADMIN_USERS_PER_PAGE));
    const targetPage = Math.max(1, Math.min(totalPages, Number(page) || 1));
    currentAdminUsersPage = targetPage;
    renderAdminUsersPage(targetPage);
};

function renderAdminUsersPage(page) {
    const usersContainer = document.getElementById('admin-users-list') || document.getElementById('admin-users-table');
    const paginationContainer = document.getElementById('admin-users-pagination');
    if (!usersContainer) return;

    const currentUser = getUser();

    if (!allAdminUsers || allAdminUsers.length === 0) {
        usersContainer.innerHTML = `<div class="text-center text-secondary py-4" style="padding: 2.5rem 1rem;">No registered students found.</div>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const totalUsers = allAdminUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_USERS_PER_PAGE));
    const safePage = Math.max(1, Math.min(totalPages, page));
    currentAdminUsersPage = safePage;

    const startIndex = (safePage - 1) * ADMIN_USERS_PER_PAGE;
    const endIndex = Math.min(startIndex + ADMIN_USERS_PER_PAGE, totalUsers);
    const pageUsers = allAdminUsers.slice(startIndex, endIndex);

    usersContainer.innerHTML = pageUsers.map(u => {
        const isSelf = currentUser && (currentUser._id === u._id || currentUser.email === u.email);
        const avatarUrl = u.profileImage && u.profileImage.includes('http') 
            ? u.profileImage 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=27272A&color=fff&bold=true`;

        const actionHtml = isSelf
            ? `<span class="badge badge-success text-xs" style="padding: 0.35rem 0.65rem; white-space: nowrap;"><i class="fas fa-check-circle"></i> You</span>`
            : `<button class="btn-action-delete" title="Delete User and Listings" onclick="deleteAdminUser('${u._id}', '${encodeURIComponent(u.name)}')">
                    <i class="fas fa-trash-alt"></i> Delete
               </button>`;

        const deptInfo = u.department 
            ? `${u.department}${u.year ? ` • Yr ${u.year}` : ''}` 
            : (u.college || 'Campus Student');

        return `
            <div class="student-row animate-fade-in" style="display: flex; align-items: center; justify-content: space-between; padding: 0.95rem 1.25rem; border-bottom: 1px solid var(--border); transition: background 0.15s ease;">
                <!-- Student Profile & Department Info -->
                <div style="display: flex; align-items: center; gap: 0.85rem; min-width: 0; flex: 1; padding-right: 1rem;">
                    <img src="${avatarUrl}" class="user-avatar-circle" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" alt="${escapeHtml(u.name)}">
                    <div style="min-width: 0; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                            <a href="/profile.html?id=${u._id}" style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); text-decoration: none;">
                                ${escapeHtml(u.name)}
                            </a>
                            ${u.role === 'admin' ? '<span class="badge badge-danger text-xs" style="padding: 1px 5px; font-size: 0.62rem; font-weight: 800; line-height: 1.2;">ADMIN</span>' : ''}
                            <span style="font-size: 0.73rem; color: var(--text-secondary);">• Joined ${formatDate(u.createdAt || new Date())}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem; flex-wrap: wrap;">
                            <span class="font-mono" style="font-size: 0.75rem; color: var(--text-primary);"><i class="far fa-envelope" style="margin-right: 3px; opacity: 0.8;"></i>${escapeHtml(u.email)}</span>
                            <span style="color: var(--border);">•</span>
                            <span style="color: var(--text-secondary);"><i class="fas fa-graduation-cap" style="margin-right: 3px; opacity: 0.8;"></i>${escapeHtml(deptInfo)}</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                    <a href="/profile.html?id=${u._id}" class="btn-action-view" title="View Student Profile">
                        <i class="fas fa-external-link-alt"></i> View
                    </a>
                    ${actionHtml}
                </div>
            </div>
        `;
    }).join('');

    if (paginationContainer) {
        renderAdminPaginationControls(paginationContainer, startIndex, endIndex, totalUsers, safePage, totalPages, 'changeAdminUsersPage');
    }
}

function renderAdminPaginationControls(container, startIndex, endIndex, totalItems, safePage, totalPages, pageFnName) {
    let pageButtonsHtml = '';
    for (let p = 1; p <= totalPages; p++) {
        const isActive = p === safePage;
        pageButtonsHtml += `
            <button type="button" onclick="${pageFnName}(${p})" 
                style="min-width: 30px; height: 30px; padding: 0 0.5rem; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}; background: ${isActive ? 'var(--primary)' : 'var(--card-bg)'}; color: ${isActive ? 'var(--card-bg)' : 'var(--text-secondary)'};">
                ${p}
            </button>
        `;
    }

    container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.75rem 1.25rem; background: var(--surface); border-top: 1px solid var(--border); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; flex-wrap: wrap;">
            <div style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 500;">
                Showing <strong style="color: var(--text-primary);">${startIndex + 1}–${endIndex}</strong> of <strong style="color: var(--text-primary);">${totalItems}</strong>
            </div>

            <div style="display: flex; align-items: center; gap: 0.65rem; flex: 1; max-width: 220px; min-width: 130px;">
                <span style="font-size: 0.72rem; color: var(--text-secondary); white-space: nowrap; font-weight: 600;">Page ${safePage}/${totalPages}</span>
                <input type="range" min="1" max="${totalPages}" step="1" value="${safePage}" 
                    ${totalPages <= 1 ? 'disabled' : ''}
                    oninput="${pageFnName}(this.value)"
                    title="Slide to switch pages"
                    style="flex: 1; accent-color: var(--text-primary); cursor: ${totalPages > 1 ? 'pointer' : 'default'}; height: 5px; opacity: ${totalPages > 1 ? '1' : '0.45'};">
            </div>

            <div style="display: flex; align-items: center; gap: 0.35rem;">
                <button type="button" onclick="${pageFnName}(${safePage - 1})" ${safePage <= 1 ? 'disabled' : ''}
                    style="height: 30px; padding: 0 0.65rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border); background: var(--card-bg); color: ${safePage <= 1 ? 'var(--border)' : 'var(--text-primary)'}; cursor: ${safePage <= 1 ? 'not-allowed' : 'pointer'}; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-chevron-left" style="font-size: 0.65rem;"></i> Prev
                </button>
                ${pageButtonsHtml}
                <button type="button" onclick="${pageFnName}(${safePage + 1})" ${safePage >= totalPages ? 'disabled' : ''}
                    style="height: 30px; padding: 0 0.65rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border); background: var(--card-bg); color: ${safePage >= totalPages ? 'var(--border)' : 'var(--text-primary)'}; cursor: ${safePage >= totalPages ? 'not-allowed' : 'pointer'}; display: inline-flex; align-items: center; gap: 0.25rem;">
                    Next <i class="fas fa-chevron-right" style="font-size: 0.65rem;"></i>
                </button>
            </div>
        </div>
    `;
}

async function loadAdminProducts(headers) {
    const productsTbody = document.getElementById('admin-products-table');
    const paginationContainer = document.getElementById('admin-products-pagination');
    const countBadge = document.getElementById('admin-products-count');
    if (!productsTbody) return;

    try {
        const res = await fetch(`${API_URL}/admin/products`, { headers });
        if (res.ok) {
            allAdminProducts = (await res.json()) || [];
            filteredAdminProducts = allAdminProducts;
            if (countBadge) countBadge.innerText = `${allAdminProducts.length} Listings Live`;
            renderAdminProducts(allAdminProducts, currentAdminProductsPage);
        } else {
            productsTbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Unable to load campus listings (Admin Only).</td></tr>`;
            if (paginationContainer) paginationContainer.innerHTML = '';
        }
    } catch (e) {
        productsTbody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary py-4">Error loading campus listings.</td></tr>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
    }
}

window.changeAdminProductsPage = function(page) {
    const totalPages = Math.max(1, Math.ceil(filteredAdminProducts.length / ADMIN_PRODUCTS_PER_PAGE));
    const targetPage = Math.max(1, Math.min(totalPages, Number(page) || 1));
    currentAdminProductsPage = targetPage;
    renderAdminProducts(filteredAdminProducts, targetPage);
};

function renderAdminProducts(products, page = 1) {
    const productsTbody = document.getElementById('admin-products-table');
    const paginationContainer = document.getElementById('admin-products-pagination');
    if (!productsTbody) return;

    filteredAdminProducts = products || [];

    if (!filteredAdminProducts || filteredAdminProducts.length === 0) {
        productsTbody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary py-5">No marketplace listings match your query.</td></tr>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const totalProducts = filteredAdminProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / ADMIN_PRODUCTS_PER_PAGE));
    const safePage = Math.max(1, Math.min(totalPages, page));
    currentAdminProductsPage = safePage;

    const startIndex = (safePage - 1) * ADMIN_PRODUCTS_PER_PAGE;
    const endIndex = Math.min(startIndex + ADMIN_PRODUCTS_PER_PAGE, totalProducts);
    const pageProducts = filteredAdminProducts.slice(startIndex, endIndex);

    productsTbody.innerHTML = pageProducts.map(p => {
        const sellerName = p.seller?.name || 'Campus Peer';
        const sellerEmail = p.seller?.email || 'vitbhopal.ac.in';
        const thumb = (p.images && p.images.length > 0 && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';

        return `
            <tr class="animate-fade-in">
                <td>
                    <div class="flex items-center gap-3">
                        <img src="${thumb}" class="table-listing-thumb" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200'">
                        <div>
                            <div class="font-bold text-sm" style="max-width: 260px; line-height: 1.3;">${p.title}</div>
                            <div class="text-xs text-secondary mt-0.5"><i class="far fa-clock"></i> ${formatDate(p.createdAt)}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-primary text-xs">${p.category || 'General'}</span></td>
                <td><span class="font-bold text-sm text-primary">${formatPrice(p.price)}</span></td>
                <td>
                    <div class="font-bold text-xs">${sellerName}</div>
                    <div class="text-xs font-mono text-secondary">${sellerEmail}</div>
                </td>
                <td>
                    <span class="badge ${p.status === 'sold' ? 'badge-danger' : 'badge-success'} text-xs">
                        <i class="fas ${p.status === 'sold' ? 'fa-times-circle' : 'fa-check-circle'}"></i> ${p.status || 'available'}
                    </span>
                </td>
                <td style="text-align: right;">
                    <div class="flex items-center justify-end gap-2">
                        <a href="/product-detail.html?id=${p._id}" class="btn-action-view" title="View Listing" target="_blank">
                            <i class="fas fa-external-link-alt"></i> View
                        </a>
                        <button class="btn-action-delete" title="Delete Listing as Admin" onclick="deleteAdminProduct('${p._id}', '${encodeURIComponent(p.title)}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (paginationContainer) {
        renderAdminPaginationControls(paginationContainer, startIndex, endIndex, totalProducts, safePage, totalPages, 'changeAdminProductsPage');
    }
}

window.filterAdminListings = function() {
    const query = (document.getElementById('admin-listing-search')?.value || '').toLowerCase().trim();
    currentAdminProductsPage = 1;
    if (!query) {
        renderAdminProducts(allAdminProducts, 1);
        return;
    }

    const filtered = allAdminProducts.filter(p => {
        const title = (p.title || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const sellerName = (p.seller?.name || '').toLowerCase();
        const sellerEmail = (p.seller?.email || '').toLowerCase();
        return title.includes(query) || category.includes(query) || sellerName.includes(query) || sellerEmail.includes(query);
    });

    renderAdminProducts(filtered, 1);
};

function formatReportReason(reason) {
    if (!reason) return 'Reported Item';
    const map = {
        'scam': 'Scam / Fraud',
        'fake': 'Fake / Counterfeit',
        'inappropriate': 'Prohibited Item',
        'wrong-info': 'Misleading Info',
        'other': 'Policy Violation'
    };
    return map[reason.toLowerCase()] || reason;
}

async function loadAdminReports(headers) {
    const reportsContainer = document.getElementById('admin-reports');
    const paginationContainer = document.getElementById('admin-reports-pagination');
    const reportsBadge = document.getElementById('admin-reports-count');
    if (!reportsContainer) return;

    try {
        const res = await fetch(`${API_URL}/reports`, { headers });
        if (res.ok) {
            allAdminReports = (await res.json()) || [];

            if (reportsBadge) {
                if (allAdminReports.length > 0) {
                    reportsBadge.innerText = `${allAdminReports.length} Pending`;
                    reportsBadge.className = 'badge badge-danger text-xs';
                } else {
                    reportsBadge.className = 'badge badge-success text-xs';
                    reportsBadge.innerText = '0 Clean';
                }
            }

            if (allAdminReports.length > 0) {
                const totalPages = Math.max(1, Math.ceil(allAdminReports.length / ADMIN_REPORTS_PER_PAGE));
                if (currentAdminReportsPage > totalPages) {
                    currentAdminReportsPage = totalPages;
                }
                renderAdminReportsPage(currentAdminReportsPage);
                return;
            }
        }
    } catch (e) {
        // fallback
    }

    allAdminReports = [];
    if (reportsBadge) {
        reportsBadge.className = 'badge badge-success text-xs';
        reportsBadge.innerText = '0 Clean';
    }
    if (paginationContainer) paginationContainer.innerHTML = '';

    reportsContainer.innerHTML = `
        <div class="text-center py-4" style="background: var(--surface); border-radius: 12px; border: 1px dashed var(--border); padding: 2.2rem 1rem;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin: 0 auto 0.75rem;">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div class="font-bold text-sm text-primary">All Clear!</div>
            <p class="text-xs text-secondary mt-1 max-w-xs mx-auto" style="line-height: 1.45;">No pending scam or spam reports filed by students.</p>
        </div>
    `;
}

window.changeAdminReportsPage = function(page) {
    const totalPages = Math.max(1, Math.ceil(allAdminReports.length / ADMIN_REPORTS_PER_PAGE));
    const targetPage = Math.max(1, Math.min(totalPages, Number(page) || 1));
    currentAdminReportsPage = targetPage;
    renderAdminReportsPage(targetPage);
};

function renderAdminReportsPage(page) {
    const reportsContainer = document.getElementById('admin-reports');
    const paginationContainer = document.getElementById('admin-reports-pagination');
    if (!reportsContainer) return;

    const totalReports = allAdminReports.length;
    if (totalReports === 0) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const totalPages = Math.max(1, Math.ceil(totalReports / ADMIN_REPORTS_PER_PAGE));
    const safePage = Math.max(1, Math.min(totalPages, page));
    currentAdminReportsPage = safePage;

    const startIndex = (safePage - 1) * ADMIN_REPORTS_PER_PAGE;
    const endIndex = Math.min(startIndex + ADMIN_REPORTS_PER_PAGE, totalReports);
    const pageReports = allAdminReports.slice(startIndex, endIndex);

    reportsContainer.innerHTML = pageReports.map((r, idx) => {
        const reporterName = r.reporter?.name || 'Campus Student';
        const reporterEmail = r.reporter?.email || '';
        const reporterInitials = (reporterName || 'S')
            .split(' ')
            .filter(Boolean)
            .map(w => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const hasItem = Boolean(r.reportedItem);
        const viewUrl = r.itemType === 'user' 
            ? `/profile.html?id=${r.reportedItem}` 
            : `/product-detail.html?id=${r.reportedItem}`;
        const isLast = idx === pageReports.length - 1;

        return `
        <div class="report-entry animate-fade-in-up" style="background: var(--card-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 1rem; margin-bottom: ${isLast ? '0' : '0.85rem'};">
            <!-- Header: Reason Badge + Date -->
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="badge badge-danger" style="font-size: 0.7rem; padding: 2.5px 8px; font-weight: 700; letter-spacing: 0.02em;">
                        <i class="fas fa-exclamation-triangle"></i> ${escapeHtml(formatReportReason(r.reason))}
                    </span>
                    <span class="badge ${r.status === 'resolved' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.65rem; padding: 2px 6px;">
                        ${r.status || 'pending'}
                    </span>
                </div>
                <span class="text-xs text-secondary" style="font-size: 0.72rem; white-space: nowrap;">
                    <i class="far fa-clock"></i> ${formatDate(r.createdAt)}
                </span>
            </div>

            <!-- Description Box -->
            <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #EF4444; border-radius: 6px; padding: 0.55rem 0.75rem; margin-bottom: 0.75rem;">
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-primary); line-height: 1.45; word-break: break-word;">
                    "${escapeHtml(r.description || 'Reported by campus user.')}"
                </p>
            </div>

            <!-- Reporter Info Snippet -->
            <div class="flex items-center gap-2 mb-3" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.45rem 0.65rem;">
                <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--card-bg); color: var(--text-primary); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0;">
                    ${escapeHtml(reporterInitials)}
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="font-size: 0.76rem; font-weight: 600; color: var(--text-primary); line-height: 1.2;">
                        ${escapeHtml(reporterName)}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(reporterEmail || 'Campus Student')}
                    </div>
                </div>
            </div>

            <!-- Action Buttons (side-by-side flex) -->
            <div class="flex items-center gap-2 pt-2 border-t border-border">
                ${hasItem ? `
                    <a href="${viewUrl}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 0.45rem 0.5rem; border-radius: 8px; text-decoration: none;">
                        <i class="fas fa-external-link-alt"></i> View ${r.itemType === 'user' ? 'User' : 'Item'}
                    </a>
                ` : ''}
                <button type="button" class="btn btn-secondary btn-sm" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 0.45rem 0.5rem; border-radius: 8px;" onclick="resolveAdminReport('${r._id}')">
                    <i class="fas fa-check"></i> Resolve
                </button>
            </div>
        </div>
    `}).join('');

    if (paginationContainer) {
        renderAdminPaginationControls(paginationContainer, startIndex, endIndex, totalReports, safePage, totalPages, 'changeAdminReportsPage');
    }
}

window.resolveAdminReport = async function(reportId) {
    if (!confirm('Mark this report as resolved / dismiss it?')) return;
    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/reports/${reportId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showToast('Report marked as resolved', 'success');
            await loadAdminDashboard();
        } else {
            showToast('Could not resolve report', 'error');
        }
    } catch (e) {
        showToast('Network error resolving report', 'error');
    }
};

// Global action to delete a user
window.deleteAdminUser = async function(userId, encodedName) {
    const name = decodeURIComponent(encodedName || 'this user');
    if (!confirm(`Are you sure you want to permanently delete user "${name}" and all their campus listings?`)) {
        return;
    }

    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast(`User ${name} and their listings deleted successfully`, 'success');
            loadAdminDashboard();
        } else {
            const data = await res.json();
            showToast(data.message || 'Could not delete user', 'error');
        }
    } catch (e) {
        showToast('Network error while deleting user', 'error');
    }
};

// Global action to delete a product
window.deleteAdminProduct = async function(productId, encodedTitle) {
    const title = decodeURIComponent(encodedTitle || 'this listing');
    if (!confirm(`Are you sure you want to permanently delete listing "${title}" as an Admin?`)) {
        return;
    }

    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast(`Listing "${title}" removed by admin`, 'success');
            loadAdminDashboard();
        } else {
            const data = await res.json();
            showToast(data.message || 'Could not delete listing', 'error');
        }
    } catch (e) {
        showToast('Network error while deleting listing', 'error');
    }
};
