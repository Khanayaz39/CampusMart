import React from 'react';

export default function CreateListingPage() {
    return (
        <>
            <div id="navbar-container"></div>

            <div className="container mb-5" style={{ paddingTop: '6.5rem', maxWidth: '1080px' }}>
                {/* Page Title */}
                <div className="mb-4">
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Post a Campus Listing
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '0.92rem' }}>
                        Sell textbooks, electronics, cycles, and hostel essentials to verified peers in VIT Bhopal University
                    </p>
                </div>

                <form id="create-listing-form" className="grid" style={{ gridTemplateColumns: '1fr 1.35fr', gap: '1.75rem', alignItems: 'start' }}>
                    {/* Left Column: Photos & AI Tools */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Photos Card */}
                        <div className="form-card">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
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

                            {/* Uploaded Thumbnails Preview */}
                            <div className="upload-preview" id="preview-container" style={{ marginTop: '0.85rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}></div>
                        </div>

                        {/* Quick Campus Seller Tips */}
                        <div className="form-card" style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: '1.25rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <i className="fas fa-lightbulb text-warning"></i> Quick Seller Tips
                            </div>
                            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
                                <li>Fair student prices sell within 24-48 hours.</li>
                                <li>Include your hostel number for effortless meetups.</li>
                                <li>Mention if you&apos;re open to negotiation.</li>
                            </ul>
                        </div>

                        {/* AI Safety & Content Moderation Badge */}
                        <div className="form-card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1.15rem', borderRadius: '12px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <i className="fas fa-shield-halved" style={{ color: '#16A34A' }}></i> Campus AI Moderation Active
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#15803D', lineHeight: 1.5, margin: 0 }}>
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

                        {/* Title */}
                        <div className="form-group mb-3">
                            <label className="form-label" htmlFor="title">Item Title <span className="text-danger">*</span></label>
                            <input type="text" id="title" className="form-control" required placeholder="e.g. HP Pavilion 15 Laptop or Calculus 8th Edition" />
                        </div>

                        {/* Price & Condition Row */}
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

                        {/* Open to Negotiation Pill Card */}
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

                        {/* Category & Hostel Row */}
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

                        {/* Description & Quick Templates */}
                        <div className="form-group mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="form-label mb-0" htmlFor="description">Description <span className="text-danger">*</span></label>
                                {/* Quick Fill Templates */}
                                <div className="quick-chip-group">
                                    <span className="quick-chip-label">Quick fill:</span>
                                    <button type="button" className="quick-chip" onClick={() => window.insertTemplate && window.insertTemplate('book')}><i className="fas fa-book"></i> Book</button>
                                    <button type="button" className="quick-chip" onClick={() => window.insertTemplate && window.insertTemplate('laptop')}><i className="fas fa-laptop"></i> Gadget</button>
                                    <button type="button" className="quick-chip" onClick={() => window.insertTemplate && window.insertTemplate('cycle')}><i className="fas fa-bicycle"></i> Cycle</button>
                                </div>
                            </div>
                            <textarea id="description" className="form-control" rows="4" required placeholder="Describe condition, how long you used it, reasons for selling, and best time to meet for pickup..."></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button type="submit" className="btn btn-primary btn-lg w-full justify-center" style={{ fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)', borderRadius: '12px', height: '48px' }}>
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
