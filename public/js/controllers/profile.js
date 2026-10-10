// ============================================
// CampusMart — Profile Page Script
// ============================================

let currentProfileUser = null;
let isViewingOwnProfile = true;

document.addEventListener('DOMContentLoaded', async () => {
    protectPage();

    const loggedInUser = getUser();
    if (!loggedInUser) {
        window.location.href = '/login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('id') || urlParams.get('userId');

    // Determine if viewing own profile or another student's profile
    if (targetUserId && targetUserId !== loggedInUser._id && targetUserId !== loggedInUser.id) {
        isViewingOwnProfile = false;
        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/auth/users/${targetUserId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                currentProfileUser = await res.json();
            } else {
                showToast('Student user not found, showing your profile', 'warning');
                currentProfileUser = loggedInUser;
                isViewingOwnProfile = true;
            }
        } catch (e) {
            console.warn('Could not fetch user by ID:', e);
            currentProfileUser = loggedInUser;
            isViewingOwnProfile = true;
        }
    } else {
        currentProfileUser = loggedInUser;
        isViewingOwnProfile = true;
    }

    // 1. Render User Profile Information
    renderUserProfile(currentProfileUser, isViewingOwnProfile);

    // 2. Fetch & Render User's Actual Products
    await loadUserProducts(currentProfileUser, isViewingOwnProfile);

    // 3. Fetch & Render User's Reviews & Peer Ratings
    await loadUserReviews(currentProfileUser, isViewingOwnProfile);

    // 4. Tab Switching
    setupTabs();

    // 5. Edit Profile & Payment QR Setup (only for own profile)
    if (isViewingOwnProfile) {
        setupPaymentQrSection(currentProfileUser);
        setupEditModal(currentProfileUser);
        setupDeleteAccountModal();
    } else {
        setupProfileReviewModal(currentProfileUser);
    }
});

function renderUserProfile(user, isOwnProfile) {
    if (!user) return;

    // Purge old John Doe avatar URL if present in local storage
    if (isOwnProfile && user.profileImage && (user.profileImage.includes('John') || user.profileImage.includes('placeholder'))) {
        delete user.profileImage;
        localStorage.setItem('user', JSON.stringify(user));
    }

    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.innerText = user.name || 'Campus Student';

    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
        avatarEl.src = getAvatarUrl(user);
    }

    const collegeEl = document.getElementById('profile-college');
    if (collegeEl) {
        collegeEl.innerHTML = `<i class="fas fa-university"></i> ${user.college || 'VIT Bhopal University'}`;
    }

    const hostelEl = document.getElementById('profile-hostel');
    if (hostelEl) {
        const hostelInfo = [user.hostel, user.roomNumber ? `Room ${user.roomNumber}` : ''].filter(Boolean).join(', ');
        hostelEl.innerHTML = `<i class="fas fa-hotel"></i> ${hostelInfo || 'Campus Resident'}`;
    }

    const deptEl = document.getElementById('profile-dept');
    if (deptEl) {
        const studentInfo = [user.department, user.year ? `Year ${user.year}` : ''].filter(Boolean).join(' • ');
        deptEl.innerHTML = `<i class="fas fa-graduation-cap"></i> ${studentInfo || 'Student'}`;
    }

    const ratingEl = document.getElementById('stats-rating');
    if (ratingEl) {
        ratingEl.innerText = user.rating ? `${user.rating.toFixed(1)}/5` : '4.9/5';
    }

    // Role & Verification badges
    const roleContainer = document.getElementById('role-badge-container');
    if (roleContainer) {
        const role = user.role || 'buyer';
        if (role === 'admin') {
            roleContainer.innerHTML = `<span class="badge badge-danger" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; vertical-align: middle;"><i class="fas fa-shield-alt"></i> Admin</span>`;
        } else if (role === 'seller') {
            roleContainer.innerHTML = `<span class="badge badge-primary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; vertical-align: middle;"><i class="fas fa-store"></i> Seller</span>`;
        } else if (role === 'both') {
            roleContainer.innerHTML = `<span class="badge badge-info" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; vertical-align: middle;"><i class="fas fa-exchange-alt"></i> Buyer & Seller</span>`;
        } else {
            roleContainer.innerHTML = `<span class="badge badge-primary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; vertical-align: middle;"><i class="fas fa-shopping-bag"></i> Buyer</span>`;
        }
    }

    const badgeContainer = document.getElementById('verification-badge-container');
    if (badgeContainer) {
        if (user.isVerified) {
            badgeContainer.innerHTML = `<span class="badge badge-success" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; vertical-align: middle;"><i class="fas fa-check-circle"></i> Campus Verified</span>`;
        } else {
            badgeContainer.innerHTML = `<span class="badge badge-warning" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; vertical-align: middle;"><i class="fas fa-exclamation-circle"></i> Student Peer</span>`;
        }
    }

    // If user has deleted their account
    if (user.isDeleted || user.name === 'Deleted User') {
        if (nameEl) nameEl.innerText = 'Deleted User';
        if (avatarEl) avatarEl.src = 'https://ui-avatars.com/api/?name=Deleted+User&background=94A3B8&color=fff';
        if (collegeEl) collegeEl.innerHTML = `<i class="fas fa-university"></i> Campus Student (Inactive)`;
        if (hostelEl) hostelEl.innerHTML = `<i class="fas fa-hotel"></i> Not Available`;
        if (deptEl) deptEl.innerHTML = `<span style="color: #DC2626; font-weight: 700;"><i class="fas fa-user-slash"></i> Account Deleted</span>`;
        if (roleContainer) roleContainer.innerHTML = `<span class="badge" style="background: #FEE2E2; color: #DC2626;"><i class="fas fa-ban"></i> Inactive</span>`;
        if (badgeContainer) badgeContainer.innerHTML = '';
        const editBtn = document.getElementById('edit-profile-btn');
        const deleteBtn = document.getElementById('delete-account-btn');
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        return;
    }

    // Handle Edit vs Public Profile Actions
    const ownActions = document.getElementById('own-profile-actions');
    const editBtn = document.getElementById('edit-profile-btn');
    const deleteBtn = document.getElementById('delete-account-btn');
    const paymentQrTabBtn = document.getElementById('tab-btn-payment-qr');
    const tabsRow = document.querySelector('.profile-tabs');

    if (!isOwnProfile) {
        if (ownActions) ownActions.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (paymentQrTabBtn) paymentQrTabBtn.style.display = 'none';

        // Check if message button already exists
        if (!document.getElementById('profile-msg-btn') && tabsRow) {
            const loggedInUser = getUser();
            const isAdmin = loggedInUser && loggedInUser.role === 'admin';

            const actionWrap = document.createElement('div');
            actionWrap.className = 'ml-auto';
            actionWrap.style.cssText = 'margin-left: auto; display: flex; gap: 0.6rem; align-items: center; padding: 0.4rem 0; flex-shrink: 0;';

            const btnBaseStyle = 'height: 38px; padding: 0 1rem; font-size: 0.85rem; font-weight: 600; line-height: 1; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; white-space: nowrap; box-sizing: border-box; text-decoration: none;';

            actionWrap.innerHTML = `
                ${isAdmin ? `
                    <a href="/admin/dashboard.html" class="btn btn-outline btn-sm" style="${btnBaseStyle} color: #DC2626; border-color: #FCA5A5; background: #FEF2F2;">
                        <i class="fas fa-arrow-left" style="font-size: 0.82rem;"></i>
                        <span>Admin Portal</span>
                    </a>
                ` : ''}
                <button type="button" class="btn btn-outline btn-sm" onclick="openProfileReviewModal()" style="${btnBaseStyle}">
                    <i class="fas fa-star text-warning" style="font-size: 0.85rem;"></i>
                    <span>Rate Student</span>
                </button>
                <a href="/chat.html?sellerId=${user._id || user.id || ''}&seller=${encodeURIComponent(user.name)}" id="profile-msg-btn" class="btn btn-primary btn-sm" style="${btnBaseStyle}">
                    <i class="fas fa-comment-dots" style="font-size: 0.85rem;"></i>
                    <span>Chat with Student</span>
                </a>
            `;
            tabsRow.appendChild(actionWrap);
        }
    } else {
        if (ownActions) ownActions.style.display = 'flex';
        if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    }
}

async function loadUserProducts(user, isOwnProfile) {
    const grid = document.getElementById('tab-listings');
    const soldGrid = document.getElementById('tab-sold');
    if (!grid) return;

    // Show skeletons
    grid.innerHTML = Array(3).fill(0).map(() => `
        <div class="card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div style="padding: 1rem;">
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 50%;"></div>
            </div>
        </div>
    `).join('');

    let products = [];
    if (isOwnProfile) {
        products = await getUserListings();
    } else {
        // Fetch target user's products from backend
        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/products?seller=${user._id || user.id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                products = await res.json();
            }
        } catch (e) {
            console.warn('Could not fetch student products:', e);
        }
    }

    // Apply statusMap and deletedListings
    const statusMap = (typeof getSavedStatusMap === 'function') ? getSavedStatusMap() : {};
    const deletedListings = (typeof getDeletedListings === 'function') ? getDeletedListings() : [];

    products = products
        .filter(p => !deletedListings.includes(String(p._id || p.id)))
        .map(p => {
            const id = String(p._id || p.id);
            if (statusMap[id]) {
                p.status = statusMap[id];
            }
            return p;
        });

    const availableProducts = products.filter(p => (p.status || 'available') !== 'sold');
    const soldProducts = products.filter(p => p.status === 'sold');

    // Update stats counts
    const countEl = document.getElementById('stats-listings-count');
    if (countEl) countEl.innerText = availableProducts.length;
    
    const tabCountEl = document.getElementById('tab-count');
    if (tabCountEl) tabCountEl.innerText = availableProducts.length;

    const soldEl = document.getElementById('stats-sold-count');
    if (soldEl) soldEl.innerText = soldProducts.length;

    const tabSoldCountEl = document.getElementById('tab-sold-count');
    if (tabSoldCountEl) tabSoldCountEl.innerText = soldProducts.length;

    // 1. Render Available Listings
    if (availableProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state w-full" style="grid-column: 1 / -1; background: var(--card-bg); border-radius: var(--radius-lg); padding: 3rem 1.5rem; border: 1px solid var(--border);">
                <i class="fas fa-box-open" style="font-size: 3.5rem; color: var(--primary); margin-bottom: 1rem; opacity: 0.8;"></i>
                <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No active listings</h3>
                <p class="text-secondary" style="margin-bottom: 1.5rem;">
                    ${isOwnProfile ? 'Post textbooks, cycles, or hostel essentials to sell to campus peers.' : 'This student has not posted any active listings yet.'}
                </p>
                ${isOwnProfile ? `
                    <a href="/create-listing.html" class="btn btn-primary btn-sm" style="font-weight: 600; padding: 0.55rem 1.25rem; font-size: 0.88rem; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;">
                        <i class="fas fa-plus" style="font-size: 0.85rem; margin: 0; line-height: 1;"></i>
                        <span>Post an Item</span>
                    </a>
                ` : ''}
            </div>
        `;
    } else {
        grid.innerHTML = availableProducts.map((product, i) => {
            const imageUrl = (product.images && product.images.length > 0)
                ? product.images[0]
                : 'https://via.placeholder.com/400x300?text=No+Photo';

            return `
                <div class="product-card stagger-${(i % 5) + 1} animate-fade-in-up" onclick="window.location.href='/product-detail.html?id=${product._id || product.id}'">
                    <div class="product-image-wrapper">
                        <img src="${imageUrl}" class="product-image" alt="${escapeHtml(product.title)}">
                        <span class="product-badge badge-primary">${escapeHtml(product.category || 'Item')}</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${escapeHtml(product.title)}</h3>
                        <div class="product-price">${formatPrice(product.price)}</div>
                        <div class="product-meta">
                            <span class="condition-badge condition-good">${product.condition || 'Good'}</span>
                            <span class="badge badge-success"><i class="fas fa-check-circle mr-1"></i> Available</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Render Sold Listings
    if (soldGrid) {
        if (soldProducts.length === 0) {
            soldGrid.innerHTML = `
                <div class="empty-state w-full" style="grid-column: 1 / -1; background: var(--card-bg); border-radius: var(--radius-lg); padding: 3rem 1.5rem; border: 1px solid var(--border);">
                    <div style="width: 58px; height: 58px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.25rem;">
                        <i class="fas fa-handshake" style="margin: 0; line-height: 1;"></i>
                    </div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Items Sold Yet</h3>
                    <p class="text-secondary" style="margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                        ${isOwnProfile ? 'When you mark items as sold in "My Listings", they will be showcased here.' : 'This student has not marked any items as sold yet.'}
                    </p>
                    ${isOwnProfile ? `
                        <a href="/my-listings.html" class="btn btn-outline btn-sm" style="font-weight: 600; padding: 0.5rem 1.1rem; font-size: 0.85rem; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;">
                            <i class="fas fa-list" style="font-size: 0.85rem; margin: 0; line-height: 1;"></i>
                            <span>Go to My Listings</span>
                        </a>
                    ` : ''}
                </div>
            `;
        } else {
            soldGrid.innerHTML = soldProducts.map((product, i) => {
                const imageUrl = (product.images && product.images.length > 0)
                    ? product.images[0]
                    : 'https://via.placeholder.com/400x300?text=No+Photo';

                return `
                    <div class="product-card stagger-${(i % 5) + 1} animate-fade-in-up" onclick="window.location.href='/product-detail.html?id=${product._id || product.id}'">
                        <div class="product-image-wrapper">
                            <img src="${imageUrl}" class="product-image" alt="${escapeHtml(product.title)}">
                            <span class="product-badge badge-primary">${escapeHtml(product.category || 'Item')}</span>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${escapeHtml(product.title)}</h3>
                            <div class="product-price">${formatPrice(product.price)}</div>
                            <div class="product-meta">
                                <span class="condition-badge condition-good">${product.condition || 'Good'}</span>
                                <span class="badge badge-danger"><i class="fas fa-check-double mr-1"></i> Sold</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.profile-tab[data-target]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.target;
            const listingsTab = document.getElementById('tab-listings');
            const soldTab = document.getElementById('tab-sold');
            const reviewsTab = document.getElementById('tab-reviews');
            const paymentQrTab = document.getElementById('tab-payment-qr');

            listingsTab?.classList.toggle('hidden', target !== 'listings');
            soldTab?.classList.toggle('hidden', target !== 'sold');
            reviewsTab?.classList.toggle('hidden', target !== 'reviews');
            paymentQrTab?.classList.toggle('hidden', target !== 'payment-qr');
        });
    });

    // Check if URL has ?tab=sold or ?tab=reviews or ?tab=payment-qr or hash
    const urlParams = new URLSearchParams(window.location.search);
    const activeTabParam = urlParams.get('tab') || window.location.hash.replace('#', '');
    if (activeTabParam) {
        const targetTab = document.querySelector(`.profile-tab[data-target="${activeTabParam}"]`);
        if (targetTab) {
            targetTab.click();
        }
    }
}

function setupPaymentQrSection(user) {
    const fileInput = document.getElementById('qr-file-input');
    const uploadBtn = document.getElementById('upload-qr-btn');
    const removeBtn = document.getElementById('remove-qr-btn');
    const previewImg = document.getElementById('qr-preview-img');
    const placeholder = document.getElementById('qr-placeholder');
    const upiInput = document.getElementById('profile-upi-id');
    const saveBtn = document.getElementById('save-payment-qr-btn');
    const statusBadge = document.getElementById('qr-status-badge');
    const detectedInfo = document.getElementById('qr-detected-info');

    if (!saveBtn) return;

    let currentQrDataUrl = user.upiQrImage || '';

    const updateQrUiState = () => {
        const hasQrImg = Boolean(currentQrDataUrl && currentQrDataUrl.trim() !== '');
        const vpa = upiInput ? upiInput.value.trim() : '';
        const hasUpiId = Boolean(vpa !== '');

        if (hasQrImg) {
            previewImg.src = currentQrDataUrl;
            previewImg.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        } else if (hasUpiId) {
            const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(user.name || 'Seller')}&cu=INR`;
            previewImg.src = `https://quickchart.io/qr?text=${encodeURIComponent(upiUri)}&size=210&ecLevel=H&margin=2`;
            previewImg.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        } else {
            previewImg.src = '';
            previewImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'block';
        }

        if (removeBtn) {
            removeBtn.style.display = hasQrImg ? 'inline-flex' : 'none';
        }

        if (statusBadge) {
            if (hasQrImg && hasUpiId) {
                statusBadge.className = 'badge badge-success';
                statusBadge.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Custom Amount QR Ready`;
            } else if (hasUpiId) {
                statusBadge.className = 'badge badge-success';
                statusBadge.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Dynamic UPI Ready`;
            } else if (hasQrImg) {
                statusBadge.className = 'badge badge-warning';
                statusBadge.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i> Add UPI ID for Custom ₹`;
            } else {
                statusBadge.className = 'badge badge-warning';
                statusBadge.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i> Not Configured`;
            }
        }
    };

    if (upiInput) {
        upiInput.value = user.upiId || '';
        upiInput.addEventListener('input', updateQrUiState);
    }

    // If user already has an uploaded QR image, decode it to extract UPI ID automatically!
    if (currentQrDataUrl) {
        decodeUpiFromQrImage(currentQrDataUrl).then(async (rawText) => {
            const parsed = parseUpiQrData(rawText);
            if (parsed && parsed.upiId) {
                if (detectedInfo) {
                    detectedInfo.style.display = 'block';
                    detectedInfo.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Extracted UPI ID from QR: <strong>${escapeHtml(parsed.upiId)}</strong>`;
                }
                if (upiInput && !upiInput.value.trim()) {
                    upiInput.value = parsed.upiId;
                    user.upiId = parsed.upiId;
                    localStorage.setItem('user', JSON.stringify(user));
                    updateQrUiState();
                    // Also persist the extracted UPI ID to backend silently
                    try {
                        const token = getToken();
                        await fetch(`${API_URL}/auth/profile`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                            },
                            body: JSON.stringify({ upiId: parsed.upiId, upiQrImage: currentQrDataUrl })
                        });
                    } catch (e) {}
                }
            }
        });
    }

    updateQrUiState();

    uploadBtn?.addEventListener('click', () => {
        fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('QR image must be smaller than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
            currentQrDataUrl = ev.target.result;
            showingRawUploadedImage = false;

            // Decode the uploaded QR image to extract the seller's UPI ID!
            const rawText = await decodeUpiFromQrImage(currentQrDataUrl);
            const parsed = parseUpiQrData(rawText);

            if (parsed && parsed.upiId) {
                if (upiInput) upiInput.value = parsed.upiId;
                if (detectedInfo) {
                    detectedInfo.style.display = 'block';
                    detectedInfo.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Extracted UPI ID: <strong>${escapeHtml(parsed.upiId)}</strong> — Custom ₹ QR active!`;
                }
                showToast(`Extracted UPI ID (${parsed.upiId}) from your QR! Click Save to apply.`, 'success');
            } else {
                if (detectedInfo) {
                    detectedInfo.style.display = 'block';
                    detectedInfo.innerHTML = `<i class="fas fa-info-circle mr-1"></i> Could not auto-read UPI ID from image — please enter your UPI ID on the right so custom ₹ amounts (like ₹300) work!`;
                }
                showToast('QR image loaded! Please also verify your UPI ID on the right for custom ₹ amounts.', 'info');
            }

            updateQrUiState();
        };
        reader.readAsDataURL(file);
    });

    removeBtn?.addEventListener('click', () => {
        currentQrDataUrl = '';
        if (fileInput) fileInput.value = '';
        if (detectedInfo) detectedInfo.style.display = 'none';
        updateQrUiState();
    });

    saveBtn.addEventListener('click', async () => {
        const originalHtml = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Saving...';
        saveBtn.disabled = true;

        const upiIdVal = upiInput ? upiInput.value.trim() : '';

        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    upiId: upiIdVal,
                    upiQrImage: currentQrDataUrl
                })
            });

            if (res.ok) {
                const data = await res.json();
                const updatedUser = data.user || data;
                Object.assign(user, updatedUser);
            } else {
                user.upiId = upiIdVal;
                user.upiQrImage = currentQrDataUrl;
            }

            localStorage.setItem('user', JSON.stringify(user));

            // Sync with Edit Profile modal input if present
            const editUpiInput = document.getElementById('edit-upi');
            if (editUpiInput) editUpiInput.value = user.upiId || '';

            updateQrUiState();
            showToast('Payment QR settings saved to your profile!', 'success');
        } catch (err) {
            console.warn('Error saving Payment QR settings:', err);
            user.upiId = upiIdVal;
            user.upiQrImage = currentQrDataUrl;
            localStorage.setItem('user', JSON.stringify(user));
            updateQrUiState();
            showToast('Payment QR settings saved!', 'success');
        } finally {
            saveBtn.innerHTML = originalHtml;
            saveBtn.disabled = false;
        }
    });
}

function setupEditModal(user) {
    const modal = document.getElementById('edit-modal');
    const openBtn = document.getElementById('edit-profile-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const form = document.getElementById('edit-profile-form');

    if (!modal) return;

    // Populate initial form fields
    openBtn?.addEventListener('click', () => {
        document.getElementById('edit-name').value = user.name || '';
        const roleEl = document.getElementById('edit-role');
        if (roleEl) roleEl.value = user.role || 'both';
        document.getElementById('edit-hostel').value = user.hostel || '';
        document.getElementById('edit-room').value = user.roomNumber || '';
        document.getElementById('edit-dept').value = user.department || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-bio').value = user.bio || '';
        const upiInput = document.getElementById('edit-upi');
        if (upiInput) upiInput.value = user.upiId || '';
        modal.classList.add('active');
    });

    const closeModal = () => modal.classList.remove('active');
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form Submit
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-profile-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;

        const updatedData = {
            name: document.getElementById('edit-name').value.trim(),
            role: document.getElementById('edit-role') ? document.getElementById('edit-role').value : (user.role || 'both'),
            hostel: document.getElementById('edit-hostel').value.trim(),
            roomNumber: document.getElementById('edit-room').value.trim(),
            department: document.getElementById('edit-dept').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            bio: document.getElementById('edit-bio').value.trim(),
            upiId: document.getElementById('edit-upi') ? document.getElementById('edit-upi').value.trim() : (user.upiId || '')
        };

        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                const data = await res.json();
                const newUser = data.user || data;
                Object.assign(user, newUser);
            } else {
                Object.assign(user, updatedData);
            }

            user.profileImage = getAvatarUrl(user);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Re-render UI and navbar
            renderUserProfile(user, true);
            const navAvatar = document.querySelector('.nav-avatar');
            if (navAvatar) navAvatar.src = getAvatarUrl(user);

            closeModal();
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            console.warn('Profile update error, saving locally:', err);
            Object.assign(user, updatedData);
            user.profileImage = getAvatarUrl(user);
            localStorage.setItem('user', JSON.stringify(user));
            renderUserProfile(user, true);
            const navAvatar = document.querySelector('.nav-avatar');
            if (navAvatar) navAvatar.src = getAvatarUrl(user);

            closeModal();
            showToast('Profile updated!', 'success');
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    });
}

function setupDeleteAccountModal() {
    const modal = document.getElementById('modal-delete-account');
    const openBtn = document.getElementById('delete-account-btn');
    const closeBtn = document.getElementById('close-delete-modal');
    const cancelBtn = document.getElementById('cancel-delete-modal-btn');
    const confirmBtn = document.getElementById('confirm-delete-account-btn');

    if (!modal) return;

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    confirmBtn?.addEventListener('click', async () => {
        const token = getToken();
        if (!token) {
            showToast('Authentication error. Please login again.', 'error');
            return;
        }

        const originalHtml = confirmBtn.innerHTML;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Deleting Account...';

        try {
            const res = await fetch(`${API_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Clear all stored auth, profile, and local listing caches
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('campusmart_token');
                localStorage.removeItem('campusmart_user');
                localStorage.removeItem('campusmart_user_listings');
                localStorage.removeItem('campusmart_listing_status_map');
                localStorage.removeItem('campusmart_relist_timestamps');
                localStorage.removeItem('campusmart_deleted_listings');
                localStorage.removeItem('campusmart_user_reviews');
                localStorage.removeItem('campusmart_favorites');
                localStorage.removeItem('favorites');

                closeModal();
                showToast('Your account and all associated listings have been permanently deleted.', 'success');

                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1200);
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(err.message || 'Failed to delete account. Please try again.', 'error');
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = originalHtml;
            }
        } catch (e) {
            console.error('Delete account error:', e);
            showToast('Network error while deleting account', 'error');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalHtml;
        }
    });
}

// ============================================
// Student Reviews & Ratings Management
// ============================================

async function loadUserReviews(user, isOwnProfile) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    try {
        const userId = user._id || user.id;
        let reviews = [];
        if (userId) {
            const res = await fetch(`${API_URL}/reviews/user/${userId}`);
            if (res.ok) {
                reviews = await res.json();
            }
        }

        // Update rating display in stats card
        const ratingEl = document.getElementById('stats-rating');
        if (ratingEl) {
            if (reviews && reviews.length > 0) {
                const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
                const avg = (total / reviews.length).toFixed(1);
                ratingEl.innerHTML = `${avg} <span style="font-size: 0.75rem; opacity: 0.85;">(${reviews.length})</span>`;
            } else if (user.rating && user.totalReviews) {
                ratingEl.innerHTML = `${Number(user.rating).toFixed(1)} <span style="font-size: 0.75rem; opacity: 0.85;">(${user.totalReviews})</span>`;
            } else {
                ratingEl.innerText = 'New';
            }
        }

        if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="empty-state text-center" style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 3.5rem 1.5rem; border: 1px solid var(--border);">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: #F59E0B; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.25rem;">
                        <i class="far fa-star"></i>
                    </div>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">No Reviews Yet</h3>
                    <p class="text-secondary" style="font-size: 0.9rem; max-width: 440px; margin: 0 auto;">
                        ${isOwnProfile 
                            ? 'Reviews and star ratings from campus peers will appear here after trades.' 
                            : 'This student has not received any peer reviews yet. Be the first to share your experience!'}
                    </p>
                </div>
            `;
            return;
        }

        const cardsHtml = reviews.map((r, i) => {
            const reviewerName = r.reviewer?.name || 'Campus Student';
            const reviewerAvatar = r.reviewer ? getAvatarUrl(r.reviewer) : 'https://ui-avatars.com/api/?name=Student&background=4F46E5&color=fff';
            const isReviewerAdmin = r.reviewer?.role === 'admin';
            const ratingVal = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
            
            const starsHtml = Array.from({ length: 5 }, (_, idx) => {
                const isFilled = idx < ratingVal;
                return `<i class="fas fa-star ${isFilled ? 'star-filled' : 'star-empty'}"></i>`;
            }).join('');

            const adminBadgeHtml = isReviewerAdmin
                ? `<span class="badge badge-danger" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; margin-left: 0.4rem; vertical-align: middle; display: inline-flex; align-items: center; gap: 0.25rem;"><i class="fas fa-shield-alt"></i> Admin</span>`
                : '';

            return `
                <div class="review-card animate-fade-in-up stagger-${(i % 5) + 1}">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <img src="${reviewerAvatar}" class="reviewer-avatar" alt="${escapeHtml(reviewerName)}">
                            <div>
                                <div class="reviewer-name" style="display: flex; align-items: center; flex-wrap: wrap;">${escapeHtml(reviewerName)}${adminBadgeHtml}</div>
                                <div class="reviewer-sub"><i class="far fa-clock"></i> ${formatDate(r.createdAt)}</div>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="stars" style="font-size: 0.95rem;">
                                ${starsHtml}
                            </div>
                            <span class="review-rating-pill">${ratingVal}.0</span>
                        </div>
                    </div>
                    <p class="review-comment">${escapeHtml(r.comment || '')}</p>
                </div>
            `;
        }).join('');

        reviewsList.innerHTML = cardsHtml;

    } catch (err) {
        console.warn('Error loading reviews:', err);
    }
}

function setupProfileReviewModal(user) {
    const starsPicker = document.getElementById('profile-stars-picker');
    const ratingInput = document.getElementById('profile-review-rating-val');
    const form = document.getElementById('form-profile-review');

    if (starsPicker) {
        const stars = starsPicker.querySelectorAll('i');
        let currentSelectedRating = 5;

        const renderPickerStars = (val) => {
            stars.forEach(s => {
                const sRating = parseInt(s.dataset.rating, 10);
                if (sRating <= val) {
                    s.style.color = '#F59E0B';
                } else {
                    s.style.color = '#CBD5E1';
                }
            });
        };

        const setSelectedRating = (val) => {
            currentSelectedRating = val;
            if (ratingInput) ratingInput.value = String(val);
            renderPickerStars(val);
        };

        setSelectedRating(5);

        stars.forEach(s => {
            s.addEventListener('click', () => {
                const clickedRating = parseInt(s.dataset.rating, 10);
                setSelectedRating(clickedRating);
            });
            s.addEventListener('mouseenter', () => {
                const hoverRating = parseInt(s.dataset.rating, 10);
                renderPickerStars(hoverRating);
            });
        });

        starsPicker.addEventListener('mouseleave', () => {
            renderPickerStars(currentSelectedRating);
        });
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            showToast('Please login to submit a review', 'warning');
            setTimeout(() => { window.location.href = '/login.html'; }, 1000);
            return;
        }

        const rating = parseInt(ratingInput?.value || '5', 10);
        const comment = (document.getElementById('profile-review-comment')?.value || '').trim();
        const submitBtn = document.getElementById('btn-submit-profile-review');

        if (!comment) {
            showToast('Please write some feedback comment', 'warning');
            return;
        }

        const revieweeId = user._id || user.id;
        const loggedUser = getUser();
        if (loggedUser && (loggedUser._id === revieweeId || loggedUser.id === revieweeId)) {
            showToast('You cannot review yourself', 'warning');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    revieweeId,
                    rating,
                    comment
                })
            });

            if (res.ok) {
                showToast(`Review submitted! Rated ${rating}★ for ${user.name || 'student'}.`, 'success');
                closeProfileReviewModal();
                form.reset();
                if (starsPicker) {
                    const stars = starsPicker.querySelectorAll('i');
                    stars.forEach(s => s.style.color = '#F59E0B');
                    if (ratingInput) ratingInput.value = '5';
                }
                await loadUserReviews(user, false);
            } else {
                const err = await res.json();
                showToast(err.message || 'Could not submit review', 'error');
            }
        } catch (err) {
            showToast('Network error while submitting review', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Submit Review';
        }
    });
}

window.openProfileReviewModal = function() {
    const modal = document.getElementById('modal-profile-review');
    if (modal) modal.classList.add('active');
};

window.closeProfileReviewModal = function() {
    const modal = document.getElementById('modal-profile-review');
    if (modal) modal.classList.remove('active');
};


