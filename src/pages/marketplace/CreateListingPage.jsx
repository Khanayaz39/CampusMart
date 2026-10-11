import React, { useEffect } from 'react';
import {
    API_URL,
    initCommonLayout,
    protectPage,
    getToken,
    GLOBAL_PROFANITY_REGEX,
    saveLocalUserListing,
    showToast
} from '../../utils/common.js';

const LISTING_TEMPLATES = {
    book: "Semester textbook in great condition.\n• Edition: Latest\n• Notes & Highlighting: Clean pages, no missing chapters\n• Pickup: Can hand over near hostel common area or college gate.",
    laptop: "Tested and fully functional.\n• Usage: Used for 2 college semesters\n• Included Accessories: Original charger and protective case\n• Reason for selling: Upgraded device\n• Pickup: Available to test and inspect in room.",
    cycle: "Geared bicycle in smooth riding condition.\n• Gears: Smooth shifting, brakes working reliably\n• Tires: Good condition, ready to ride\n• Accessories: Includes lock and bell\n• Pickup: Can inspect and test ride at hostel cycle stand."
};

export default function CreateListingPage() {
    useEffect(() => {
        initCommonLayout();
        protectPage();

        window.insertTemplate = (type) => {
            const descArea = document.getElementById('description');
            if (!descArea || !LISTING_TEMPLATES[type]) return;
            descArea.value = LISTING_TEMPLATES[type];
            showToast('Template added to description!', 'info');
        };

        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const previewContainer = document.getElementById('preview-container');
        let uploadedFiles = [];

        dropZone?.addEventListener('click', () => fileInput.click());

        const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dropZone?.addEventListener(ev, preventDefaults, false));
        ['dragenter', 'dragover'].forEach(ev => dropZone?.addEventListener(ev, () => dropZone.classList.add('dragover'), false));
        ['dragleave', 'drop'].forEach(ev => dropZone?.addEventListener(ev, () => dropZone.classList.remove('dragover'), false));

        dropZone?.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
        fileInput?.addEventListener('change', (e) => handleFiles(e.target.files));

        const INAPPROPRIATE_FILENAME_REGEX = /(nude|naked|nsfw|xxx|porn|sex|adult|boobs|dick|pussy|penis|vagina|erotic|vape|weed|alcohol|beer|whiskey|gun|pistol|knife|blade|fuck|bitch|madarchod|bhenchod|chutiya|gandu)/i;

        function handleFiles(files) {
            [...files].forEach(file => {
                if (!file.type.startsWith('image/')) return;
                if (file.name && INAPPROPRIATE_FILENAME_REGEX.test(file.name)) {
                    showToast(`🛡️ Photo blocked: "${file.name}" violates campus safety guidelines (prohibited or adult content).`, 'error');
                    return;
                }
                if (uploadedFiles.length >= 5) {
                    showToast('Maximum 5 images allowed', 'warning');
                    return;
                }
                uploadedFiles.push(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'preview-item animate-scale-in';
                    div.style.cssText = 'width: 76px; height: 76px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid var(--border);';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="preview" style="width: 100%; height: 100%; object-fit: cover;">
                        <button type="button" class="remove-btn" style="position: absolute; top: 2px; right: 2px; width: 22px; height: 22px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;"><i class="fas fa-times"></i></button>
                    `;
                    div.querySelector('.remove-btn').addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        div.remove();
                        uploadedFiles = uploadedFiles.filter(f => f !== file);
                    });
                    previewContainer?.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        }

        document.getElementById('create-listing-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleVal = document.getElementById('title').value.trim();
            const descVal = document.getElementById('description').value.trim();

            if (GLOBAL_PROFANITY_REGEX.test(titleVal) || GLOBAL_PROFANITY_REGEX.test(descVal)) {
                showToast('🛡️ Post blocked: Inappropriate words or swears (English/Hindi) are strictly prohibited.', 'error');
                return;
            }

            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Publishing to CampusMart...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('title', titleVal);
            formData.append('price', document.getElementById('price').value.trim());
            formData.append('condition', document.getElementById('condition').value);
            formData.append('category', document.getElementById('category').value);
            formData.append('description', descVal);

            const hostelVal = document.getElementById('hostel')?.value.trim();
            if (hostelVal) formData.append('hostel', hostelVal);

            const negotiableVal = document.getElementById('negotiable')?.checked;
            formData.append('negotiable', negotiableVal ? 'true' : 'false');
            uploadedFiles.forEach(file => formData.append('images', file));

            try {
                const token = getToken();
                const res = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    body: formData
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    const err = new Error(errData.message || 'Failed to post listing');
                    err.status = res.status;
                    err.violationType = errData.violationType;
                    err.isModeration = !!(errData.violationType || (res.status === 400 && (errData.message?.includes('🛡️') || errData.message?.includes('blocked') || errData.message?.includes('prohibited'))));
                    throw err;
                }

                const newProduct = await res.json();
                saveLocalUserListing(newProduct);
                showToast('🎉 Your listing is live on CampusMart!', 'success');
                setTimeout(() => { window.location.href = `/product-detail.html?id=${newProduct._id}`; }, 1000);
            } catch (error) {
                btn.innerHTML = originalText;
                btn.disabled = false;
                showToast(error.message || 'Network error while posting listing', 'error');
            }
        });
    }, []);

    return (
        <>
            <div id="navbar-container"></div>

            <div className="container mb-5" style={{ paddingTop: '6.5rem', maxWidth: '1080px' }}>
                <div className="mb-4">
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Post a Campus Listing
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '0.92rem' }}>
                        Sell textbooks, electronics, cycles, and hostel essentials to verified peers in VIT Bhopal University
                    </p>
                </div>

                <form id="create-listing-form" className="create-listing-grid">
                    {/* Left Column: Photos & AI Tools */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-card">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                        <i className="fas fa-camera"></i>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Photos</h3>
                                </div>
                                <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>Max 5 Photos</span>
                            </div>

                            <div className="upload-area" id="drop-zone">
                                <div className="upload-icon-circle">
                                    <i className="fas fa-cloud-arrow-up"></i>
                                </div>
                                <h4>Drag &amp; drop photos here</h4>
                                <p>or click to select from your device</p>
                                <span className="btn btn-outline btn-sm">
                                    <i className="fas fa-folder-open mr-1"></i> Browse Photos
                                </span>
                                <input type="file" id="file-input" multiple accept="image/*" className="hidden" />
                            </div>

                            <div className="upload-preview" id="preview-container" style={{ marginTop: '0.85rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}></div>
                        </div>

                        <div className="form-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <i className="fas fa-lightbulb text-warning"></i> Quick Seller Tips
                            </div>
                            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
                                <li>Fair student prices sell within 24-48 hours.</li>
                                <li>Include your hostel number for effortless meetups.</li>
                                <li>Mention if you&apos;re open to negotiation.</li>
                            </ul>
                        </div>

                        <div className="form-card" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1.15rem', borderRadius: '12px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <i className="fas fa-shield-halved"></i> Campus AI Moderation Active
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                Listings are automatically scanned. Adult or nude photos, contraband, vape/alcohol, and weapons are strictly blocked to protect campus safety.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="form-card">
                        <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>Item Details</h3>
                                <p className="text-secondary" style={{ fontSize: '0.8rem', margin: 0 }}>Fill in the information to post your item</p>
                            </div>
                            <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}><i className="fas fa-check-circle mr-1"></i> Live Instantly</span>
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label" htmlFor="title">Item Title <span className="text-danger">*</span></label>
                            <input type="text" id="title" className="form-control" required placeholder="e.g. HP Pavilion 15 Laptop or Calculus 8th Edition" />
                        </div>

                        <div className="grid mb-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group mb-0">
                                <label className="form-label" htmlFor="price">Price (₹) <span className="text-danger">*</span></label>
                                <div className="input-currency-group">
                                    <span className="currency-prefix">₹</span>
                                    <input type="number" id="price" className="form-control" required placeholder="0" min="0" />
                                </div>
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label" htmlFor="condition">Condition <span className="text-danger">*</span></label>
                                <select id="condition" className="form-control" defaultValue="" required>
                                    <option value="">Select Condition</option>
                                    <option value="new">Brand New (Unused)</option>
                                    <option value="like-new">Like New (Mint Condition)</option>
                                    <option value="good">Good (Normal College Wear)</option>
                                    <option value="fair">Fair (Fully Functional)</option>
                                    <option value="poor">Needs Repair</option>
                                </select>
                            </div>
                        </div>

                        <label className="negotiable-pill-card" htmlFor="negotiable">
                            <div className="negotiable-pill-left">
                                <input type="checkbox" id="negotiable" defaultChecked />
                                <div className="negotiable-pill-text">
                                    <span className="negotiable-pill-title">🤝 Price is negotiable</span>
                                    <span className="negotiable-pill-desc">Open to student counter-offers &amp; chat bargaining</span>
                                </div>
                            </div>
                            <span className="negotiable-tag"><i className="fas fa-handshake mr-1"></i> Recommended</span>
                        </label>

                        <div className="grid mb-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group mb-0">
                                <label className="form-label" htmlFor="category">Category <span className="text-danger">*</span></label>
                                <select id="category" className="form-control" defaultValue="" required>
                                    <option value="">Select Category</option>
                                    <option value="Books & Notes">📚 Books &amp; Notes</option>
                                    <option value="Electronics">💻 Electronics &amp; Gadgets</option>
                                    <option value="Furniture">🪑 Furniture (Chairs, Tables)</option>
                                    <option value="Room Essentials">🛏️ Room Essentials</option>
                                    <option value="Transport">🚲 Transport (Cycles, etc.)</option>
                                    <option value="Clothing">👕 Clothing &amp; Blazers</option>
                                    <option value="Entertainment">🎮 Gaming &amp; Entertainment</option>
                                    <option value="Kitchen Items">☕ Kitchen (Kettles, etc.)</option>
                                    <option value="Electrical">🔌 Electrical &amp; Extensions</option>
                                    <option value="Miscellaneous">📦 Miscellaneous</option>
                                </select>
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label" htmlFor="hostel">Hostel / Pickup Point</label>
                                <input type="text" id="hostel" className="form-control" placeholder="e.g. Boys Hostel Block 1 or Library Gate" />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                                <label className="form-label mb-0" htmlFor="description">Description <span className="text-danger">*</span></label>
                                <div className="quick-chip-group">
                                    <span className="quick-chip-label">Quick fill:</span>
                                    <button type="button" className="quick-chip" onClick={() => window.insertTemplate && window.insertTemplate('book')}><i className="fas fa-book"></i> Book</button>
                                    <button type="button" className="quick-chip" onClick={() => window.insertTemplate && window.insertTemplate('laptop')}><i className="fas fa-laptop"></i> Gadget</button>
                                    <button type="button" className="quick-chip" onClick={() => window.insertTemplate && window.insertTemplate('cycle')}><i className="fas fa-bicycle"></i> Cycle</button>
                                </div>
                            </div>
                            <textarea id="description" className="form-control" rows="4" required placeholder="Describe condition, how long you used it, reasons for selling, and best time to meet for pickup..."></textarea>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className="btn btn-primary btn-lg w-full justify-center" style={{ fontWeight: 700, fontSize: '1.02rem', borderRadius: '12px', height: '48px' }}>
                                <i className="fas fa-paper-plane mr-2"></i> Publish Campus Listing
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
