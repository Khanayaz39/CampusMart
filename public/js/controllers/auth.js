// ============================================
// CampusMart — Authentication & OTP Verification
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Password visibility toggle
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            const originalText = btn.innerHTML;
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            btn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // If account requires OTP verification before logging in
                if (data.requireOtp) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    showToast(data.message || 'Please verify your email code', 'info');
                    showOtpModal(email, data.devOtp);
                    return;
                }

                if (!data.token) {
                    throw new Error('Invalid authentication response from server');
                }
                
                // Store auth data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showToast('Welcome back, ' + (data.user.name || 'Student') + '!', 'success');
                
                // Handle redirect
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                
                setTimeout(() => {
                    window.location.href = redirect ? decodeURIComponent(redirect) : '/';
                }, 1000);

            } catch (error) {
                console.error('Login error:', error);
                showToast(error.message || 'Invalid email or password', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const email = document.getElementById('email').value.trim();
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (!email || !email.includes('@')) {
                showToast('Please enter a valid college email address', 'error');
                return;
            }

            const btn = document.getElementById('register-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering Account...';
            btn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: email,
                password: password,
                phone: document.getElementById('phone').value,
                role: document.getElementById('role') ? document.getElementById('role').value : 'both',
                college: document.getElementById('college').value,
                department: document.getElementById('department').value,
                year: document.getElementById('year').value,
                hostel: document.getElementById('hostel').value,
                room: document.getElementById('room').value
            };

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                btn.innerHTML = originalText;
                btn.disabled = false;

                // If OTP is required to activate account
                if (data.requireOtp) {
                    showToast('Code sent to ' + email, 'success');
                    showOtpModal(email, data.devOtp);
                    return;
                }

                // Direct login fallback if OTP disabled
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showToast('Account created successfully!', 'success');
                    setTimeout(() => window.location.href = '/', 1200);
                }

            } catch (error) {
                console.error('Registration error:', error);
                showToast(error.message || 'Registration failed. Please try again.', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});

// ============================================
// Interactive OTP Verification Modal
// ============================================
let resendTimerInterval = null;

function showOtpModal(email, devOtp = null) {
    let modal = document.getElementById('modal-otp-verification');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-otp-verification';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal animate-scale-in" style="max-width: 440px; text-align: center; border-radius: 20px; padding: 2.25rem 2rem;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: #EEF2FF; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.25rem;">
                    <i class="fas fa-shield-alt"></i>
                </div>
                
                <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.4rem;">Verify Your Email</h3>
                <p class="text-secondary" style="font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;">
                    We sent a 6-digit verification code to<br>
                    <strong id="otp-modal-email" style="color: var(--text-primary);"></strong>
                </p>

                <div id="otp-dev-hint" style="display: none; background: #FEF3C7; color: #92400E; padding: 0.6rem 1rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1.25rem; font-weight: 600;">
                    💡 Verification Code: <span id="otp-dev-code" style="font-family: monospace; font-size: 1rem; letter-spacing: 0.1em;"></span>
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                    <input type="text" id="otp-code-input" maxlength="6" placeholder="------" 
                        style="width: 220px; font-size: 2rem; font-weight: 800; letter-spacing: 0.35em; text-align: center; font-family: monospace; padding: 0.65rem 0.5rem; border: 2px solid var(--primary); border-radius: 12px; outline: none; margin: 0 auto; display: block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);">
                </div>

                <button type="button" id="btn-submit-otp" class="btn btn-primary btn-lg w-full mb-3" style="font-weight: 700;">
                    <i class="fas fa-check-circle mr-2"></i> Verify & Proceed
                </button>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
                    <button type="button" id="btn-resend-otp" class="btn btn-ghost btn-sm" style="font-weight: 600; padding: 0.4rem 0.75rem;">
                        Resend Code
                    </button>
                    <span id="otp-countdown" class="text-secondary" style="font-size: 0.8rem; font-weight: 500;">
                        Wait 60s to resend
                    </span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind Submit
        document.getElementById('btn-submit-otp').addEventListener('click', () => {
            const currentEmail = document.getElementById('otp-modal-email')?.innerText || email;
            submitOtpVerification(currentEmail);
        });
        document.getElementById('otp-code-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const currentEmail = document.getElementById('otp-modal-email')?.innerText || email;
                submitOtpVerification(currentEmail);
            }
        });

        // Bind Resend
        document.getElementById('btn-resend-otp').addEventListener('click', () => {
            const currentEmail = document.getElementById('otp-modal-email')?.innerText || email;
            triggerResendOtp(currentEmail);
        });
    }

    document.getElementById('otp-modal-email').innerText = email;
    const input = document.getElementById('otp-code-input');
    input.value = '';

    // Show dev hint ONLY if returned by backend (hidden when real Brevo email succeeds)
    const hintBox = document.getElementById('otp-dev-hint');
    const hintCode = document.getElementById('otp-dev-code');
    if (devOtp) {
        hintCode.innerText = devOtp;
        hintBox.style.display = 'block';
    } else {
        hintBox.style.display = 'none';
    }

    modal.classList.add('active');
    setTimeout(() => input.focus(), 300);

    // Start 60s countdown for Resend button
    startResendCountdown();
}

function startResendCountdown() {
    const resendBtn = document.getElementById('btn-resend-otp');
    const countdownEl = document.getElementById('otp-countdown');
    if (!resendBtn || !countdownEl) return;

    let secondsLeft = 60;
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.5';

    if (resendTimerInterval) clearInterval(resendTimerInterval);

    resendTimerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            clearInterval(resendTimerInterval);
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
            countdownEl.innerText = 'Ready to resend';
        } else {
            countdownEl.innerText = `Wait ${secondsLeft}s to resend`;
        }
    }, 1000);
}

async function triggerResendOtp(email) {
    const resendBtn = document.getElementById('btn-resend-otp');
    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        const res = await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('New verification code sent to ' + email, 'success');
            const hintBox = document.getElementById('otp-dev-hint');
            const hintCode = document.getElementById('otp-dev-code');
            if (hintBox && hintCode) {
                if (data.devOtp) {
                    hintCode.innerText = data.devOtp;
                    hintBox.style.display = 'block';
                } else {
                    hintBox.style.display = 'none';
                }
            }
            startResendCountdown();
        } else {
            showToast(data.message || 'Could not resend OTP', 'error');
        }
    } catch (e) {
        showToast('Network error while resending OTP', 'error');
    } finally {
        resendBtn.innerHTML = 'Resend Code';
    }
}

async function submitOtpVerification(email) {
    const input = document.getElementById('otp-code-input');
    const otp = input.value.trim();
    const btn = document.getElementById('btn-submit-otp');

    if (!otp || otp.length !== 6) {
        showToast('Please enter the complete 6-digit code', 'warning');
        input.focus();
        return;
    }

    const originalBtn = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Verification failed');
        }

        // Successfully verified!
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showToast('🎉 Email verified! Welcome to CampusMart.', 'success');

        const modal = document.getElementById('modal-otp-verification');
        modal?.classList.remove('active');

        // Handle redirect
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');

        setTimeout(() => {
            window.location.href = redirect ? decodeURIComponent(redirect) : '/';
        }, 1200);

    } catch (err) {
        console.error('OTP Verification Error:', err);
        showToast(err.message || 'Invalid or expired code', 'error');
        btn.innerHTML = originalBtn;
        btn.disabled = false;
        input.focus();
    }
}
