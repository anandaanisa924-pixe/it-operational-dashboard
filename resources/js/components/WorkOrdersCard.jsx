import React, { useState, useEffect, useRef } from 'react';

function WorkOrdersCard() {
    const [openWO, setOpenWO] = useState([]);
    const [progressWO, setProgressWO] = useState([]);

    const prevOpenIdsRef = useRef(new Set());
    const prevProgressIdsRef = useRef(new Set());
    const audioRef = useRef(null);
    const isFirstLoadRef = useRef(true);

    // ===== FORMAT JOB NAME =====
    function formatJobName(str) {
        const exceptions = ['SSD', 'HDD', 'LAN', 'VPN'];
        return str
            .split(' ')
            .map(word => {
                if (exceptions.includes(word.toUpperCase())) return word.toUpperCase();
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    // ===== HITUNG UMUR WO =====
    function getWOOAge(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        return Math.ceil((now - created) / (1000 * 60 * 60 * 24));
    }

    function getOpenStatusColor(wo) {
        return getWOOAge(wo.created_at) >= 2 ? 'red' : 'yellow';
    }

    // ===== INIT AUDIO =====
    useEffect(() => {
        audioRef.current = new Audio('/Sound/notification1.wav');
    }, []);

    // ===== UNLOCK AUDIO =====
    useEffect(() => {
        const unlockAudio = () => {
            if (!audioRef.current) return;

            audioRef.current.volume = 0;
            audioRef.current.play()
                .then(() => {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    audioRef.current.volume = 1;
                    console.log("✅ Audio unlocked");
                })
                .catch(() => {});
        };

        ['click', 'keydown'].forEach(e => {
            document.addEventListener(e, unlockAudio, { once: true });
        });
    }, []);

    // ===== PLAY SOUND =====
    const playSound = () => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;
        audioRef.current.play()
            .then(() => console.log("🔊 Sound dimainkan"))
            .catch(e => console.log("❌ Audio error:", e));
    };

    // ===== DETEKSI WO BARU BERDASARKAN WAKTU =====
    const isFreshWO = (created_at) => {
        const now = new Date();
        const created = new Date(created_at);
        const diffSec = (now - created) / 1000;
        return diffSec <= 30;
    };

    // ===== FETCH WO =====
    const fetchWO = () => {
        fetch("https://servicewo.salokapark.app/api/get_wo_request?id_dept=DP011")
            .then(res => res.json())
            .then(result => {
                const woData = result.data || [];

                const sorted = [...woData].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                const newOpen = sorted.filter(i => i.track_status === 2).slice(0, 5);
                const newProgress = sorted.filter(i => i.track_status === 3).slice(0, 5);

                const newOpenIds = new Set(newOpen.map(i => i.id));
                const newProgressIds = new Set(newProgress.map(i => i.id));

                // ===== DETEKSI ID BARU =====
                const hasNewOpen = [...newOpenIds].some(id => !prevOpenIdsRef.current.has(id));
                const hasNewProgress = [...newProgressIds].some(id => !prevProgressIdsRef.current.has(id));

                // ===== DETEKSI WO BARU BERDASARKAN WAKTU =====
                const hasFresh = [...newOpen, ...newProgress].some(wo => isFreshWO(wo.created_at));

                // ===== MAIN LOGIC SOUND =====
                if (!isFirstLoadRef.current) {
                    if (hasNewOpen || hasNewProgress || hasFresh) {
                        console.log("🚨 TRIGGER SOUND!");
                        playSound();
                    }
                }

                // ===== UPDATE STATE =====
                setOpenWO(newOpen);
                setProgressWO(newProgress);

                prevOpenIdsRef.current = newOpenIds;
                prevProgressIdsRef.current = newProgressIds;

                // ===== SET FIRST LOAD FALSE =====
                if (isFirstLoadRef.current) {
                    isFirstLoadRef.current = false;
                }
            })
            .catch(err => console.error("Error:", err));
    };

    useEffect(() => {
        fetchWO();
        const interval = setInterval(fetchWO, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card">
            <h2>🔧 WORK ORDERS</h2>

            {/* OPEN */}
            <div className="work-section">
                <h3>OPEN</h3>
                <ul className="work-list">
                    {openWO.map((wo, i) => {
                        const color = getOpenStatusColor(wo);
                        return (
                            <li key={i}>
                                <span>
                                    {formatJobName(wo.job_name)} - {wo.departemen_request}
                                </span>
                                <span className={`status-badge status-${color}`}>
                                    {color === 'red' ? '🔴' : '🟡'}
                                </span>
                            </li>
                        );
                    })}
                    {openWO.length === 0 && <li>Tidak ada WO Open</li>}
                </ul>
            </div>

            {/* PROGRESS */}
            <div className="work-section">
                <h3>IN PROGRESS</h3>
                <ul className="work-list">
                    {progressWO.map((wo, i) => (
                        <li key={i}>
                            <span>
                                {formatJobName(wo.job_name)} - {wo.departemen_request}
                            </span>
                            <span className="status-badge status-green">✅</span>
                        </li>
                    ))}
                    {progressWO.length === 0 && <li>Tidak ada WO In Progress</li>}
                </ul>
            </div>
        </div>
    );
}

export default WorkOrdersCard;