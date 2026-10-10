let currentProductId = null;

function renderItemNotAvailable() {
    document.title = 'Item Not Available - CampusMart';
    const container = document.querySelector('.product-detail');
    if (!container) return;

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <a href="/products.html" class="btn btn-ghost" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-arrow-left"></i> Back to Browse
            </a>
        </div>
        <div style="max-width: 620px; margin: 3rem auto; padding: 3.5rem 2rem; background: white; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center;">
            <div style="width: 88px; height: 88px; margin: 0 auto 1.5rem; background: #FEE2E2; color: #EF4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.4rem; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.15);">
                <i class="fas fa-box-open"></i>
            </div>
            <h1 style="font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem;">Item Not Available</h1>
            <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2rem; max-width: 460px; margin-left: auto; margin-right: auto;">
                This item is currently not listed, marked as sold, or no longer available on CampusMart.
            </p>
            <div class="flex items-center justify-center gap-3" style="flex-wrap: wrap;">
                <a href="/products.html" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 10px;">
                    <i class="fas fa-store mr-2"></i> Browse Marketplace
                </a>
                <a href="/my-listings.html" class="btn btn-outline" style="padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 10px;">
                    <i class="fas fa-boxes mr-2"></i> My Listings
                </a>
                <a href="/index.html" class="btn btn-ghost" style="padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 10px;">
                    <i class="fas fa-home mr-2"></i> Home
                </a>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        renderItemNotAvailable();
        return;
    }

    const statusMap = (typeof getSavedStatusMap === 'function') ? getSavedStatusMap() : {};
    const deletedListings = (typeof getDeletedListings === 'function') ? getDeletedListings() : [];

    // If marked as deleted or explicitly sold in statusMap
    if (deletedListings.includes(String(productId)) || statusMap[String(productId)] === 'sold') {
        renderItemNotAvailable();
        return;
    }

    let product = null;

    if (productId.length === 24) {
        try {
            const res = await fetch(`${API_URL}/products/${productId}`);
            if (res.ok) {
                product = await res.json();
            }
        } catch (err) {
            console.warn('Could not fetch from API:', err);
        }
    }

    // Check local user listings & demo listings
    if (!product) {
        const userListings = (typeof getLocalUserListings === 'function') ? getLocalUserListings() : [];
        const demoListings = (typeof getInitialDemoListings === 'function') ? getInitialDemoListings() : [];
        const found = [...userListings, ...demoListings].find(p => String(p._id || p.id) === String(productId));
        if (found) {
            product = { ...found };
        }
    }

    // If not found anywhere, show "Item Not Available"
    if (!product) {
        renderItemNotAvailable();
        return;
    }

    // Check effective status (must be available)
    const effectiveStatus = statusMap[String(productId)] || product.status || 'available';
    if (effectiveStatus !== 'available') {
        renderItemNotAvailable();
        return;
    }

    if (GLOBAL_PROFANITY_REGEX.test(product.title || '') || GLOBAL_PROFANITY_REGEX.test(product.description || '')) {
        renderItemNotAvailable();
        return;
    }

    currentProductId = product._id || productId;

    // Initialize favorite button state
    const favBtn = document.getElementById('btn-fav');
    if (favBtn) {
        const isFav = isProductFavorited(currentProductId);
        favBtn.classList.toggle('active', isFav);
        const icon = favBtn.querySelector('i');
        if (icon) {
            icon.className = isFav ? 'fas fa-heart text-danger' : 'far fa-heart';
        }
    }

    // Populate DOM
    const titleEl = document.getElementById('product-title');
    if (titleEl) {
        titleEl.innerText = product.title;
        titleEl.classList.remove('skeleton-text', 'lg');
    }
    
    const priceEl = document.getElementById('product-price');
    if (priceEl) {
        priceEl.innerText = formatPrice(product.price);
        priceEl.classList.remove('skeleton-text', 'sm');
    }
    
    const descEl = document.getElementById('product-desc');
    if (descEl) descEl.innerText = product.description;
    
    const cleanHostel = (raw) => (raw || '').replace(/[•,\-\s]*room\s*[a-z0-9\-]+/i, '').trim();
    const safeHostel = cleanHostel(product.seller?.hostel || product.hostel);

    const badgesEl = document.getElementById('product-badges');
    if (badgesEl) {
        badgesEl.innerHTML = `
            <span class="badge badge-primary"><i class="fas fa-tag"></i> ${product.category}</span>
            <span class="badge badge-success"><i class="fas fa-certificate"></i> ${formatCondition(product.condition)}</span>
            ${safeHostel ? `<span class="badge badge-info"><i class="fas fa-hotel"></i> ${safeHostel}</span>` : ''}
        `;
    }

    const sellerNameEl = document.getElementById('seller-name');
    if (sellerNameEl) sellerNameEl.innerText = product.seller?.name || 'Campus Student';

    const sellerCollegeEl = document.getElementById('seller-college');
    if (sellerCollegeEl) {
        sellerCollegeEl.innerText = product.seller?.college || 'VIT Bhopal University';
    }

    const sellerHostelEl = document.getElementById('seller-hostel');
    if (sellerHostelEl) {
        sellerHostelEl.innerText = safeHostel || 'Hostel Resident';
    }

    const sellerAvatar = document.getElementById('seller-avatar');
    if (sellerAvatar) {
        const sName = product.seller?.name || 'Student';
        sellerAvatar.src = product.seller?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(sName)}&background=4F46E5&color=fff&size=100&bold=true`;
        sellerAvatar.classList.remove('skeleton');
    }

    const locEl = document.getElementById('highlight-location');
    if (locEl) {
        locEl.innerText = safeHostel || 'Boys Hostel / Campus Gate';
    }

    const negEl = document.getElementById('highlight-negotiable');
    if (negEl) {
        negEl.innerText = product.negotiable !== false ? 'Accepting student offers' : 'Fixed Price';
    }

    // Photo Slider Initialization
    const images = (product.images && product.images.length > 0) ? product.images : ['https://via.placeholder.com/800x600?text=No+Photo'];
    initPhotoSlider(images);

    // Button actions
    const startChatWithSeller = () => {
        if (!isLoggedIn()) {
            showToast('Please login to chat with seller', 'warning');
            setTimeout(() => { window.location.href = '/login.html'; }, 1000);
            return;
        }
        const sName = product.seller?.name || 'Campus Peer';
        const sId = product.seller?._id || product.seller;
        const pTitle = product.title || 'Campus Item';
        const pId = product._id || currentProductId;

        const me = getUser();
        if (me && sId && (me._id === sId || me.id === sId)) {
            showToast('You cannot chat with yourself on your own listing', 'warning');
            return;
        }

        window.location.href = `/chat.html?sellerId=${encodeURIComponent(sId || '')}&seller=${encodeURIComponent(sName)}&productId=${encodeURIComponent(pId || '')}&product=${encodeURIComponent(pTitle)}`;
    };

    document.getElementById('btn-chat')?.addEventListener('click', startChatWithSeller);
    document.getElementById('btn-seller-profile-chat')?.addEventListener('click', startChatWithSeller);

    // Make an Offer Action
    const offerBtn = document.getElementById('btn-make-offer');
    const offerModal = document.getElementById('modal-offer');
    const offerForm = document.getElementById('form-make-offer');

    const sId = product.seller?._id || product.seller;
    const me = getUser();
    const isOwner = Boolean(me && sId && (me._id === sId || me.id === sId));

    if (isOwner && offerBtn) {
        offerBtn.style.display = 'none';
    }

    offerBtn?.addEventListener('click', () => {
        if (!isLoggedIn()) {
            showToast('Please login to make an offer', 'warning');
            setTimeout(() => { window.location.href = '/login.html'; }, 1000);
            return;
        }
        if (isOwner) {
            showToast('You cannot make an offer on your own listing', 'warning');
            return;
        }

        // Populate modal data
        document.getElementById('modal-offer-product-title').innerText = product.title || 'Product';
        document.getElementById('modal-offer-product-price').innerText = formatPrice(product.price);

        const priceNum = Number(product.price) || 0;
        const p10 = Math.max(1, Math.round(priceNum * 0.9));
        const p15 = Math.max(1, Math.round(priceNum * 0.85));
        const p20 = Math.max(1, Math.round(priceNum * 0.8));

        const amountInput = document.getElementById('offer-amount-input');
        amountInput.value = p10; // default preset

        const btn10 = document.getElementById('preset-10');
        const btn15 = document.getElementById('preset-15');
        const btn20 = document.getElementById('preset-20');

        if (btn10) { btn10.innerText = `-10% (₹${p10})`; btn10.onclick = () => { amountInput.value = p10; }; }
        if (btn15) { btn15.innerText = `-15% (₹${p15})`; btn15.onclick = () => { amountInput.value = p15; }; }
        if (btn20) { btn20.innerText = `-20% (₹${p20})`; btn20.onclick = () => { amountInput.value = p20; }; }

        offerModal?.classList.add('active');
        setTimeout(() => amountInput.focus(), 200);
    });

    offerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('offer-amount-input').value.trim();
        const message = document.getElementById('offer-message-input').value.trim();
        const submitBtn = document.getElementById('btn-submit-offer');

        if (!amount || Number(amount) <= 0) {
            showToast('Please enter a valid offer amount', 'warning');
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Sending...';
        submitBtn.disabled = true;

        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/offers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: currentProductId,
                    amount: Number(amount),
                    message
                })
            });

            const data = await res.json();
            if (res.ok) {
                closeModal('modal-offer');
                showToast(`🎉 Offer of ₹${Number(amount).toLocaleString('en-IN')} sent! Seller notified via email.`, 'success');
                setTimeout(() => {
                    window.location.href = '/offers.html';
                }, 1400);
            } else {
                showToast(data.message || 'Failed to submit offer', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (err) {
            showToast('Network error while sending offer', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Modal Helpers
    window.closeModal = function(id) {
        document.getElementById(id)?.classList.remove('active');
    };

    // Setup Reporting
    const reportBtn = document.getElementById('btn-open-report');
    const reportModal = document.getElementById('modal-report');
    const reportForm = document.getElementById('form-report-product');

    reportBtn?.addEventListener('click', () => {
        if (!isLoggedIn()) {
            showToast('Please login to report a listing', 'warning');
            setTimeout(() => { window.location.href = '/login.html'; }, 1000);
            return;
        }
        reportModal?.classList.add('active');
    });

    reportForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = getToken();
        const reason = document.getElementById('report-reason')?.value || 'other';
        const description = document.getElementById('report-desc')?.value || '';
        const submitBtn = document.getElementById('btn-submit-report');

        if (!description.trim()) {
            showToast('Please provide details for the report', 'warning');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const res = await fetch(`${API_URL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reportedItem: currentProductId,
                    itemType: 'product',
                    reason,
                    description
                })
            });

            if (res.ok) {
                showToast('Report submitted! Our campus moderation team will review this listing.', 'success');
                reportModal?.classList.remove('active');
                reportForm.reset();
            } else {
                const err = await res.json();
                showToast(err.message || 'Could not submit report', 'error');
            }
        } catch (err) {
            showToast('Network error while reporting listing', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-1"></i> Submit Report';
        }
    });

    // Setup Admin Delete Listing Button
    const adminDeleteBtn = document.getElementById('btn-admin-delete-listing');
    if (adminDeleteBtn && me && me.role === 'admin') {
        adminDeleteBtn.style.display = 'inline-flex';
        adminDeleteBtn.addEventListener('click', async () => {
            const pTitle = product.title || 'this listing';
            if (!confirm(`Are you sure you want to permanently delete "${pTitle}" as an Admin?`)) {
                return;
            }

            const idStr = String(currentProductId);
            if (typeof addDeletedListing === 'function') {
                addDeletedListing(idStr);
            }

            adminDeleteBtn.disabled = true;
            adminDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

            try {
                const token = getToken();
                if (idStr.length === 24) {
                    await fetch(`${API_URL}/admin/products/${idStr}`, {
                        method: 'DELETE',
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                }
                showToast(`Listing "${pTitle}" removed by Admin`, 'success');
                setTimeout(() => {
                    window.location.href = '/products.html';
                }, 900);
            } catch (err) {
                showToast('Listing removed by Admin', 'success');
                setTimeout(() => {
                    window.location.href = '/products.html';
                }, 900);
            }
        });
    }

    // Setup Rating & Reviewing
    const reviewBtn = document.getElementById('btn-open-review');
    const reviewModal = document.getElementById('modal-review');
    const reviewForm = document.getElementById('form-review-seller');
    const starsPicker = document.getElementById('review-stars-picker');

    if (starsPicker) {
        const stars = starsPicker.querySelectorAll('i');
        const ratingValInput = document.getElementById('review-rating-val');

        let currentSelectedRating = 5;

        function renderStars(val) {
            stars.forEach(s => {
                const sRating = parseInt(s.dataset.rating, 10);
                if (sRating <= val) {
                    s.style.color = '#F59E0B';
                } else {
                    s.style.color = '#CBD5E1';
                }
            });
        }

        function setSelectedRating(val) {
            currentSelectedRating = val;
            if (ratingValInput) ratingValInput.value = String(val);
            renderStars(val);
        }

        setSelectedRating(5);

        stars.forEach(s => {
            s.addEventListener('click', () => {
                const val = parseInt(s.dataset.rating, 10);
                setSelectedRating(val);
            });
            s.addEventListener('mouseenter', () => {
                const val = parseInt(s.dataset.rating, 10);
                renderStars(val);
            });
        });

        starsPicker.addEventListener('mouseleave', () => {
            renderStars(currentSelectedRating);
        });
    }

    reviewBtn?.addEventListener('click', () => {
        if (!isLoggedIn()) {
            showToast('Please login to review the seller', 'warning');
            setTimeout(() => { window.location.href = '/login.html'; }, 1000);
            return;
        }

        const me = getUser();
        const sellerId = product.seller?._id || product.seller;
        if (me && sellerId && (me._id === sellerId || me.id === sellerId)) {
            showToast('You cannot review your own listing', 'warning');
            return;
        }

        reviewModal?.classList.add('active');
    });

    reviewForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = getToken();
        const rating = parseInt(document.getElementById('review-rating-val')?.value || '5', 10);
        const comment = document.getElementById('review-comment')?.value || '';
        const submitBtn = document.getElementById('btn-submit-review');

        if (!comment.trim()) {
            showToast('Please enter your review feedback', 'warning');
            return;
        }

        const sellerId = product.seller?._id || product.seller;
        if (!sellerId) {
            showToast('Seller information missing', 'error');
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
                    revieweeId: sellerId,
                    productId: currentProductId,
                    rating,
                    comment
                })
            });

            if (res.ok) {
                showToast(`Thank you! Rated ${rating}★ for ${product.seller?.name || 'seller'}.`, 'success');
                reviewModal?.classList.remove('active');
                reviewForm.reset();
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
});

let currentSlideIndex = 0;

function initPhotoSlider(images) {
    if (!images || images.length === 0) {
        images = ['https://via.placeholder.com/800x600?text=No+Photo'];
    }

    const slideImg = document.getElementById('main-slide-img');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const counterEl = document.getElementById('slider-counter');
    const dotsContainer = document.getElementById('slider-dots');
    const thumbsContainer = document.getElementById('slider-thumbnails');

    currentSlideIndex = 0;

    function showSlide(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentSlideIndex = index;

        if (slideImg) {
            slideImg.style.opacity = '0';
            setTimeout(() => {
                slideImg.src = images[currentSlideIndex];
                slideImg.classList.remove('skeleton');
                slideImg.style.opacity = '1';
            }, 120);
        }

        if (counterEl) {
            counterEl.innerText = `${currentSlideIndex + 1} / ${images.length}`;
        }

        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === currentSlideIndex));
        }

        if (thumbsContainer) {
            const thumbs = thumbsContainer.querySelectorAll('.slider-thumb');
            thumbs.forEach((t, i) => t.classList.toggle('active', i === currentSlideIndex));
        }
    }

    showSlide(0);

    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (counterEl) counterEl.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        if (thumbsContainer) thumbsContainer.style.display = 'none';
        return;
    }

    if (dotsContainer) {
        dotsContainer.innerHTML = images.map((_, i) => `
            <div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="window.goToSlide(${i})"></div>
        `).join('');
    }

    if (thumbsContainer) {
        thumbsContainer.innerHTML = images.map((img, i) => `
            <img src="${img}" class="slider-thumb ${i === 0 ? 'active' : ''}" onclick="window.goToSlide(${i})" alt="Slide thumb ${i+1}">
        `).join('');
    }

    prevBtn?.addEventListener('click', () => showSlide(currentSlideIndex - 1));
    nextBtn?.addEventListener('click', () => showSlide(currentSlideIndex + 1));

    window.goToSlide = (i) => showSlide(i);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') showSlide(currentSlideIndex - 1);
        if (e.key === 'ArrowRight') showSlide(currentSlideIndex + 1);
    });
}

function formatCondition(cond) {
    if (!cond) return 'Good Condition';
    const c = cond.toLowerCase();
    if (c === 'new') return 'Brand New';
    if (c === 'like-new' || c === 'like new') return 'Like New';
    if (c === 'fair') return 'Fair Condition';
    return 'Good Condition';
}

async function toggleFavoriteDetail(btn) {
    if (!currentProductId) return;
    const isAdded = await toggleProductFavorite(currentProductId);
    const icon = btn.querySelector('i');
    if (isAdded) {
        btn.classList.add('active');
        if (icon) icon.className = 'fas fa-heart text-danger';
        showToast('Saved to your favorites!', 'success');
    } else {
        btn.classList.remove('active');
        if (icon) icon.className = 'far fa-heart';
        showToast('Removed from favorites', 'info');
    }
}

