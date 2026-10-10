import React from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProductCard from './components/ui/ProductCard.jsx';
import PaginationSlider from './components/ui/PaginationSlider.jsx';
import HomePage from './pages/marketplace/HomePage.jsx';
import ProductsPage from './pages/marketplace/ProductsPage.jsx';
import ProductDetailPage from './pages/marketplace/ProductDetailPage.jsx';
import CreateListingPage from './pages/marketplace/CreateListingPage.jsx';
import MyListingsPage from './pages/marketplace/MyListingsPage.jsx';
import FavoritesPage from './pages/marketplace/FavoritesPage.jsx';
import OffersPage from './pages/user/OffersPage.jsx';
import ChatPage from './pages/user/ChatPage.jsx';
import ProfilePage from './pages/user/ProfilePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';

export default function App({ pathname = window.location.pathname }) {
    const path = (pathname || '/').toLowerCase();

    if (path.includes('admin/dashboard') || path.includes('/admin')) {
        return <AdminDashboardPage />;
    }
    if (path.includes('product-detail')) {
        return <ProductDetailPage />;
    }
    if (path.includes('products')) {
        return <ProductsPage />;
    }
    if (path.includes('create-listing')) {
        return <CreateListingPage />;
    }
    if (path.includes('my-listings')) {
        return <MyListingsPage />;
    }
    if (path.includes('favorites')) {
        return <FavoritesPage />;
    }
    if (path.includes('offers')) {
        return <OffersPage />;
    }
    if (path.includes('chat')) {
        return <ChatPage />;
    }
    if (path.includes('profile')) {
        return <ProfilePage />;
    }
    if (path.includes('login')) {
        return <LoginPage />;
    }
    if (path.includes('register')) {
        return <RegisterPage />;
    }
    return <HomePage />;
}

export {
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
};
