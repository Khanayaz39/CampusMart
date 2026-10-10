import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer antialiased">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3>
                            Campus<span>Mart</span>
                        </h3>
                        <p>
                            The premier marketplace for college students to buy, sell, and connect on campus securely.
                        </p>
                        <div className="flex gap-2 text-xl">
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-facebook"></i></a>
                        </div>
                    </div>

                    <div>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/products.html">Browse Items</a></li>
                            <li><a href="/create-listing.html">Sell an Item</a></li>
                            <li><a href="/login.html">Sign In</a></li>
                            <li><a href="#">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Categories</h4>
                        <ul>
                            <li><a href="/products.html?category=books">Textbooks</a></li>
                            <li><a href="/products.html?category=electronics">Electronics</a></li>
                            <li><a href="/products.html?category=furniture">Furniture</a></li>
                            <li><a href="/products.html?category=clothing">Clothing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Safety Guidelines</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} CampusMart. All rights reserved.</p>
                    <p>Made for students, by students.</p>
                </div>
            </div>
        </footer>
    );
}
