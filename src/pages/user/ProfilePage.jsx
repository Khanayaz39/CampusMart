import React from 'react';

export default function ProfilePage() {
    return (
        <>
            <div id="navbar-container"></div>

            {/* Profile Header / Banner */}
            <div className="profile-header">
                <div className="container relative z-10">
                    <img id="profile-avatar" src="https://ui-avatars.com/api/?name=Student&background=27272A&color=fff" className="profile-avatar" alt="Profile Avatar" />
                    <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                        <h1 id="profile-name" className="profile-name" style={{ marginBottom: 0 }}>Student Profile</h1>
                        <span id="role-badge-container"></span>
                        <span id="verification-badge-container"></span>
                    </div>

                    <div className="profile-meta">
                        <span id="profile-college"><i className="fas fa-university"></i> VIT Bhopal University</span>
                        <span id="profile-hostel"><i className="fas fa-hotel"></i> Hostel Student</span>
                        <span id="profile-dept"><i className="fas fa-graduation-cap"></i> Student</span>
                    </div>

                    {/* Stats Badge */}
                    <div className="profile-stats-card">
                        <div className="profile-stat">
                            <div className="profile-stat-number" id="stats-listings-count">0</div>
                            <div className="profile-stat-label">Listings</div>
                        </div>
                        <div style={{ width: '1px', height: '28px', background: 'var(--border)' }}></div>
                        <div className="profile-stat">
                            <div className="profile-stat-number" id="stats-sold-count">0</div>
                            <div className="profile-stat-label">Sold</div>
                        </div>
                        <div style={{ width: '1px', height: '28px', background: 'var(--border)' }}></div>
                        <div className="profile-stat">
                            <div className="profile-stat-number flex items-center justify-center gap-1">
                                <i className="fas fa-star text-warning" style={{ fontSize: '0.9rem' }}></i>
                                <span id="stats-rating">New</span>
                            </div>
                            <div className="profile-stat-label">Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mt-4 mb-5">
                <div className="profile-tabs">
                    <div className="profile-tab active" data-target="listings">
                        <i className="fas fa-box"></i>
                        <span>My Listings (<span id="tab-count">0</span>)</span>
                    </div>
                    <div className="profile-tab" data-target="sold">
                        <i className="fas fa-handshake"></i>
                        <span>Items Sold (<span id="tab-sold-count">0</span>)</span>
                    </div>
                    <div className="profile-tab" data-target="reviews">
                        <i className="fas fa-comment-alt"></i>
                        <span>Campus Reviews</span>
                    </div>
                    <div className="profile-tab" data-target="payment-qr" id="tab-btn-payment-qr">
                        <i className="fas fa-qrcode" style={{ color: '#10B981' }}></i>
                        <span>Payment QR</span>
                    </div>
                    <div id="own-profile-actions" className="ml-auto" style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.4rem 0', flexShrink: 0 }}>
                        <button className="btn btn-outline btn-sm" id="edit-profile-btn" style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', boxSizing: 'border-box' }}>
                            <i className="fas fa-user-edit"></i> Edit Profile
                        </button>
                        <button className="btn btn-outline btn-sm" id="delete-account-btn" style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', borderColor: 'rgba(239,68,68,0.35)', color: '#EF4444', background: 'rgba(239,68,68,0.08)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', boxSizing: 'border-box' }}>
                            <i className="fas fa-trash-alt"></i> Delete Account
                        </button>
                    </div>
                </div>

                {/* Listings Tab */}
                <div id="tab-listings" className="products-grid">
                    {/* Dynamic products loaded by JS */}
                </div>

                {/* Items Sold Tab */}
                <div id="tab-sold" className="products-grid hidden">
                    {/* Dynamic sold products loaded by JS */}
                </div>

                {/* Reviews Tab */}
                <div id="tab-reviews" className="hidden" style={{ maxWidth: '780px' }}>
                    <div id="reviews-list">
                        <div className="empty-state text-center" style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '3.5rem 1.5rem', border: '1px solid var(--border)' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.25rem' }}>
                                <i className="far fa-star"></i>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Reviews Yet</h3>
                            <p className="text-secondary" style={{ fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                                Peer reviews and ratings will appear here after campus transactions and meetups.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment QR Tab */}
                <div id="tab-payment-qr" className="hidden" style={{ maxWidth: '820px' }}>
                    <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <i className="fas fa-qrcode" style={{ color: '#10B981' }}></i> Receive Payments (UPI QR &amp; ID)
                                </h3>
                                <p className="text-secondary" style={{ fontSize: '0.88rem', margin: 0 }}>
                                    Upload your GPay, PhonePe, or Paytm QR code — we automatically extract your UPI ID from it to generate custom-amount QR codes for accepted offers.
                                </p>
                            </div>
                            <span id="qr-status-badge" className="badge badge-warning" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                                <i className="fas fa-exclamation-circle mr-1"></i> Not Configured
                            </span>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                            {/* Left: QR Code Upload & Preview */}
                            <div style={{ textAlign: 'center', background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                                <div id="qr-preview-container" style={{ width: '210px', height: '210px', margin: '0 auto 0.85rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                                    <img id="qr-preview-img" src="" alt="Your Payment QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'none' }} />
                                    <div id="qr-placeholder" style={{ padding: '1rem', color: '#71717A' }}>
                                        <i className="fas fa-qrcode" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', color: '#A1A1AA' }}></i>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#52525B' }}>No QR Image Uploaded</div>
                                        <div style={{ fontSize: '0.72rem', color: '#71717A', marginTop: '0.2rem' }}>PNG, JPG or WEBP (Max 5MB)</div>
                                    </div>
                                </div>

                                <div id="qr-detected-info" style={{ display: 'none', fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.45rem 0.65rem', marginBottom: '0.85rem', fontWeight: 600 }}>
                                </div>

                                <input type="file" id="qr-file-input" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} />

                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button type="button" className="btn btn-outline btn-sm" id="upload-qr-btn" style={{ borderRadius: '8px', fontWeight: 600 }}>
                                        <i className="fas fa-upload mr-1"></i> Upload QR Image
                                    </button>
                                    <button type="button" className="btn btn-ghost btn-sm text-danger" id="remove-qr-btn" style={{ display: 'none', borderRadius: '8px', fontWeight: 600 }}>
                                        <i className="fas fa-trash-alt mr-1"></i> Remove
                                    </button>
                                </div>
                            </div>

                            {/* Right: UPI ID & Save Settings */}
                            <div>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" htmlFor="profile-upi-id" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                        <i className="fas fa-at text-primary-color mr-1"></i> Your UPI ID (Auto-extracted from QR or enter manually)
                                    </label>
                                    <input type="text" id="profile-upi-id" className="form-control" placeholder="e.g. yourname@oksbi or 9876543210@ybl" />
                                    <small className="text-secondary" style={{ fontSize: '0.76rem', display: 'block', marginTop: '0.35rem' }}>
                                        Automatically filled when you upload a valid UPI QR image. Used to generate exact offer-amount QR codes for buyers.
                                    </small>
                                </div>

                                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.3rem' }}>
                                        <i className="fas fa-shield-alt mr-1"></i> How Campus Payments Work
                                    </div>
                                    <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.15rem', lineHeight: 1.6 }}>
                                        <li>Upload your QR screenshot once and we extract your UPI ID automatically.</li>
                                        <li>When you <strong>Accept</strong> an offer, the buyer gets a custom QR locked to the agreed offer price.</li>
                                    </ul>
                                </div>

                                <button type="button" className="btn btn-primary w-full" id="save-payment-qr-btn" style={{ borderRadius: '10px', fontWeight: 700, padding: '0.75rem 1.25rem' }}>
                                    <i className="fas fa-save mr-1"></i> Save Payment QR Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <div className="modal-overlay" id="edit-modal">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Edit Campus Profile</h3>
                        <button type="button" className="modal-close" id="close-modal"><i className="fas fa-times"></i></button>
                    </div>
                    <form id="edit-profile-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-name">Full Name</label>
                            <input type="text" id="edit-name" className="form-control" required placeholder="Your Full Name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-role">Marketplace Role</label>
                            <select id="edit-role" className="form-control" defaultValue="both" required>
                                <option value="both">Both (Buyer &amp; Seller) - All-Rounder</option>
                                <option value="buyer">Campus Buyer (Looking to purchase)</option>
                                <option value="seller">Campus Seller (Looking to sell)</option>
                            </select>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-hostel">Hostel Name</label>
                                <input type="text" id="edit-hostel" className="form-control" placeholder="e.g. Boys Hostel 2" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-room">Room Number</label>
                                <input type="text" id="edit-room" className="form-control" placeholder="e.g. 204" />
                            </div>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-dept">Department</label>
                                <input type="text" id="edit-dept" className="form-control" placeholder="e.g. CSE / IT" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-phone">Phone / WhatsApp</label>
                                <input type="text" id="edit-phone" className="form-control" placeholder="10-digit number" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-bio">Bio</label>
                            <textarea id="edit-bio" className="form-control" rows="3" placeholder="Tell other students about yourself..."></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-upi"><i className="fas fa-qrcode text-success mr-1"></i> UPI ID for Receiving Payments (GPay / PhonePe / Paytm)</label>
                            <input type="text" id="edit-upi" className="form-control" placeholder="e.g. name@oksbi or 9876543210@paytm" />
                            <small className="text-secondary" style={{ fontSize: '0.75rem' }}>Buyers will scan your dynamic QR code to pay when you accept their offers.</small>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                            <button type="button" className="btn btn-ghost" id="cancel-edit-btn">Cancel</button>
                            <button type="submit" className="btn btn-primary" id="save-profile-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            <div className="modal-overlay" id="modal-delete-account">
                <div className="modal" style={{ maxWidth: '460px' }}>
                    <div className="modal-header">
                        <div className="flex items-center gap-2" style={{ color: '#EF4444' }}>
                            <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.3rem' }}></i>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#EF4444' }}>Delete Account</h3>
                        </div>
                        <button type="button" className="modal-close" id="close-delete-modal"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="modal-body" style={{ padding: '0.5rem 0 1.25rem' }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            Are you sure you want to delete your CampusMart account?
                        </p>
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '0.9rem', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                                ⚠️ <strong>This action is permanent and cannot be undone:</strong><br />
                                • All your posted products will be deleted from fresh listings and marketplace.<br />
                                • Anyone you chatted with will see <em>&quot;User deleted account&quot;</em>.<br />
                                • You will be immediately logged out.
                            </p>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Please confirm if you want to proceed with permanently deleting your account.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button type="button" className="btn btn-ghost btn-sm" id="cancel-delete-modal-btn">Cancel</button>
                        <button type="button" className="btn btn-danger btn-sm" id="confirm-delete-account-btn">
                            <i className="fas fa-trash-alt mr-1"></i> Yes, Delete My Account
                        </button>
                    </div>
                </div>
            </div>

            {/* User Feedback Modal */}
            <div className="modal-overlay" id="modal-profile-review">
                <div className="modal" style={{ maxWidth: '480px' }}>
                    <div className="modal-header">
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}><i className="fas fa-star text-warning mr-1"></i> User Feedback</h3>
                        <button type="button" className="modal-close" onClick={() => window.closeProfileReviewModal && window.closeProfileReviewModal()}><i className="fas fa-times"></i></button>
                    </div>
                    <form id="form-profile-review">
                        <p className="text-xs text-secondary mb-3">Share your campus experience dealing with this student peer.</p>

                        <div className="form-group text-center mb-3">
                            <label className="form-label text-xs font-bold">Your Rating</label>
                            <div className="stars-picker flex justify-center gap-2 mt-1" id="profile-stars-picker" style={{ fontSize: '1.8rem', cursor: 'pointer', color: '#CBD5E1' }}>
                                <i className="fas fa-star" data-rating="1"></i>
                                <i className="fas fa-star" data-rating="2"></i>
                                <i className="fas fa-star" data-rating="3"></i>
                                <i className="fas fa-star" data-rating="4"></i>
                                <i className="fas fa-star" data-rating="5"></i>
                            </div>
                            <input type="hidden" id="profile-review-rating-val" defaultValue="5" />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label text-xs font-bold" htmlFor="profile-review-comment">Review Comment</label>
                            <textarea id="profile-review-comment" className="form-control text-sm" rows="3" placeholder="How was their response time, hostel meetup, and item condition?" required></textarea>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.closeProfileReviewModal && window.closeProfileReviewModal()}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-sm" id="btn-submit-profile-review"><i className="fas fa-check mr-1"></i> Submit Review</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
