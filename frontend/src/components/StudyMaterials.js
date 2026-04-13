import React, { useState, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { ReactReader } from 'react-reader';
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
                ? `${process.env.REACT_APP_API_URL}/study-materials/student/${user.id}?category=${categoryFilter === 'All' ? '' : categoryFilter}`
                : `${process.env.REACT_APP_API_URL}/study-materials/?category=${categoryFilter === 'All' ? '' : categoryFilter}`;

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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/study-materials/${materialId}/favorite/${user.id}`, { method: 'POST' });
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
            case 'pdf': return 'icon-pdf ebook-style';
            case 'video': return 'icon-video';
            case 'presentation': return 'icon-presentation';
            case 'word': return 'icon-word';
            case 'image': return 'icon-image';
            case 'ebook': return 'icon-pdf ebook-style';
            default: return 'icon-document';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return '📖';
            case 'video': return '▶️';
            case 'presentation': return '📊';
            case 'word': return '📝';
            case 'image': return '🖼️';
            case 'txt': return '📃';
            case 'ebook': return '📖';
            default: return '📁';
        }
    };

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.REACT_APP_API_URL}${url}`;
    };

    // Routes any file through our backend proxy served with Content-Disposition: inline
    const getProxyUrl = (url) => {
        if (!url) return '';
        const absolute = getAbsoluteUrl(url);
        return `${process.env.REACT_APP_API_URL}/view-file/?url=${encodeURIComponent(absolute)}`;
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
        const proxyUrl = getProxyUrl(previewMaterial.file_url);
        const type = previewMaterial.file_type;
        const extMatch = previewMaterial.file_url.match(/\.[0-9a-z]+$/i);
        const ext = extMatch ? extMatch[0].toLowerCase() : '';

        if (type === 'pdf' || type === 'txt') {
            // Proxy serves with Content-Disposition: inline — works on Azure & localhost
            return <iframe src={proxyUrl} title="Preview" style={{ width: '100%', height: '100%', border: 'none' }} />;
        } else if (type === 'video') {
            return <video src={url} controls autoPlay controlsList="nodownload" style={{ width: '100%', height: '100%' }} />;
        } else if (type === 'image') {
            return <img src={url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
        } else if (type === 'word') {
            return <DocxViewer url={url} />;
        } else if (type === 'ebook') {
            if (ext === '.epub') {
                return (
                    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                        <ReactReader url={url} title={previewMaterial.title} locationChanged={(epubcifi) => console.log(epubcifi)} />
                    </div>
                );
            } else {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem', textAlign: 'center', justifyContent: 'center', height: '100%', background: '#fff' }}>
                        <h2 style={{ color: '#F2921D' }}>Preview not natively supported</h2>
                        <p>Web previews for {ext.toUpperCase()} files are currently not directly supported.</p>
                        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#64748b' }}>E-books are restricted from being downloaded directly to comply with copyright guidelines.</p>
                    </div>
                );
            }
        } else if (type === 'presentation' || type === 'document') {
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                    <iframe src={proxyUrl} style={{ flex: 1, width: '100%', border: 'none' }} title="Preview File" />
                </div>
            );
        }

        // Default fallback — use proxy
        return <iframe src={proxyUrl} title="Preview" style={{ width: '100%', height: '100%', border: 'none' }} />;
    };


    return (
        <div className="study-materials-container">
            <div className="materials-header">
                <h1>Study Materials</h1>
                <p>Access notes, PDFs, and resources uploaded by your faculty.</p>
            </div>

            <div className="filter-tabs">
                {['All', 'Favorites', 'Art and Culture', 'Polity', 'History', 'Economy', 'Geography'].map(cat => (
                    <button
                        key={cat}
                        className={`tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                        onClick={() => setCategoryFilter(cat)}
                    >
                        {cat === 'Favorites' ? '❤️ Favorites' : cat}
                    </button>
                ))}
            </div>

            <div className="materials-container-grouped">
                {loading ? (
                    <div className="no-materials">Loading materials...</div>
                ) : materials.length > 0 ? (
                    (() => {
                        const groups = {
                            'Videos': [],
                            'Images': [],
                            'E-books': [],
                            'Documents': [],
                            'Other': []
                        };

                        materials.forEach(mat => {
                            const type = String(mat.file_type || '').toLowerCase();
                            if (type === 'video') groups['Videos'].push(mat);
                            else if (type === 'image') groups['Images'].push(mat);
                            else if (type === 'ebook' || type === 'pdf') groups['E-books'].push(mat);
                            else if (['word', 'presentation', 'txt', 'document'].includes(type)) groups['Documents'].push(mat);
                            else groups['Other'].push(mat);
                        });

                        return Object.entries(groups).map(([groupName, mats]) => {
                            if (mats.length === 0) return null;
                            const rowId = `scroll-row-${groupName.replace(/\s+/g, '-')}`;

                            const scrollRow = (direction) => {
                                const container = document.getElementById(rowId);
                                if (container) {
                                    const scrollAmount = 350;
                                    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
                                }
                            };

                            return (
                                <div key={groupName} className="material-group">
                                    <div className="material-group-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <h2 className="material-group-title">{groupName}</h2>
                                            <span className="material-group-count">{mats.length} Item{mats.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        {mats.length > 4 && (
                                            <button className="see-all-btn" onClick={() => {
                                                const container = document.getElementById(rowId);
                                                if (container) {
                                                    container.classList.toggle('expanded');
                                                }
                                            }}>See All</button>
                                        )}
                                    </div>
                                    <div className="materials-row-container">
                                        {mats.length > 4 && (
                                            <button className="scroll-arrow left" onClick={() => scrollRow('left')}>‹</button>
                                        )}
                                        <div id={rowId} className="materials-row">
                                            {mats.map(mat => (
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
                                                            <span>{(mat.file_type === 'ebook' || mat.file_type === 'pdf') ? '📖 Read' : '👁️ Preview'}</span>
                                                        </button>
                                                        {(mat.file_type !== 'ebook' && mat.file_type !== 'pdf') && (
                                                            <button className="material-action" onClick={() => handleDownload(mat)}>
                                                                <span>↓</span> Download
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {mats.length > 4 && (
                                            <button className="scroll-arrow right" onClick={() => scrollRow('right')}>›</button>
                                        )}
                                    </div>
                                </div>
                            );
                        });
                    })()
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
                            <h3>📄 {previewMaterial.title}</h3>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <a
                                    href={getAbsoluteUrl(previewMaterial.file_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '0.4rem 1rem',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        color: '#cbd5e1',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    🔗 Open in New Tab
                                </a>
                                {previewMaterial.file_type !== 'ebook' && previewMaterial.file_type !== 'pdf' && (
                                    <button
                                        style={{
                                            padding: '0.4rem 1rem',
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            color: '#cbd5e1',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}
                                        onClick={() => handleDownload(previewMaterial)}
                                    >
                                        ↓ Download
                                    </button>
                                )}
                                <button className="close-preview-btn" onClick={() => setPreviewMaterial(null)}>✕</button>
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
