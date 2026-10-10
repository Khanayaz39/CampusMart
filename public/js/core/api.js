/**
 * Centralized API configuration and generic fetch handler.
 * Usage: apiCall('/products', 'GET')
 */
const API_BASE = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:'))
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Inject auth token if available and valid
    const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        // If it's a FormData object (e.g. for image uploads), drop the Content-Type header 
        // so the browser sets it automatically with the correct boundary
        if (body instanceof FormData) {
            delete headers['Content-Type'];
            config.body = body;
        } else {
            config.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            // Check for unauthorized access
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }
            throw new Error(data.message || 'API Error');
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}
