import React from 'react';
import { useOffers } from '../../hooks/useOffers.js';

export default function OffersPage() {
    useOffers();
    return (
        <>
            <div id="navbar-container"></div>

            <main className="container" style={{ paddingTop: '6.5rem', minHeight: '80vh' }}>
                {/* Page Header */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2 animate-fade-in">
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <i className="fas fa-handshake" style={{ color: 'var(--text-primary)' }}></i> Campus Offers &amp; Deals
                        </h1>
                        <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
                            Negotiate prices safely, track incoming bids, and pay verified sellers via instant UPI.
                        </p>
                    </div>
                    <div>
                        <a href="/products.html" className="btn btn-outline btn-sm" style={{ fontWeight: 600, borderRadius: '10px' }}>
                            <i className="fas fa-compass mr-1"></i> Browse Marketplace
                        </a>
                    </div>
                </div>

                {/* Offers Navigation Tabs */}
                <div className="profile-tabs mb-4 animate-fade-in" style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 0 }}>
                    <div className="profile-tab active" id="tab-sent" onClick={() => window.switchOffersTab && window.switchOffersTab('sent')}>
                        <i className="fas fa-paper-plane mr-2"></i> Offers Sent (As Buyer)
                        <span id="badge-sent-count" className="badge badge-primary ml-2" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>0</span>
                    </div>
                    <div className="profile-tab" id="tab-received" onClick={() => window.switchOffersTab && window.switchOffersTab('received')}>
                        <i className="fas fa-inbox mr-2"></i> Offers Received (As Seller)
                        <span id="badge-received-count" className="badge badge-success ml-2" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>0</span>
                    </div>
                </div>

                {/* Tab 1: Offers Sent Grid */}
                <section id="section-sent-offers" className="animate-fade-in">
                    <div className="grid" id="grid-sent-offers" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {/* Dynamically loaded via offers.js */}
                    </div>
                </section>

                {/* Tab 2: Offers Received Grid */}
                <section id="section-received-offers" className="animate-fade-in" style={{ display: 'none' }}>
                    <div className="grid" id="grid-received-offers" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {/* Dynamically loaded via offers.js */}
                    </div>
                </section>
            </main>

            {/* Dynamic UPI Payment QR Modal */}
            <div className="modal-overlay" id="modal-upi-qr">
                <div className="modal animate-scale-in" style={{ maxWidth: '440px', textAlign: 'center', borderRadius: '20px', padding: '2rem' }}>
                    <div className="flex justify-between items-center mb-3">
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-qrcode" style={{ color: '#10B981' }}></i> Instant UPI Payment
                        </div>
                        <button type="button" className="modal-close" onClick={() => window.closeModal && window.closeModal('modal-upi-qr')}><i className="fas fa-times"></i></button>
                    </div>

                    {/* Deal Amount Highlight */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                        <div className="text-xs text-secondary font-bold" style={{ textTransform: 'uppercase' }}>Agreed Offer Amount</div>
                        <div id="upi-modal-amount" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10B981', letterSpacing: '-0.02em' }}>₹0</div>
                        <div id="upi-modal-item-title" className="text-secondary text-sm font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Item Title</div>
                    </div>

                    {/* Shown when Seller HAS provided a QR or UPI ID */}
                    <div id="upi-available-section">
                        {/* Dynamic QR Code Container */}
                        <div style={{ background: '#ffffff', border: '2px dashed var(--border)', borderRadius: '16px', padding: '1.25rem', display: 'inline-block', marginBottom: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                            <div id="upi-qr-mode-badge" style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '20px', padding: '0.2rem 0.65rem', display: 'inline-block', marginBottom: '0.6rem' }}>
                                <i className="fas fa-bolt mr-1"></i> Custom Amount Locked
                            </div>
                            <img id="upi-qr-image" src="" alt="UPI QR Code" style={{ width: '210px', height: '210px', display: 'block', margin: '0 auto', borderRadius: '8px', objectFit: 'contain' }} />
                            <div style={{ fontSize: '0.75rem', color: '#52525B', marginTop: '0.65rem', fontWeight: 600 }}>
                                Scan with GPay • PhonePe • Paytm • BHIM
                            </div>
                            <button type="button" id="btn-toggle-qr-mode" className="btn btn-ghost btn-sm" style={{ display: 'none', marginTop: '0.45rem', fontSize: '0.75rem', padding: '0.25rem 0.65rem', color: '#18181B', fontWeight: 700 }}>
                                <i className="fas fa-sync-alt mr-1"></i> View Seller&apos;s Original QR Image
                            </button>
                        </div>

                        {/* Seller UPI ID Box */}
                        <div id="upi-vpa-box" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Seller UPI ID</div>
                                <div id="upi-modal-vpa" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.95rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}></div>
                            </div>
                            <button type="button" className="btn btn-ghost btn-sm" id="btn-copy-upi" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                <i className="far fa-copy mr-1"></i> Copy
                            </button>
                        </div>

                        {/* Action Link for Mobile Devices */}
                        <a id="upi-mobile-pay-link" href="#" className="btn btn-outline w-full mb-2" style={{ fontWeight: 700, borderRadius: '12px' }}>
                            <i className="fas fa-mobile-alt mr-2"></i> Open in UPI App
                        </a>

                        <button type="button" id="btn-confirm-upi-paid" className="btn btn-secondary btn-lg w-full mb-3" style={{ fontWeight: 700, borderRadius: '12px' }}>
                            <i className="fas fa-check-circle mr-2"></i> I&apos;ve Completed the Payment
                        </button>
                    </div>

                    {/* Shown when Seller has NOT uploaded a QR or UPI ID */}
                    <div id="upi-missing-section" style={{ display: 'none', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '1.75rem 1.25rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 0.85rem' }}>
                            <i className="fas fa-qrcode"></i>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                            Seller Has Not Provided a QR Code
                        </h4>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                            This seller hasn&apos;t uploaded their payment QR or UPI ID yet. Please contact them directly through chat to complete the payment.
                        </p>
                        <a id="upi-chat-seller-link" href="/chat.html" className="btn btn-primary w-full mb-2" style={{ fontWeight: 700, borderRadius: '10px', padding: '0.7rem 1rem' }}>
                            <i className="fas fa-comment-dots mr-1"></i> Contact Seller Through Chat
                        </a>
                        <button type="button" id="btn-confirm-direct-paid" className="btn btn-secondary btn-sm w-full" style={{ fontWeight: 700, borderRadius: '10px', padding: '0.6rem 1rem' }}>
                            <i className="fas fa-check-circle mr-1"></i> Mark Deal &amp; Payment as Completed
                        </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <i className="fas fa-shield-alt text-success mr-1"></i> Meet your campus peer safely in a public spot (library/canteen) during handover.
                    </div>
                </div>
            </div>

            {/* Counter Offer Modal (For Sellers) */}
            <div className="modal-overlay" id="modal-counter-offer">
                <div className="modal animate-scale-in" style={{ maxWidth: '420px', borderRadius: '20px' }}>
                    <div className="modal-header">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            <i className="fas fa-exchange-alt mr-1"></i> Send Counter Offer
                        </h3>
                        <button type="button" className="modal-close" onClick={() => window.closeModal && window.closeModal('modal-counter-offer')}><i className="fas fa-times"></i></button>
                    </div>
                    <form id="form-submit-counter">
                        <input type="hidden" id="counter-offer-id" defaultValue="" />
                        <div className="form-group mb-3">
                            <label className="form-label text-xs font-bold" htmlFor="counter-amount-input">Your Counter Price (₹) <span className="text-danger">*</span></label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹</span>
                                <input type="number" id="counter-amount-input" className="form-control" style={{ paddingLeft: '2.2rem', fontSize: '1.25rem', fontWeight: 800 }} placeholder="e.g. 950" min="1" required />
                            </div>
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label text-xs font-bold" htmlFor="counter-message-input">Note to Buyer (Optional)</label>
                            <textarea id="counter-message-input" className="form-control text-sm" rows="2" placeholder="e.g. Lowest I can do is 950 since it includes accessories!"></textarea>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.closeModal && window.closeModal('modal-counter-offer')}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700, padding: '0.6rem 1.4rem' }}>
                                <i className="fas fa-paper-plane mr-1"></i> Send Counter
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Seller UPI Setup Prompt Modal */}
            <div className="modal-overlay" id="modal-seller-upi-setup">
                <div className="modal animate-scale-in" style={{ maxWidth: '420px', borderRadius: '20px' }}>
                    <div className="modal-header">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            <i className="fas fa-wallet mr-1" style={{ color: '#10B981' }}></i> Enter Your UPI ID
                        </h3>
                        <button type="button" className="modal-close" onClick={() => window.closeModal && window.closeModal('modal-seller-upi-setup')}><i className="fas fa-times"></i></button>
                    </div>
                    <form id="form-save-seller-upi">
                        <p className="text-secondary text-sm mb-3">
                            Please provide your UPI ID (GPay, PhonePe, Paytm) so the buyer can scan and pay you immediately upon accepting.
                        </p>
                        <div className="form-group mb-4">
                            <label className="form-label text-xs font-bold" htmlFor="seller-upi-input">UPI ID / VPA <span className="text-danger">*</span></label>
                            <input type="text" id="seller-upi-input" className="form-control" placeholder="e.g. 9876543210@paytm or name@oksbi" required />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.closeModal && window.closeModal('modal-seller-upi-setup')}>Cancel</button>
                            <button type="submit" className="btn btn-success btn-sm" style={{ fontWeight: 700, padding: '0.6rem 1.4rem' }}>
                                Save &amp; Accept Offer
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
