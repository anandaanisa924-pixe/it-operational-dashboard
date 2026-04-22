// WorkOrdersCard.jsx
import React, { useState, useEffect, useRef } from 'react';

function WorkOrdersCard() {
    const [openWO, setOpenWO] = useState([]);
    const [progressWO, setProgressWO] = useState([]);
    const [selectedWO, setSelectedWO] = useState(null);

    const prevOpenIdsRef = useRef(new Set());
    const prevProgressIdsRef = useRef(new Set());
    const audioRef = useRef(null);
    const isFirstLoadRef = useRef(true);

    // ===== STRIP HTML TAGS =====
    function stripHtmlTags(html) {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, ' ')
                   .replace(/&nbsp;/g, ' ')
                   .replace(/&[a-z]+;/gi, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
    }

    // ===== NORMALISASI DEPARTEMEN =====
    function normalizeDepartment(dept) {
        if (!dept) return 'Unknown';
        const deptMapping = {
            'inpark revenue': 'Inpark Revenue',
            'marketing & partership': 'Marketing & Partnership',
            'finance & accountina': 'Finance & Accounting',
            'finance & accounting': 'Finance & Accounting',
            'opration': 'Operation',
            'hr & legal': 'HR & Legal',
            'marketing': 'Marketing',
            'finance': 'Finance',
            'hr': 'HR',
            'operation': 'Operation'
        };
        const normalized = dept.toLowerCase().trim();
        if (deptMapping[normalized]) return deptMapping[normalized];
        return dept.split(' ')
            .map(word => {
                if (word === '&') return '&';
                if (word.includes('-')) {
                    return word.split('-')
                        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                        .join('-');
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    // ===== FORMAT KALIMAT  =====
    function toSentenceCase(text) {
        if (!text) return 'Tidak ada deskripsi';
        let cleanText = stripHtmlTags(text);
        if (cleanText.length === 0) return 'Tidak ada deskripsi';
        cleanText = cleanText.toLowerCase();
        const replacements = {
            it: 'IT', api: 'API', url: 'URL', http: 'HTTP', https: 'HTTPS',
            dns: 'DNS', ip: 'IP', vpn: 'VPN', ssh: 'SSH', ftp: 'FTP',
            smtp: 'SMTP', pos: 'POS', erp: 'ERP', crm: 'CRM', sop: 'SOP',
            kpi: 'KPI', wo: 'WO', id: 'ID', pdf: 'PDF', excel: 'Excel',
            word: 'Word', ppt: 'PPT', html: 'HTML', css: 'CSS', js: 'JS',
            react: 'React', node: 'Node', sql: 'SQL', db: 'DB', ui: 'UI',
            ux: 'UX', qa: 'QA', qc: 'QC', hrd: 'HRD', ceo: 'CEO', cto: 'CTO'
        };
        Object.entries(replacements).forEach(([lower, upper]) => {
            cleanText = cleanText.replace(new RegExp(`\\b${lower}\\b`, 'g'), upper);
        });
        cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        return cleanText;
    }

    function normalizeDescription(rawDesc) {
        if (!rawDesc) return 'Tidak ada deskripsi';
        return toSentenceCase(rawDesc);
    }

    function truncateNormalized(desc, maxLength = 87) {
        const normalized = normalizeDescription(desc);
        if (normalized.length <= maxLength) return normalized;
        return normalized.substring(0, maxLength) + '...';
    }

    // ===== UMUR WO UNTUK WARNA BADGE =====
    function getWOOAge(createdAt) {
        if (!createdAt) return 0;
        const created = new Date(createdAt);
        const now = new Date();
        return Math.ceil((now - created) / (1000 * 60 * 60 * 24));
    }

    function getOpenStatusColor(wo) {
        return getWOOAge(wo.created_at) >= 2 ? 'red' : 'yellow';
    }

    // ===== FORMAT TANGGAL =====
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${hours}:${minutes}`;
    }

    // ===== AUDIO =====
    useEffect(() => {
        audioRef.current = new Audio('/Sound/notifwo.mp3');
    }, []);

    useEffect(() => {
        const unlockAudio = () => {
            if (!audioRef.current) return;
            audioRef.current.volume = 0;
            audioRef.current.play()
                .then(() => {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    audioRef.current.volume = 1;
                })
                .catch(() => {});
        };
        ['click', 'keydown'].forEach(e => document.addEventListener(e, unlockAudio, { once: true }));
    }, []);

    const playSound = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
    };

    const isFreshWO = (created_at) => {
        if (!created_at) return false;
        const now = new Date();
        const created = new Date(created_at);
        return (now - created) / 1000 <= 30;
    };

    // ========== FETCH ==========//
    const fetchWO = () => {
        fetch("https://servicewo.salokapark.app/api/get_wo_request?id_dept=DP011")
            .then(res => res.json())
            .then(result => {
                const woData = result.data || [];
                const currentYear = new Date().getFullYear();

                
                const filteredData = woData.filter(wo => {
                    if (!wo.created_at) return false;
                    const woDate = new Date(wo.created_at);
                    return woDate.getFullYear() === currentYear &&
                           (wo.track_status === 2 || wo.track_status === 3) &&
                           wo.status !== 9;   
                });

                console.log(`WO tahun ${currentYear} (track_status 2/3, exclude status 9): ${filteredData.length}`);

                const sorted = [...filteredData].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                const newOpen = sorted.filter(i => i.track_status === 2);
                const newProgress = sorted.filter(i => i.track_status === 3);

                const newOpenIds = new Set(newOpen.map(i => i.id));
                const newProgressIds = new Set(newProgress.map(i => i.id));

                const hasNew =
                    [...newOpenIds].some(id => !prevOpenIdsRef.current.has(id)) ||
                    [...newProgressIds].some(id => !prevProgressIdsRef.current.has(id)) ||
                    [...newOpen, ...newProgress].some(wo => isFreshWO(wo.created_at));

                if (!isFirstLoadRef.current && hasNew) {
                    playSound();
                }

                setOpenWO(newOpen);
                setProgressWO(newProgress);

                prevOpenIdsRef.current = newOpenIds;
                prevProgressIdsRef.current = newProgressIds;

                isFirstLoadRef.current = false;
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchWO();
        const interval = setInterval(fetchWO, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleWOClick = (wo) => setSelectedWO(wo);

    return (
        <>
            <div className="card">
                <h2>🔧 WORK ORDERS</h2>

                {/* OPEN SECTION - track_status = 2 */}
                <div className="work-section">
                    <h3>OPEN <span className="wo-count">{openWO.length}</span></h3>
                    <div className="work-list-container">
                        <ul className="work-list">
                            {openWO.map((wo, index) => {
                                const color = getOpenStatusColor(wo);
                                const dept = normalizeDepartment(wo.departemen_request || 'Unknown');
                                const truncatedDesc = truncateNormalized(wo.job_description, 87);
                                return (
                                    <li key={wo.id || index} className="work-list-item" onClick={() => handleWOClick(wo)}>
                                        <div className="work-item-description">
                                            <strong>{dept}</strong> - {truncatedDesc}
                                        </div>
                                        <div className={`status-badge status-${color}`}>
                                            {color === 'red' ? '🔴' : '🟡'}
                                        </div>
                                    </li>
                                );
                            })}
                            {openWO.length === 0 && <li className="empty-message">Tidak ada WO Open</li>}
                        </ul>
                    </div>
                </div>

                {/* IN PROGRESS SECTION - track_status = 3 */}
                <div className="work-section">
                    <h3>IN PROGRESS <span className="wo-count">{progressWO.length}</span></h3>
                    <div className="work-list-container">
                        <ul className="work-list">
                            {progressWO.map((wo, index) => {
                                const dept = normalizeDepartment(wo.departemen_request || 'Unknown');
                                const truncatedDesc = truncateNormalized(wo.job_description, 87);
                                return (
                                    <li key={wo.id || index} className="work-list-item" onClick={() => handleWOClick(wo)}>
                                        <div className="work-item-description">
                                            <strong>{dept}</strong> - {truncatedDesc}
                                        </div>
                                        <div className="status-badge status-green">✅</div>
                                    </li>
                                );
                            })}
                            {progressWO.length === 0 && <li className="empty-message">Tidak ada WO In Progress</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL */}
            {selectedWO && (
                <div className="modal-overlay" onClick={() => setSelectedWO(null)}>
                    <div className="modal-content wo-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📋 Detail Work Order</h3>
                            <button className="modal-close" onClick={() => setSelectedWO(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-detail">
                                <div className="modal-icon">📅</div>
                                <div className="modal-detail-content">
                                    <div className="modal-label">Dibuat Pada</div>
                                    <div className="modal-value">{formatDate(selectedWO.created_at)}</div>
                                </div>
                            </div>
                            <div className="modal-detail">
                                <div className="modal-icon">🔄</div>
                                <div className="modal-detail-content">
                                    <div className="modal-label">Terakhir Update</div>
                                    <div className="modal-value">{formatDate(selectedWO.updated_at)}</div>
                                </div>
                            </div>
                            <div className="modal-detail">
                                <div className="modal-icon">🏢</div>
                                <div className="modal-detail-content">
                                    <div className="modal-label">Departemen</div>
                                    <div className="modal-value">{normalizeDepartment(selectedWO.departemen_request || '-')}</div>
                                </div>
                            </div>
                            <div className="modal-detail">
                                <div className="modal-icon">👤</div>
                                <div className="modal-detail-content">
                                    <div className="modal-label">Nama Request</div>
                                    <div className="modal-value">{selectedWO.name_request || '-'}</div>
                                </div>
                            </div>
                            <div className="modal-detail">
                                <div className="modal-icon">📝</div>
                                <div className="modal-detail-content">
                                    <div className="modal-label">Deskripsi Pekerjaan</div>
                                    <div className="modal-value job-description">
                                        {normalizeDescription(selectedWO.job_description)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="modal-button" onClick={() => setSelectedWO(null)}>Tutup</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default WorkOrdersCard;