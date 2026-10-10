import React from 'react';

export default function ProductDetailPage() {
    return (
        <>
            <div id="navbar-container"></div>

            <div className="container product-detail pt-24 mb-5">
                <a href="/products.html" className="btn btn-ghost mb-3"><i className="fas fa-arrow-left"></i> Back to Browse</a>

                <div className="grid grid-cols-[1fr_400px] gap-12">
                    {/* Gallery Left: Photo Slider */}
                    <div>
                        <div className="product-slider-container">
                            <div className="slider-viewport">
                                <img id="main-slide-img" className="slider-image skeleton" src="https://via.placeholder.com/800x600?text=Loading..." alt="Product Photo" />

                                {/* Navigation Arrows */}
                                <button type="button" className="slider-arrow prev" id="slider-prev" title="Previous photo">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button type="button" className="slider-arrow next" id="slider-next" title="Next photo">
                                    <i className="fas fa-chevron-right"></i>
                                </button>

                                {/* Counter Badge */}
                                <div className="slider-counter" id="slider-counter">1 / 1</div>
                            </div>

                            {/* Dots */}
                            <div className="slider-dots" id="slider-dots"></div>

                            {/* Thumbnails Strip */}
                            <div className="slider-thumbnails" id="slider-thumbnails"></div>
                        </div>

                        {/* Rich Description Card */}
                        <div className="item-description-card">
                            <div className="item-description-header">
                                <i className="fas fa-align-left text-primary"></i>
                                <span>Item Overview &amp; Details</span>
                            </div>

                            <p id="product-desc" className="item-description-text">Loading description...</p>

                            {/* Quick Facts & Specs Grid */}
                            <div className="item-highlights-grid">
                                <div className="item-highlight-box">
                                    <div className="item-highlight-icon bg-indigo-50 text-primary">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div>
                                        <div className="item-highlight-label">Pickup Location</div>
                                        <div className="item-highlight-val" id="highlight-location">Boys Hostel 2 / Campus</div>
                                    </div>
                                </div>

                                <div className="item-highlight-box">
                                    <div className="item-highlight-icon bg-emerald-50 text-emerald-600">
                                        <i className="fas fa-shield-alt"></i>
                                    </div>
                                    <div>
                                        <div className="item-highlight-label">Inspection</div>
                                        <div className="item-highlight-val">Test on spot before paying</div>
                                    </div>
                                </div>

                                <div className="item-highlight-box">
                                    <div className="item-highlight-icon bg-amber-50 text-amber-700">
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                    <div>
                                        <div className="item-highlight-label">Price Negotiation</div>
                                        <div className="item-highlight-val" id="highlight-negotiable">Accepting reasonable offers</div>
                                    </div>
                                </div>

                                <div className="item-highlight-box">
                                    <div className="item-highlight-icon bg-blue-50 text-blue-600">
                                        <i className="fas fa-user-graduate"></i>
                                    </div>
                                    <div>
                                        <div className="item-highlight-label">Seller Trust</div>
                                        <div className="item-highlight-val">Verified College Peer</div>
                                    </div>
                                </div>
                            </div>

                            {/* Campus Safety Alert */}
                            <div className="campus-safety-alert">
                                <i className="fas fa-lightbulb text-[1.1rem] shrink-0"></i>
                                <span><strong>Campus Tip:</strong> For safety and transparency, meet in busy campus spots like hostel common rooms, libraries, or college canteens.</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Right */}
                    <div className="product-info-section">
                        <div className="product-detail-card mb-4">
                            {/* Badges */}
                            <div className="product-badges-wrap" id="product-badges">
                                <span className="badge badge-primary"><i className="fas fa-tag"></i> Category</span>
                                <span className="badge badge-success"><i className="fas fa-certificate"></i> Condition</span>
                            </div>

                            {/* Title */}
                            <h1 id="product-title" className="product-detail-title">Loading product...</h1>

                            {/* Price Box */}
                            <div className="product-price-box">
                                <div>
                                    <div className="text-xs text-secondary uppercase tracking-wider font-bold mb-0.5">Campus Price</div>
                                    <div id="product-price" className="product-price-amount">₹0</div>
                                </div>
                                <div id="product-price-badge">
                                    <span className="badge badge-success"><i className="fas fa-handshake"></i> Negotiable</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="product-actions-grid !grid-cols-[1fr_1fr_auto] !gap-2.5">
                                <button className="btn-chat-action" id="btn-chat">
                                    <i className="fas fa-comment-dots"></i> Chat with Seller
                                </button>
                                <button className="btn-offer-action" id="btn-make-offer">
                                    <i className="fas fa-handshake"></i> Make an Offer
                                </button>
                                <button className="btn-fav-action" id="btn-fav" title="Save to Favorites" onClick={(e) => window.toggleFavoriteDetail && window.toggleFavoriteDetail(e.currentTarget)}>
                                    <i className="far fa-heart"></i>
                                </button>
                            </div>

                            <div className="campus-guarantee-note">
                                <i className="fas fa-shield-alt text-base"></i>
                                <span>Campus Verified Seller • Meet safely in hostel or library</span>
                            </div>

                            <div className="mt-3 flex justify-center items-center gap-2">
                                <button type="button" className="btn btn-ghost btn-sm text-secondary !text-[0.78rem] !py-1.5 !px-3 !gap-1.5 !rounded-sm whitespace-nowrap" id="btn-open-report">
                                    <i className="fas fa-flag text-danger"></i> Report this listing
                                </button>
                                <button type="button" className="btn btn-sm !text-[0.78rem] !py-1.5 !px-3 !gap-1.5 !rounded-sm !bg-red-50 !text-red-600 !border !border-red-200 !font-semibold whitespace-nowrap hover:!bg-red-600 hover:!text-white" id="btn-admin-delete-listing" style={{ display: 'none' }}>
                                    <i className="fas fa-trash-alt"></i> Delete this listing
                                </button>
                            </div>
                        </div>

                        {/* Compact Modern Seller Card */}
                        <div className="seller-card">
                            <div className="seller-card-title">
                                <i className="fas fa-id-badge text-primary"></i> Seller Profile
                            </div>

                            <div className="seller-card-header">
                                <img id="seller-avatar" src="https://ui-avatars.com/api/?name=Student&background=4F46E5&color=fff" className="seller-avatar-img" alt="Seller" />
                                <div className="seller-info-col">
                                    <div className="seller-name-row">
                                        <span className="seller-name" id="seller-name">Student Seller</span>
                                        <span className="badge badge-success !text-[0.68rem] !py-0.5 !px-2"><i className="fas fa-check-circle"></i> Verified</span>
                                    </div>
                                    <div className="stars text-[0.85rem] mt-1">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                        <span className="text-secondary text-[0.78rem] ml-1.5" id="seller-reviews-count">Campus Peer</span>
                                    </div>
                                </div>
                            </div>

                            <div className="seller-meta-list">
                                <div className="seller-meta-item">
                                    <i className="fas fa-university text-primary w-4"></i>
                                    <span id="seller-college">VIT Bhopal University</span>
                                </div>
                                <div className="seller-meta-item">
                                    <i className="fas fa-hotel text-primary w-4"></i>
                                    <span id="seller-hostel">Hostel Resident</span>
                                </div>
                                <div className="seller-meta-item">
                                    <i className="fas fa-bolt text-warning w-4"></i>
                                    <span>Usually replies within 15 mins</span>
                                </div>
                            </div>

                            <button type="button" className="btn btn-primary w-full btn-sm mt-3 !font-semibold !rounded-[10px]" id="btn-seller-profile-chat">
                                <i className="fas fa-comment-dots"></i> Chat with Seller
                            </button>
                            <button type="button" className="btn btn-outline w-full btn-sm mt-2 !font-semibold !rounded-[10px]" id="btn-open-review">
                                <i className="fas fa-star text-warning"></i> Rate &amp; Review Seller
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Listing Modal */}
            <div className="modal-overlay" id="modal-report">
                <div className="modal !max-w-[480px]">
                    <div className="modal-header">
                        <h3 className="!text-[1.15rem] !font-bold"><i className="fas fa-flag text-danger mr-1"></i> Report This Listing</h3>
                        <button type="button" className="modal-close" onClick={() => window.closeModal && window.closeModal('modal-report')}><i className="fas fa-times"></i></button>
                    </div>
                    <form id="form-report-product">
                        <p className="text-xs text-secondary mb-3">Our campus moderators review all reports to keep the marketplace authentic and safe.</p>
                        <div className="form-group mb-3">
                            <label className="form-label text-xs font-bold" htmlFor="report-reason">Reason for Report</label>
                            <select id="report-reason" className="form-control text-sm" defaultValue="scam" required>
                                <option value="scam">Scam / Payment Fraud</option>
                                <option value="fake">Fake / Counterfeit Item</option>
                                <option value="inappropriate">Prohibited / Inappropriate on Campus</option>
                                <option value="wrong-info">Misleading Price or Description</option>
                                <option value="other">Other Campus Policy Violation</option>
                            </select>
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label text-xs font-bold" htmlFor="report-desc">Additional Details</label>
                            <textarea id="report-desc" className="form-control text-sm" rows="3" placeholder="Please describe why this item should be removed..." required></textarea>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.closeModal && window.closeModal('modal-report')}>Cancel</button>
                            <button type="submit" className="btn btn-danger btn-sm" id="btn-submit-report"><i className="fas fa-paper-plane mr-1"></i> Submit Report</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Make an Offer Modal */}
            <div className="modal-overlay" id="modal-offer">
                <div className="modal !max-w-[480px] !rounded-xl">
                    <div className="modal-header">
                        <h3 className="!text-xl !font-extrabold flex items-center gap-2 text-slate-900">
                            <i className="fas fa-handshake text-primary"></i> Make an Offer
                        </h3>
                        <button type="button" className="modal-close" onClick={() => window.closeModal && window.closeModal('modal-offer')}><i className="fas fa-times"></i></button>
                    </div>
                    <form id="form-make-offer">
                        {/* Item Summary Mini Card */}
                        <div className="bg-background border border-border rounded-md p-4 mb-5 flex justify-between items-center">
                            <div>
                                <div className="text-xs text-secondary font-bold uppercase">Listed Item</div>
                                <div id="modal-offer-product-title" className="font-bold text-slate-900 text-[0.95rem] max-w-[260px] truncate">Product</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-secondary font-bold uppercase">Campus Price</div>
                                <div id="modal-offer-product-price" className="font-extrabold text-primary text-[1.15rem]">₹0</div>
                            </div>
                        </div>

                        {/* Discount Preset Buttons */}
                        <div className="mb-3">
                            <label className="form-label text-xs font-bold mb-1.5">Quick Price Suggestions</label>
                            <div className="flex gap-2" id="offer-presets-container">
                                <button type="button" className="btn btn-outline btn-sm flex-1 !p-1.5 !text-[0.8rem] !rounded-sm" id="preset-10">-10%</button>
                                <button type="button" className="btn btn-outline btn-sm flex-1 !p-1.5 !text-[0.8rem] !rounded-sm" id="preset-15">-15%</button>
                                <button type="button" className="btn btn-outline btn-sm flex-1 !p-1.5 !text-[0.8rem] !rounded-sm" id="preset-20">-20%</button>
                            </div>
                        </div>

                        {/* Custom Amount Input */}
                        <div className="form-group mb-3">
                            <label className="form-label text-xs font-bold" htmlFor="offer-amount-input">Your Offer Amount (₹) <span className="text-danger">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-[1.2rem] text-primary">₹</span>
                                <input type="number" id="offer-amount-input" className="form-control !pl-9 !text-xl !font-extrabold !text-primary" placeholder="e.g. 850" min="1" required />
                            </div>
                        </div>

                        {/* Optional Note */}
                        <div className="form-group mb-4">
                            <label className="form-label text-xs font-bold" htmlFor="offer-message-input">Note to Seller (Optional)</label>
                            <textarea id="offer-message-input" className="form-control text-sm" rows="2" placeholder="e.g. Can pick up today from Hostel Block 1!"></textarea>
                        </div>

                        <div className="campus-safety-alert mb-4 !py-3 !px-4 !text-[0.8rem]">
                            <i className="fas fa-envelope text-primary mr-1"></i> The seller will be notified instantly via email with your offer.
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.closeModal && window.closeModal('modal-offer')}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-sm !py-2.5 !px-6 !font-bold" id="btn-submit-offer">
                                <i className="fas fa-paper-plane mr-1"></i> Send Offer
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Rate & Review Seller Modal */}
            <div className="modal-overlay" id="modal-review">
                <div className="modal !max-w-[480px]">
                    <div className="modal-header">
                        <h3 className="!text-[1.15rem] !font-bold"><i className="fas fa-star text-warning mr-1"></i> Rate &amp; Review Seller</h3>
                        <button type="button" className="modal-close" onClick={() => window.closeModal && window.closeModal('modal-review')}><i className="fas fa-times"></i></button>
                    </div>
                    <form id="form-review-seller">
                        <p className="text-xs text-secondary mb-3">Share your campus experience dealing with this student peer.</p>

                        <div className="form-group text-center mb-3">
                            <label className="form-label text-xs font-bold">Your Rating</label>
                            <div className="stars-picker flex justify-center gap-2 mt-1 text-[1.8rem] cursor-pointer text-slate-300" id="review-stars-picker">
                                <i className="fas fa-star" data-rating="1"></i>
                                <i className="fas fa-star" data-rating="2"></i>
                                <i className="fas fa-star" data-rating="3"></i>
                                <i className="fas fa-star" data-rating="4"></i>
                                <i className="fas fa-star" data-rating="5"></i>
                            </div>
                            <input type="hidden" id="review-rating-val" defaultValue="5" />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label text-xs font-bold" htmlFor="review-comment">Review Comment</label>
                            <textarea id="review-comment" className="form-control text-sm" rows="3" placeholder="How was their response time, hostel meetup, and item condition?" required></textarea>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.closeModal && window.closeModal('modal-review')}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-sm" id="btn-submit-review"><i className="fas fa-check mr-1"></i> Submit Review</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="footer-container"></div>
        </>
    );
}
