import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';

const CurrentAffairs = ({ user }) => {
    const [currentAffairs, setCurrentAffairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchCurrentAffairs();
    }, []);

    const fetchCurrentAffairs = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/current-affairs/`);
            if (response.ok) {
                const data = await response.json();
                setCurrentAffairs(data);
                if (data.length > 0) setSelectedItem(data[0]);
            }
        } catch (error) {
            console.error("Error fetching current affairs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.REACT_APP_API_URL}${url}`;
    };

    // Returns a URL that renders the file inline (via our proxy) instead of downloading
    const getViewerUrl = (url) => {
        if (!url) return '';
        const absolute = getAbsoluteUrl(url);
        return `${process.env.REACT_APP_API_URL}/view-file/?url=${encodeURIComponent(absolute)}`;
    };


    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
        return date.toLocaleString([], { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="current-affairs-container" style={{ padding: '2rem', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="view-page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>Daily Current Affairs</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Stay updated with daily insights and exam-relevant news</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading daily updates...</div>
            ) : currentAffairs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {currentAffairs.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            style={{
                                background: 'var(--bg-card)',
                                padding: '2rem',
                                borderRadius: '24px',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'var(--bg-gradient)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>🌍</div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    Posted: {formatDateTime(item.published_date)}
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.4' }}>{item.title}</h4>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                                Read Update <span>→</span>
                            </div>
                        </div>
                    ))}

                    {selectedItem && (() => {
                        const absoluteUrl = getAbsoluteUrl(selectedItem.content_url);
                        const viewerUrl = getViewerUrl(selectedItem.content_url);

                        return (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'var(--bg-main)',
                                zIndex: 9999,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    padding: '1rem 2rem',
                                    background: 'var(--bg-card)',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{selectedItem.title}</h2>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(selectedItem.published_date).toLocaleString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <a
                                            href={absoluteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ padding: '0.5rem 1.25rem', background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}
                                        >
                                            🔗 Open in New Tab
                                        </a>
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            style={{
                                                padding: '0.6rem 1.5rem',
                                                background: '#fee2e2',
                                                color: '#ef4444',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <span>✕</span> Close Reader
                                        </button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, background: '#f8fafc' }}>
                                    <iframe
                                        src={viewerUrl}
                                        title="Current Affairs Reader"
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                    />
                                </div>
                            </div>
                        );
                    })()}


                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌍</div>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Updates Yet</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Daily current affairs will appear here once uploaded by the faculty.</p>
                </div>
            )}
        </div>
    );
};

export default CurrentAffairs;
