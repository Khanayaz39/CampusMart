import React from 'react';
import ReactDOM, { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import App, {
    Navbar,
    Footer,
    ProductCard,
    PaginationSlider,
    HomePage,
    ProductsPage,
    ProductDetailPage,
    CreateListingPage,
    MyListingsPage,
    FavoritesPage,
    OffersPage,
    ChatPage,
    ProfilePage,
    LoginPage,
    RegisterPage,
    AdminDashboardPage
} from './App.jsx';

const rootMap = new WeakMap();

function mountComponentSync(container, element) {
    if (!container) return false;
    try {
        let root = rootMap.get(container);
        if (!root) {
            root = createRoot(container);
            rootMap.set(container, root);
        }
        flushSync(() => {
            root.render(element);
        });
        return true;
    } catch (err) {
        console.warn('CampusReact mount fallback:', err);
        return false;
    }
}

function applyPageMetadata(pathname = '/') {
    const path = pathname.toLowerCase();
    document.body.className = '';
    document.body.removeAttribute('style');

    const savedTheme = localStorage.getItem('campusmart_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if (path.includes('admin')) {
        document.title = 'Admin Portal - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('product-detail')) {
        document.title = 'Product Details - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('products')) {
        document.title = 'Browse Products - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('create-listing')) {
        document.title = 'Post a Listing - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('my-listings')) {
        document.title = 'My Listings - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('favorites')) {
        document.title = 'Favorites - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('offers')) {
        document.title = 'Offers & Deals - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('chat')) {
        document.title = 'Campus Messages - CampusMart';
        document.body.className = 'bg-background';
        document.body.style.overflow = 'hidden';
    } else if (path.includes('profile')) {
        document.title = 'My Profile - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('login')) {
        document.title = 'Login - CampusMart';
        document.body.className = 'bg-background';
    } else if (path.includes('register')) {
        document.title = 'Register - CampusMart';
        document.body.className = 'bg-background';
    } else {
        document.title = 'CampusMart - Student Marketplace';
        document.body.className = 'bg-background';
    }
}

window.React = React;
window.ReactDOM = { ...ReactDOM, createRoot, flushSync };
window.CampusReact = {
    App,
    Navbar,
    Footer,
    ProductCard,
    PaginationSlider,
    HomePage,
    ProductsPage,
    ProductDetailPage,
    CreateListingPage,
    MyListingsPage,
    FavoritesPage,
    OffersPage,
    ChatPage,
    ProfilePage,
    LoginPage,
    RegisterPage,
    AdminDashboardPage,
    mountApp(container, props) {
        return mountComponentSync(container, <App {...props} />);
    },
    mountNavbar(container, props) {
        return mountComponentSync(container, <Navbar {...props} />);
    },
    mountFooter(container) {
        return mountComponentSync(container, <Footer />);
    },
    mountPaginationSlider(container, props) {
        return mountComponentSync(container, <PaginationSlider {...props} />);
    }
};

// Automatically apply page metadata & mount the React App into #root synchronously
if (typeof document !== 'undefined') {
    const pathname = window.location.pathname;
    applyPageMetadata(pathname);
    const rootEl = document.getElementById('root');
    if (rootEl) {
        mountComponentSync(rootEl, <App pathname={pathname} />);
    }
}
