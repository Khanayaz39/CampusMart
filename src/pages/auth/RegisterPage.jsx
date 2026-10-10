import React from 'react';

export default function RegisterPage() {
    return (
        <>
            <div id="navbar-container"></div>

            <div className="auth-page">
                <div className="auth-card large">
                    <div className="auth-header">
                        <a href="/" className="auth-logo">Campus<span>Mart</span></a>
                        <p className="auth-subtitle">Create your account to start buying and selling.</p>
                    </div>

                    <form id="register-form">
                        <div className="register-form-grid">
                            {/* Left Column */}
                            <div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="name">Full Name</label>
                                    <input type="text" id="name" className="form-control" placeholder="e.g. Ayaz Khan" required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">College Email</label>
                                    <input type="email" id="email" className="form-control" placeholder="student@vitbhopal.ac.in" required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="password">Password</label>
                                    <input type="password" id="password" className="form-control" placeholder="Min 6 characters" required minLength="6" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" className="form-control" placeholder="Repeat password" required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="phone">Phone Number</label>
                                    <input type="tel" id="phone" className="form-control" placeholder="(555) 123-4567" required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="role">Marketplace Role</label>
                                    <select id="role" className="form-control" defaultValue="both" required>
                                        <option value="both">Both (Buyer &amp; Seller) - All-Rounder</option>
                                        <option value="buyer">Campus Buyer (Looking to purchase)</option>
                                        <option value="seller">Campus Seller (Looking to sell)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="college">College/University</label>
                                    <select id="college" className="form-control" defaultValue="" required>
                                        <option value="">Select your college</option>
                                        <option value="VIT Bhopal University">VIT Bhopal University</option>
                                        <option value="VIT Chennai">VIT Chennai</option>
                                        <option value="VIT AP">VIT AP</option>
                                        <option value="VIT Vellore">VIT Vellore</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="department">Department</label>
                                    <input type="text" id="department" className="form-control" placeholder="e.g. Computer Science" required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="year">Year of Study</label>
                                    <select id="year" className="form-control" defaultValue="" required>
                                        <option value="">Select year</option>
                                        <option value="1">1st Year (Freshman)</option>
                                        <option value="2">2nd Year (Sophomore)</option>
                                        <option value="3">3rd Year (Junior)</option>
                                        <option value="4">4th Year (Senior)</option>
                                        <option value="5">5th Year / Graduate</option>
                                    </select>
                                </div>

                                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div className="form-group mb-0">
                                        <label className="form-label" htmlFor="hostel">Hostel/Dorm</label>
                                        <input type="text" id="hostel" className="form-control" placeholder="Building Name" />
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label" htmlFor="room">Room</label>
                                        <input type="text" id="room" className="form-control" placeholder="A101" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <label className="flex items-center gap-2 justify-center mb-4 cursor-pointer text-sm">
                                <input type="checkbox" required className="accent-primary w-4 h-4" />
                                <span className="text-secondary">I agree to the <a href="#" className="text-primary-color font-semibold">Terms of Service</a> and <a href="#" className="text-primary-color font-semibold">Privacy Policy</a></span>
                            </label>
                            <button type="submit" className="btn btn-primary btn-lg w-full" style={{ maxWidth: '300px' }} id="register-btn">
                                Create Account
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer mt-5">
                        Already have an account? <a href="/login.html">Sign in here</a>
                    </div>
                </div>
            </div>
        </>
    );
}
