// ============================================
// CampusMart — Offers & Deal Negotiations
// ============================================

let currentOffersTab = 'sent';
let sentOffersData = [];
let receivedOffersData = [];
let pendingAcceptOfferId = null;

document.addEventListener('DOMContentLoaded', () => {
    protectPage();

    loadSentOffers();
    loadReceivedOffers();

    // Check URL parameters for default tab
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'received') {
        switchOffersTab('received');
    }

    // Copy UPI ID button handler
    document.getElementById('btn-copy-upi')?.addEventListener('click', () => {
        const vpa = document.getElementById('upi-modal-vpa')?.innerText;
        if (vpa) {
            navigator.clipboard.writeText(vpa).then(() => {
                showToast('UPI ID copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Could not copy UPI ID', 'warning');
            });
        }
    });

    // Handle Counter Offer Form Submission
    document.getElementById('form-submit-counter')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const offerId = document.getElementById('counter-offer-id').value;
        const amount = document.getElementById('counter-amount-input').value.trim();
        const message = document.getElementById('counter-message-input').value.trim();

        if (!offerId || !amount) return;

        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/offers/${offerId}/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'countered',
                    counterAmount: Number(amount),
                    counterMessage: message
                })
            });

            if (res.ok) {
                closeModal('modal-counter-offer');
                showToast('Counter offer sent! Buyer notified via email.', 'success');
                loadReceivedOffers();
                loadSentOffers();
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to send counter offer', 'error');
            }
        } catch (err) {
            showToast('Network error while responding', 'error');
        }
    });

    // Handle Seller UPI Setup & Accept
    document.getElementById('form-save-seller-upi')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const upiVal = document.getElementById('seller-upi-input').value.trim();
        if (!upiVal || !pendingAcceptOfferId) return;

        try {
            const token = getToken();
            // Save UPI ID to profile
            await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ upiId: upiVal })
            });

            // Update user in local storage
            const curUser = getUser() || {};
            curUser.upiId = upiVal;
            localStorage.setItem('user', JSON.stringify(curUser));

            closeModal('modal-seller-upi-setup');

            // Now complete accepting the offer
            await executeAcceptOffer(pendingAcceptOfferId);
        } catch (err) {
            showToast('Error saving UPI ID', 'error');
        }
    });
});

// Switch Between Sent & Received Tabs
function switchOffersTab(tabName) {
    currentOffersTab = tabName;
    const tabSent = document.getElementById('tab-sent');
    const tabReceived = document.getElementById('tab-received');
    const secSent = document.getElementById('section-sent-offers');
    const secReceived = document.getElementById('section-received-offers');

    if (tabName === 'sent') {
        tabSent.classList.add('active');
        tabReceived.classList.remove('active');
        secSent.style.display = 'block';
        secReceived.style.display = 'none';
    } else {
        tabSent.classList.remove('active');
        tabReceived.classList.add('active');
        secSent.style.display = 'none';
        secReceived.style.display = 'block';
    }
}

// ----------------------------------------------------
// 1. Load Offers Sent (As Buyer)
// ----------------------------------------------------
async function loadSentOffers() {
    const grid = document.getElementById('grid-sent-offers');
    const badge = document.getElementById('badge-sent-count');
    if (!grid) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/my-offers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Could not load sent offers');

        const offers = await res.json();
        sentOffersData = Array.isArray(offers) ? offers : [];

        if (badge) badge.innerText = sentOffersData.length;

        if (sentOffersData.length === 0) {
            renderEmptySentOffers(grid);
            return;
        }

        grid.innerHTML = sentOffersData.map((offer, i) => {
            const product = offer.product || {};
            const seller = offer.seller || {};
            const imageUrl = (product.images && product.images.length > 0)
                ? product.images[0]
                : 'https://via.placeholder.com/400x300?text=Item';

            const statusBadge = getStatusBadgeHTML(offer.status, offer.counterAmount);
            const isAccepted = offer.status === 'accepted';
            const isCountered = offer.status === 'countered';
            const isCompleted = offer.status === 'completed';

            return `
                <div class="card stagger-${(i % 5) + 1} animate-fade-in-up" style="border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--border); box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);">
                    <!-- Top Item Summary -->
                    <div style="display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.15rem; border-bottom: 1px solid var(--border); background: #ffffff;">
                        <img src="${imageUrl}" alt="${escapeHtml(product.title || 'Item')}" style="width: 68px; height: 68px; border-radius: 12px; object-fit: cover; border: 1px solid var(--border); flex-shrink: 0;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                                <span class="badge badge-primary" style="font-size: 0.68rem; padding: 0.15rem 0.55rem;">${escapeHtml(product.category || 'Listing')}</span>
                                <span class="text-xs text-secondary">Listed: <strong style="color: var(--text-primary);">${formatPrice(product.price || 0)}</strong></span>
                            </div>
                            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <a href="/product-detail.html?id=${product._id}" style="color: inherit; text-decoration: none;">
                                    ${escapeHtml(product.title || 'Product Listing')}
                                </a>
                            </h4>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div style="padding: 1.15rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: #F8FAFC;">
                        <div>
                            <!-- Offer Amount + Status Row -->
                            <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 0.85rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span class="text-xs text-secondary font-bold" style="text-transform: uppercase; letter-spacing: 0.04em;">Your Offer</span>
                                    <span style="font-size: 1.35rem; font-weight: 800; color: #4F46E5; line-height: 1;">
                                        ${formatPrice(offer.amount)}
                                    </span>
                                </div>
                                <div>${statusBadge}</div>
                            </div>

                            <!-- Seller Info Box -->
                            <div style="background: #ffffff; padding: 0.75rem 0.9rem; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 0.75rem;">
                                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 0.45rem;">
                                    <i class="fas fa-store text-primary-color"></i>
                                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Seller: ${escapeHtml(seller.name || 'Campus Student')}</span>
                                </div>
                                ${seller.email ? `
                                    <div class="text-xs text-secondary" style="display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        <i class="far fa-envelope" style="flex-shrink: 0;"></i>
                                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(seller.email)}</span>
                                    </div>
                                ` : ''}
                            </div>

                            ${offer.message ? `
                                <div style="font-size: 0.82rem; color: #475569; background: #ffffff; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 0.75rem;">
                                    <strong>Your Note:</strong> "${escapeHtml(offer.message)}"
                                </div>
                            ` : ''}

                            ${isCountered && offer.counterMessage ? `
                                <div style="font-size: 0.82rem; color: #92400E; background: #FEF3C7; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid #FDE68A; margin-bottom: 0.75rem;">
                                    <strong>Seller's Counter Note:</strong> "${escapeHtml(offer.counterMessage)}"
                                </div>
                            ` : ''}
                        </div>

                        <!-- Action Buttons based on status -->
                        <div style="margin-top: 0.5rem; padding-top: 0.85rem; border-top: 1px dashed var(--border);">
                            ${isAccepted ? `
                                <button type="button" class="btn btn-secondary w-full justify-center mb-2" onclick="openUpiPaymentModal('${offer._id}', 'sent')" style="font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                                    <i class="fas fa-qrcode mr-1"></i> Pay ₹${Number(offer.amount).toLocaleString('en-IN')} via UPI
                                </button>
                            ` : ''}

                            ${isCompleted ? `
                                <div style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 0.55rem 0.75rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; text-align: center; margin-bottom: 0.65rem;">
                                    <i class="fas fa-check-double mr-1"></i> Deal Completed & Payment Made
                                </div>
                            ` : ''}

                            ${isCountered ? `
                                <div class="flex gap-2 mb-2">
                                    <button type="button" class="btn btn-secondary btn-sm flex-1 justify-center" onclick="acceptCounterOffer('${offer._id}', ${offer.counterAmount})" style="font-weight: 700;">
                                        <i class="fas fa-check mr-1"></i> Accept ₹${Number(offer.counterAmount).toLocaleString('en-IN')}
                                    </button>
                                </div>
                            ` : ''}

                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                                <a href="/chat.html?sellerId=${seller._id || ''}&seller=${encodeURIComponent(seller.name || 'Seller')}&productId=${product._id || ''}&product=${encodeURIComponent(product.title || 'Item')}" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; text-decoration: none;">
                                    <i class="fas fa-comment-dots"></i> Chat with Seller
                                </a>
                                <button type="button" onclick="deleteOfferById('${offer._id}')" class="btn btn-ghost btn-sm text-danger" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px;" title="Withdraw and delete this offer">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error fetching sent offers:', err);
        grid.innerHTML = `<div class="p-4 text-center text-danger">Failed to load offers: ${err.message}</div>`;
    }
}

// ----------------------------------------------------
// 2. Load Offers Received (As Seller)
// ----------------------------------------------------
async function loadReceivedOffers() {
    const grid = document.getElementById('grid-received-offers');
    const badge = document.getElementById('badge-received-count');
    if (!grid) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/received`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Could not load received offers');

        const offers = await res.json();
        receivedOffersData = Array.isArray(offers) ? offers : [];

        // Count pending
        const pendingCount = receivedOffersData.filter(o => o.status === 'pending').length;
        if (badge) {
            badge.innerText = pendingCount > 0 ? `${pendingCount} new` : receivedOffersData.length;
            if (pendingCount > 0) badge.classList.add('pulse');
        }

        if (receivedOffersData.length === 0) {
            renderEmptyReceivedOffers(grid);
            return;
        }

        grid.innerHTML = receivedOffersData.map((offer, i) => {
            const product = offer.product || {};
            const buyer = offer.buyer || {};
            const imageUrl = (product.images && product.images.length > 0)
                ? product.images[0]
                : 'https://via.placeholder.com/400x300?text=Item';

            const isPending = offer.status === 'pending';
            const isAccepted = offer.status === 'accepted';
            const isCompleted = offer.status === 'completed';
            const statusBadge = getStatusBadgeHTML(offer.status, offer.counterAmount);

            return `
                <div class="card stagger-${(i % 5) + 1} animate-fade-in-up" style="border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--border); box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);">
                    <!-- Top Item Summary -->
                    <div style="display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.15rem; border-bottom: 1px solid var(--border); background: #ffffff;">
                        <img src="${imageUrl}" alt="${escapeHtml(product.title || 'Item')}" style="width: 68px; height: 68px; border-radius: 12px; object-fit: cover; border: 1px solid var(--border); flex-shrink: 0;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                                <span class="badge badge-primary" style="font-size: 0.68rem; padding: 0.15rem 0.55rem;">Your Item</span>
                                <span class="text-xs text-secondary">Listed: <strong style="color: var(--text-primary);">${formatPrice(product.price || 0)}</strong></span>
                            </div>
                            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <a href="/product-detail.html?id=${product._id}" style="color: inherit; text-decoration: none;">
                                    ${escapeHtml(product.title || 'Product Listing')}
                                </a>
                            </h4>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div style="padding: 1.15rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: #F8FAFC;">
                        <div>
                            <!-- Buyer's Bid + Status Box -->
                            <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 0.85rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span class="text-xs text-secondary font-bold" style="text-transform: uppercase; letter-spacing: 0.04em;">Buyer's Bid</span>
                                    <span style="font-size: 1.35rem; font-weight: 800; color: #10B981; line-height: 1;">
                                        ${formatPrice(offer.amount)}
                                    </span>
                                </div>
                                <div>${statusBadge}</div>
                            </div>

                            <!-- Buyer Details Card -->
                            <div style="background: #ffffff; padding: 0.8rem 0.95rem; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 0.75rem;">
                                <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.45rem;">
                                    <i class="fas fa-user-graduate text-primary-color" style="flex-shrink: 0;"></i>
                                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(buyer.name || 'Student')}</span>
                                </div>
                                <div class="text-xs text-secondary" style="display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    <i class="far fa-envelope" style="flex-shrink: 0;"></i>
                                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(buyer.phone || buyer.email || 'Campus Chat')}</span>
                                </div>
                                ${offer.message ? `
                                    <div style="font-size: 0.82rem; color: #475569; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--border);">
                                        "${escapeHtml(offer.message)}"
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Actions for Seller -->
                        <div style="margin-top: 0.5rem; padding-top: 0.85rem; border-top: 1px dashed var(--border);">
                            ${isPending ? `
                                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem;">
                                    <button type="button" class="btn btn-secondary btn-sm justify-center" onclick="handleSellerAcceptOffer('${offer._id}')" style="font-weight: 700; border-radius: 8px; padding: 0.45rem 0.6rem;">
                                        <i class="fas fa-check"></i> Accept
                                    </button>
                                    <button type="button" class="btn btn-outline btn-sm justify-center" onclick="openCounterModal('${offer._id}', ${product.price || offer.amount})" style="font-weight: 700; border-radius: 8px; padding: 0.45rem 0.6rem;">
                                        <i class="fas fa-exchange-alt"></i> Counter
                                    </button>
                                    <button type="button" class="btn btn-outline btn-sm justify-center text-danger" onclick="respondToOfferAction('${offer._id}', 'rejected')" title="Decline offer" style="font-weight: 700; border-radius: 8px; padding: 0.45rem 0.65rem; border-color: #FCA5A5; color: #DC2626; background: #FEF2F2;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            ` : ''}

                            ${isAccepted ? `
                                <div style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-align: center; margin-bottom: 0.5rem;">
                                    <i class="fas fa-check-circle mr-1"></i> Offer Accepted! Buyer can scan your UPI to pay.
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm w-full justify-center mb-2" onclick="markOfferPaymentCompleted('${offer._id}')" style="font-weight: 700; border-radius: 8px;">
                                    <i class="fas fa-check-double mr-1"></i> Confirm Payment & Complete Deal
                                </button>
                            ` : ''}

                            ${isCompleted ? `
                                <div style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 0.55rem 0.75rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; text-align: center; margin-bottom: 0.65rem;">
                                    <i class="fas fa-check-double mr-1"></i> Deal Completed & Payment Received
                                </div>
                            ` : ''}

                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                                <a href="/chat.html?sellerId=${buyer._id || ''}&seller=${encodeURIComponent(buyer.name || 'Buyer')}&productId=${product._id || ''}&product=${encodeURIComponent(product.title || 'Item')}" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; text-decoration: none;">
                                    <i class="fas fa-comment-dots"></i> Chat with Buyer
                                </a>
                                <button type="button" onclick="deleteOfferById('${offer._id}')" class="btn btn-ghost btn-sm text-danger" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px;" title="Remove this offer">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error fetching received offers:', err);
        grid.innerHTML = `<div class="p-4 text-center text-danger">Failed to load received offers: ${err.message}</div>`;
    }
}

// ----------------------------------------------------
// 3. Dynamic UPI Payment QR Code Generator
// ----------------------------------------------------
async function openUpiPaymentModal(offerId, source = 'sent') {
    const list = source === 'sent' ? sentOffersData : receivedOffersData;
    const offer = list.find(o => String(o._id) === String(offerId));
    if (!offer) {
        showToast('Offer details not found', 'warning');
        return;
    }

    const amount = Number(offer.counterAmount || offer.amount);
    const seller = offer.seller || {};
    const product = offer.product || {};

    const sellerName = seller.name || 'CampusMart Seller';
    const hasCustomQr = Boolean(seller.upiQrImage && seller.upiQrImage.trim() !== '');
    const productTitle = product.title || 'Campus Purchase';

    // Populate top amount & item title
    document.getElementById('upi-modal-amount').innerText = `₹${amount.toLocaleString('en-IN')}`;
    document.getElementById('upi-modal-item-title').innerText = productTitle;

    // 1. Get seller's UPI ID: either from seller.upiId or decoded directly from seller.upiQrImage!
    let sellerVpa = (seller.upiId && seller.upiId.trim()) ? seller.upiId.trim() : '';
    if (!sellerVpa && hasCustomQr) {
        const rawQr = await decodeSellerQrImage(seller.upiQrImage);
        sellerVpa = extractVpaFromQrString(rawQr);
        if (sellerVpa) {
            seller.upiId = sellerVpa;
        }
    }

    const hasRealVpa = Boolean(sellerVpa && sellerVpa !== '');
    const availableSection = document.getElementById('upi-available-section');
    const missingSection = document.getElementById('upi-missing-section');
    const chatSellerLink = document.getElementById('upi-chat-seller-link');
    const confirmPaidBtn = document.getElementById('btn-confirm-upi-paid');
    const confirmDirectPaidBtn = document.getElementById('btn-confirm-direct-paid');

    if (confirmPaidBtn) {
        confirmPaidBtn.onclick = () => markOfferPaymentCompleted(offer._id);
    }
    if (confirmDirectPaidBtn) {
        confirmDirectPaidBtn.onclick = () => markOfferPaymentCompleted(offer._id);
    }

    // If seller has NEITHER uploaded a QR image NOR added a UPI ID, show "Seller has not given QR, contact through chat"
    if (!hasRealVpa && !hasCustomQr) {
        if (availableSection) availableSection.style.display = 'none';
        if (missingSection) missingSection.style.display = 'block';
        if (chatSellerLink) {
            chatSellerLink.href = `/chat.html?sellerId=${seller._id || ''}&seller=${encodeURIComponent(sellerName)}&productId=${product._id || ''}&product=${encodeURIComponent(productTitle)}`;
        }
        document.getElementById('modal-upi-qr')?.classList.add('active');
        return;
    }

    if (availableSection) availableSection.style.display = 'block';
    if (missingSection) missingSection.style.display = 'none';

    const vpaBox = document.getElementById('upi-vpa-box');
    const mobileLink = document.getElementById('upi-mobile-pay-link');
    const qrImgEl = document.getElementById('upi-qr-image');
    const modeBadge = document.getElementById('upi-qr-mode-badge');
    const toggleBtn = document.getElementById('btn-toggle-qr-mode');

    // Build standard NPCI UPI Intent URI with the exact custom offer amount (e.g. ₹300) locked in (&am=300)
    const upiUri = hasRealVpa
        ? `upi://pay?pa=${encodeURIComponent(sellerVpa)}&pn=${encodeURIComponent(sellerName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('CampusMart - ' + productTitle)}`
        : '#';
    const dynamicAmountQrUrl = hasRealVpa
        ? `https://quickchart.io/qr?text=${encodeURIComponent(upiUri)}&size=240&ecLevel=H&margin=2`
        : '';

    if (hasRealVpa) {
        document.getElementById('upi-modal-vpa').innerText = sellerVpa;
        if (vpaBox) vpaBox.style.display = 'flex';
        if (mobileLink) {
            mobileLink.href = upiUri;
            mobileLink.style.display = 'inline-flex';
        }
    } else {
        if (vpaBox) vpaBox.style.display = 'none';
        if (mobileLink) mobileLink.style.display = 'none';
    }

    // Default to Dynamic Custom-Amount QR whenever we have the seller's VPA (including extracted from their uploaded QR!)
    let showingDynamicAmountQr = hasRealVpa;

    const renderModalQrState = () => {
        if (!qrImgEl) return;
        if (showingDynamicAmountQr && hasRealVpa) {
            qrImgEl.src = dynamicAmountQrUrl;
            if (modeBadge) {
                modeBadge.style.display = 'inline-block';
                modeBadge.style.background = '#ECFDF5';
                modeBadge.style.color = '#059669';
                modeBadge.style.borderColor = '#A7F3D0';
                modeBadge.innerHTML = `<i class="fas fa-bolt mr-1"></i> ₹${amount.toLocaleString('en-IN')} Custom Amount QR`;
            }
            if (toggleBtn && hasCustomQr) {
                toggleBtn.style.display = 'inline-flex';
                toggleBtn.innerHTML = `<i class="fas fa-image mr-1"></i> View Seller's Original Uploaded QR`;
            } else if (toggleBtn) {
                toggleBtn.style.display = 'none';
            }
        } else {
            qrImgEl.src = seller.upiQrImage;
            if (modeBadge) {
                modeBadge.style.display = 'inline-block';
                modeBadge.style.background = '#EFF6FF';
                modeBadge.style.color = '#1D4ED8';
                modeBadge.style.borderColor = '#BFDBFE';
                modeBadge.innerHTML = `<i class="fas fa-qrcode mr-1"></i> Seller's Uploaded QR (Enter ₹${amount.toLocaleString('en-IN')} in app)`;
            }
            if (toggleBtn && hasRealVpa) {
                toggleBtn.style.display = 'inline-flex';
                toggleBtn.innerHTML = `<i class="fas fa-bolt mr-1"></i> Switch to Dynamic ₹${amount.toLocaleString('en-IN')} QR`;
            } else if (toggleBtn) {
                toggleBtn.style.display = 'none';
            }
        }
    };

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            showingDynamicAmountQr = !showingDynamicAmountQr;
            renderModalQrState();
        };
    }

    renderModalQrState();

    // Open Modal
    document.getElementById('modal-upi-qr')?.classList.add('active');
}

// Mark an accepted offer's payment & deal as completed
async function markOfferPaymentCompleted(offerId) {
    if (!confirm('Confirm that payment has been completed for this deal? This will mark the trade as completed and the item as sold.')) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/${offerId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'completed' })
        });

        if (res.ok) {
            closeModal('modal-upi-qr');
            showToast('🎉 Payment confirmed! Deal marked as completed.', 'success');
            loadSentOffers();
            loadReceivedOffers();
        } else {
            const data = await res.json();
            showToast(data.message || 'Could not mark payment as completed', 'error');
        }
    } catch (e) {
        showToast('Network error while completing deal', 'error');
    }
}

// ----------------------------------------------------
// 4. Seller Actions on Received Offers
// ----------------------------------------------------
function handleSellerAcceptOffer(offerId) {
    const currentUser = getUser() || {};
    const hasUpiId = Boolean(currentUser.upiId && currentUser.upiId.trim() !== '');
    const hasQrImg = Boolean(currentUser.upiQrImage && currentUser.upiQrImage.trim() !== '');

    // If seller has neither a custom QR image nor a UPI ID saved in profile yet, ask them to provide one first!
    if (!hasUpiId && !hasQrImg) {
        pendingAcceptOfferId = offerId;
        document.getElementById('modal-seller-upi-setup')?.classList.add('active');
        return;
    }

    executeAcceptOffer(offerId);
}

async function executeAcceptOffer(offerId) {
    if (!confirm('Accept this offer? The buyer will be notified via email to scan your UPI code and pay.')) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/${offerId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'accepted' })
        });

        if (res.ok) {
            showToast('🎉 Offer accepted! Buyer notified via email.', 'success');
            loadReceivedOffers();
            loadSentOffers();
        } else {
            const data = await res.json();
            showToast(data.message || 'Could not accept offer', 'error');
        }
    } catch (e) {
        showToast('Network error while accepting offer', 'error');
    }
}

function openCounterModal(offerId, currentPrice) {
    document.getElementById('counter-offer-id').value = offerId;
    const input = document.getElementById('counter-amount-input');
    input.value = currentPrice || '';
    document.getElementById('modal-counter-offer')?.classList.add('active');
    setTimeout(() => input.focus(), 200);
}

async function respondToOfferAction(offerId, status) {
    if (!confirm(`Are you sure you want to decline this offer?`)) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/${offerId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            showToast('Offer declined', 'info');
            loadReceivedOffers();
        } else {
            const data = await res.json();
            showToast(data.message || 'Action failed', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
}

// Buyer accepts a counter-offer
async function acceptCounterOffer(offerId, counterAmount) {
    if (!confirm(`Accept the counter offer of ₹${Number(counterAmount).toLocaleString('en-IN')}?`)) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/${offerId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'accepted' })
        });

        if (res.ok) {
            showToast('Counter offer accepted! You can now pay via UPI.', 'success');
            loadSentOffers();
        } else {
            const data = await res.json();
            showToast(data.message || 'Could not accept counter offer', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
}

// Delete / Withdraw an Offer
async function deleteOfferById(offerId) {
    if (!confirm('Are you sure you want to withdraw and delete this offer?')) return;

    try {
        const token = getToken();
        const res = await fetch(`${API_URL}/offers/${offerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            showToast('Offer deleted successfully', 'info');
            loadSentOffers();
            loadReceivedOffers();
            if (typeof updateNavbarUnreadIndicator === 'function') {
                updateNavbarUnreadIndicator();
            }
        } else {
            const data = await res.json();
            showToast(data.message || 'Could not delete offer', 'error');
        }
    } catch (e) {
        showToast('Network error while deleting offer', 'error');
    }
}

// ----------------------------------------------------
// UI Helpers
// ----------------------------------------------------
function getStatusBadgeHTML(status, counterAmount) {
    switch (status) {
        case 'pending':
            return `<span class="badge badge-warning" style="font-size: 0.75rem;"><i class="fas fa-clock mr-1"></i> Pending Seller Review</span>`;
        case 'accepted':
            return `<span class="badge badge-success" style="font-size: 0.75rem;"><i class="fas fa-check-circle mr-1"></i> Offer Accepted!</span>`;
        case 'completed':
            return `<span class="badge badge-success" style="font-size: 0.75rem;"><i class="fas fa-check-double mr-1"></i> Deal Completed & Paid</span>`;
        case 'countered':
            return `<span class="badge badge-info" style="font-size: 0.75rem;"><i class="fas fa-exchange-alt mr-1"></i> Countered at ₹${Number(counterAmount).toLocaleString('en-IN')}</span>`;
        case 'rejected':
            return `<span class="badge badge-danger" style="font-size: 0.75rem;"><i class="fas fa-times-circle mr-1"></i> Declined</span>`;
        default:
            return `<span class="badge badge-primary" style="font-size: 0.75rem;">${status}</span>`;
    }
}

function renderEmptySentOffers(container) {
    container.innerHTML = `
        <div class="empty-state w-full" style="grid-column: 1 / -1; background: white; border-radius: var(--radius-xl); padding: 4rem 1.5rem; border: 1px solid var(--border); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #EEF2FF; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.25rem;">
                <i class="fas fa-paper-plane" style="line-height: 1; margin: 0;"></i>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">No Offers Sent Yet</h3>
            <p class="text-secondary" style="font-size: 0.92rem; margin-bottom: 1.75rem; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                When you browse items on CampusMart, click "Make an Offer" to negotiate a student deal. Your offers will show up here!
            </p>
            <a href="/products.html" class="btn btn-primary btn-sm" style="font-weight: 600; padding: 0.55rem 1.25rem; font-size: 0.9rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                <i class="fas fa-compass" style="font-size: 0.95rem; margin: 0;"></i>
                <span>Explore Campus Listings</span>
            </a>
        </div>
    `;
}

function renderEmptyReceivedOffers(container) {
    container.innerHTML = `
        <div class="empty-state w-full" style="grid-column: 1 / -1; background: white; border-radius: var(--radius-xl); padding: 4rem 1.5rem; border: 1px solid var(--border); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.25rem;">
                <i class="fas fa-inbox" style="line-height: 1; margin: 0;"></i>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">No Offers Received Yet</h3>
            <p class="text-secondary" style="font-size: 0.92rem; margin-bottom: 1.75rem; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                When students make an offer on your listings, they will appear here with instant notifications. You will be able to accept, counter, or decline!
            </p>
            <a href="/create-listing.html" class="btn btn-primary btn-sm" style="font-weight: 600; padding: 0.55rem 1.25rem; font-size: 0.9rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                <i class="fas fa-plus" style="font-size: 0.95rem; margin: 0;"></i>
                <span>Post an Item for Sale</span>
            </a>
        </div>
    `;
}

