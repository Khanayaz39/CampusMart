import React, { useEffect } from 'react';
import { initAuthPage } from '../../utils/authHelper.js';

export default function LoginPage() {
    useEffect(() => {
        initAuthPage();
    }, []);

    return (
        <>
            <div id="navbar-container"></div>

            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-header">
                        <a href="/" className="auth-logo">Campus<span>Mart</span></a>
                        <p className="auth-subtitle">Welcome back! Please login to your account.</p>
                    </div>

                    <form id="login-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">College Email</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute text-secondary" style={{ top: '1rem', left: '1rem' }}></i>
                                <input type="email" id="email" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="student@college.edu" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute text-secondary" style={{ top: '1rem', left: '1rem' }}></i>
                                <input type="password" id="password" className="form-control" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="••••••••" required />
                                <i className="far fa-eye absolute text-secondary cursor-pointer" id="toggle-password" style={{ top: '1rem', right: '1rem', cursor: 'pointer' }}></i>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="remember" className="accent-primary w-4 h-4" />
                                <span className="text-secondary">Remember me</span>
                            </label>
                            <a href="#" className="text-primary-color font-bold">Forgot password?</a>
                        </div>

                        <button type="submit" className="btn btn-primary w-full justify-center btn-lg" id="login-btn">
                            <span>Sign In</span>
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don&apos;t have an account? <a href="/register.html">Sign up</a>
                    </div>
                </div>
            </div>
        </>
    );
}
