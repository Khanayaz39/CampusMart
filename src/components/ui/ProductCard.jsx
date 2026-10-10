import React from 'react';

export default function ProductCard({
    product,
    index = 0,
    isFavorited = false,
    onToggleFavorite,
    formatPrice,
    formatDate,
    getConditionClass,
    includeCardId = false
}) {
    const id = product._id || product.id;
    const conditionClass = typeof getConditionClass === 'function'
        ? getConditionClass(product.condition)
        : 'condition-good';
    const imageUrl = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'https://via.placeholder.com/400x300?text=No+Image';
    const formattedPrice = typeof formatPrice === 'function'
        ? formatPrice(product.price)
        : `₹${Number(product.price || 0).toLocaleString('en-IN')}`;
    const formattedDate = typeof formatDate === 'function'
        ? formatDate(product.createdAt || new Date())
        : new Date(product.createdAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div
            id={includeCardId ? `fav-card-${id}` : undefined}
            className={`product-card stagger-${(index % 5) + 1} animate-fade-in-up`}
            onClick={() => { window.location.href = `/product-detail.html?id=${id}`; }}
        >
            <div className="product-image-wrapper">
                <img
                    src={imageUrl}
                    alt={product.title || 'Campus Item'}
                    className="product-image"
                    loading="lazy"
                />
                <span className="product-badge badge-primary">
                    {product.category || 'NEW'}
                </span>
                <button
                    type="button"
                    className={`favorite-btn ${isFavorited ? 'active' : ''}`}
                    title={isFavorited ? 'Remove from Saved' : 'Save to Favorites'}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onToggleFavorite === 'function') {
                            onToggleFavorite(e, id, e.currentTarget);
                        }
                    }}
                >
                    <i className={isFavorited ? 'fas fa-heart text-danger' : 'far fa-heart'}></i>
                </button>
            </div>

            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <div className="product-price">{formattedPrice}</div>
                <div className="product-meta">
                    <span className={`condition-badge ${conditionClass}`}>
                        {product.condition || 'Used'}
                    </span>
                    <span>
                        <i className="fas fa-clock mr-1"></i> {formattedDate}
                    </span>
                </div>
            </div>
        </div>
    );
}
