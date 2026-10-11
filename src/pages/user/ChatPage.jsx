import React from 'react';
import { useChat } from '../../hooks/useChat.js';

export default function ChatPage() {
    useChat();
    return (
        <>
            <div id="navbar-container"></div>

            <div className="chat-container">
                {/* Sidebar: Conversations List */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-comments" style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}></i>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Messages</h2>
                        </div>
                        <span className="badge badge-primary" id="total-unread" style={{ fontSize: '0.72rem' }}>Chats</span>
                    </div>

                    {/* Search Chats */}
                    <div className="chat-search-wrap">
                        <i className="fas fa-search chat-search-icon"></i>
                        <input type="text" id="chat-search" className="chat-search-input" placeholder="Search conversations..." />
                    </div>

                    {/* Conversations List */}
                    <div className="chat-list" id="chat-list">
                        {/* Injected via JS */}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="chat-main" id="chat-main">
                    {/* Empty Welcome State (when no conversation is active) */}
                    <div className="chat-empty-view" id="chat-empty-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem', background: 'var(--background)' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.25rem' }}>
                            <i className="far fa-comments"></i>
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Messages</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                            Select an ongoing conversation from the left, or click &quot;Chat with Seller&quot; on any campus listing to inquire about textbooks, electronics, cycles, and hostel pickup.
                        </p>
                        <a href="/products.html" className="btn btn-primary" style={{ fontWeight: 700 }}>
                            <i className="fas fa-compass mr-1"></i> Browse Campus Listings
                        </a>
                    </div>

                    {/* Active Chat View (hidden until a conversation is opened) */}
                    <div id="chat-active-view" style={{ display: 'none', flexDirection: 'column', height: '100%' }}>
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-user">
                                <img id="active-chat-avatar" src="" className="chat-header-avatar" alt="Avatar" />
                                <div>
                                    <div className="font-bold text-base" id="active-chat-name" style={{ color: 'var(--text-primary)' }}></div>
                                    <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                                        <span id="active-chat-status"></span>
                                        <span id="active-chat-item-badge" className="badge badge-info" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', marginLeft: '0.3rem' }}></span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button type="button" className="btn btn-outline btn-sm text-danger" title="Delete conversation" onClick={() => window.deleteActiveChat && window.deleteActiveChat()} style={{ borderColor: 'rgba(239,68,68,0.35)', color: 'var(--danger)' }}>
                                    <i className="fas fa-trash-alt mr-1"></i> Delete
                                </button>
                                <a href="/products.html" className="btn btn-outline btn-sm" title="View Marketplace">
                                    <i className="fas fa-store"></i> Browse
                                </a>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-messages" id="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                            {/* Injected via JS */}
                        </div>

                        {/* Input Bar */}
                        <form className="chat-input-area" id="chat-form">
                            <input type="text" id="chat-input" className="chat-input-field" placeholder="Type a message to arrange campus meetup..." required autoComplete="off" />
                            <button type="submit" className="chat-send-btn" title="Send message">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
