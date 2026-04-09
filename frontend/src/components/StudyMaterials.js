import React, { useState, useEffect } from 'react';
import * as mammoth from 'mammoth';
import '../styles/StudyMaterials.css';

const DocxViewer = ({ url }) => {
    const [html, setHtml] = useState('Loading document...');

    useEffect(() => {
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
            .then(result => setHtml(result.value))
            .catch(err => setHtml('<div style="color:red; text-align:center;">Failed to parse Word Document. Please download to view.</div>'));
    }, [url]);

    return (
        <div
            style={{ padding: '2rem 3rem', background: '#fff', color: '#000', width: '100%', height: '100%', overflowY: 'auto', fontFamily: 'serif' }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

const StudyMaterials = ({ user }) => {
    const [materials, setMaterials] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    // Preview State
    const [previewMaterial, setPreviewMaterial] = useState(null);

    const fetchMaterials = async () => {
        try {
            const url = user && user.id
                ? `http://localhost:8000/study-materials/student/${user.id}?category=${categoryFilter === 'All' ? '' : categoryFilter}`
                : `http://localhost:8000/study-materials/?category=${categoryFilter === 'All' ? '' : categoryFilter}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch materials');
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [categoryFilter, user]);

    const toggleFavorite = async (materialId) => {
        if (!user || !user.id) {
            alert("Please login to use favorites.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/study-materials/${materialId}/favorite/${user.id}`, { method: 'POST' });
            if (response.ok) {
                // Optimistically update UI
                setMaterials(materials.map(m => {
                    if (m.id === materialId) return { ...m, is_favorite: !m.is_favorite };
                    return m;
                }));
            }
        } catch (error) {
            console.error("Toggle favorite failed:", error);
        }
    };

    const getIconClass = (type) => {
        switch (type) {
            case 'pdf': return 'icon-pdf';
            case 'video': return 'icon-video';
            case 'presentation': return 'icon-presentation';
            case 'word': return 'icon-word';
            case 'image': return 'icon-image';
            default: return 'icon-document';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return '📄';
            case 'video': return '▶️';
            case 'presentation': return '📊';
            case 'word': return '📝';
            case 'image': return '🖼️';
            case 'txt': return '📃';
            default: return '📁';
        }
    };

    const getAbsoluteUrl = (url) => {
        return url.startsWith('/static') ? `http://localhost:8000${url}` : url;
    };

    const handleDownload = async (material) => {
        const url = getAbsoluteUrl(material.file_url);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            const extMatch = material.file_url.match(/\.[0-9a-z]+$/i);
            const ext = extMatch ? extMatch[0] : '';
            const safeTitle = material.title.replace(/[^a-z0-9]/gi, '_');
            link.download = `${safeTitle}${ext}`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download fetch failed, falling back to new tab:', error);
            window.open(url, '_blank');
        }
    };

    const handlePreview = (material) => {
        setPreviewMaterial(material);
    };

    const renderPreviewContent = () => {
        if (!previewMaterial) return null;
        const url = getAbsoluteUrl(previewMaterial.file_url);
        const type = previewMaterial.file_type;

        if (type === 'pdf' || type === 'txt') {
            return <iframe src={url} title="Preview" />;
        } else if (type === 'video') {
            return <video src={url} controls autoPlay />;
        } else if (type === 'image') {
            return <img src={url} alt="Preview" />;
        } else if (type === 'word') {
            return <DocxViewer url={url} />;
        } else if (type === 'presentation' || type === 'document') {
            const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
            const gviewer = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                    {isLocalhost && (
                        <div style={{ padding: '0.75rem', background: '#fef3c7', color: '#b45309', textAlign: 'center', fontSize: '0.85rem', borderBottom: '1px solid #fde68a' }}>
                            ⚠️ <b>Local Preview Limitation:</b> Since you are running on your local machine (`localhost`), Google's Online Viewer cannot reach your file to preview it. It will work perfectly once deployed! For now, please use the <b>Download</b> button.
                        </div>
                    )}
                    <iframe src={gviewer} style={{ flex: 1, width: '100%', border: 'none' }} title="Preview File" />
                </div>
            );
        }

        // Default fallback
        return <iframe src={url} title="Preview" />;
    };

    return (
        <div className="study-materials-container">
            <div className="materials-header">
                <h1>Study Materials</h1>
                <p>Access notes, PDFs, and resources uploaded by your faculty.</p>
            </div>

            <div className="filter-tabs">
                {['All', 'Favorites', 'General Studies', 'Polity', 'History', 'Economy', 'Geography'].map(cat => (
                    <button
                        key={cat}
                        className={`tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                        onClick={() => setCategoryFilter(cat)}
                    >
                        {cat === 'Favorites' ? '❤️ Favorites' : cat}
                    </button>
                ))}
            </div>

            <div className="materials-grid">
                {loading ? (
                    <div className="no-materials">Loading materials...</div>
                ) : materials.length > 0 ? (
                    materials.map(mat => (
                        <div key={mat.id} className="material-card">
                            <button
                                className={`fav-btn ${mat.is_favorite ? 'favorited' : ''}`}
                                onClick={() => toggleFavorite(mat.id)}
                                title={mat.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                            >
                                {mat.is_favorite ? '❤️' : '🤍'}
                            </button>

                            <div className={`material-icon ${getIconClass(mat.file_type)}`}>
                                {getIcon(mat.file_type)}
                            </div>
                            <div className="material-category">{mat.category}</div>
                            <h3 className="material-title">{mat.title}</h3>
                            <p className="material-desc">{mat.description || 'No description provided.'}</p>

                            <div className="material-actions">
                                <button className="material-action view-btn" onClick={() => handlePreview(mat)}>
                                    <span>👁️</span> Preview
                                </button>
                                <button className="material-action" onClick={() => handleDownload(mat)}>
                                    <span>↓</span> Download
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-materials">
                        <div className="no-materials-icon">📚</div>
                        <h3>No Materials Found</h3>
                        <p>Your faculty hasn't uploaded any materials in this category yet.</p>
                    </div>
                )}
            </div>

            {/* Full Screen Preview Modal */}
            {previewMaterial && (
                <div className="preview-modal-overlay" onClick={() => setPreviewMaterial(null)}>
                    <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3>{previewMaterial.title}</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button className="material-action" style={{ padding: '0.4rem 1rem', width: 'auto' }} onClick={() => handleDownload(previewMaterial)}>
                                    <span>↓</span> Download
                                </button>
                                <button className="close-preview-btn" onClick={() => setPreviewMaterial(null)}>×</button>
                            </div>
                        </div>
                        <div className="preview-body">
                            {renderPreviewContent()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyMaterials;
