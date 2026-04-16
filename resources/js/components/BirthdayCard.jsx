import React, { useState, useEffect } from 'react';

function BirthdayCard() {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(0);

    const fetchBirthdays = async (isFirstLoad = false) => {
        try {
            if (isFirstLoad) setLoading(true);

            const response = await fetch('http://staginglokahr.salokapark.app/api/get_all_karyawan');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success' && data.karyawanActive) {
                const formattedBirthdays = data.karyawanActive.map(karyawan => ({
                    name: karyawan.name,
                    dept: karyawan.departemen,
                    dob: karyawan.dob
                }));

                setBirthdays(formattedBirthdays);
                setError(null);
            } else {
                throw new Error('Data tidak valid dari server');
            }
        } catch (err) {
            console.error('Error fetching birthdays:', err);
            setError('Gagal memuat data ulang tahun');
        } finally {
            if (isFirstLoad) setLoading(false);
        }
    };

    useEffect(() => {
        fetchBirthdays(true);

        const interval = setInterval(() => {
            fetchBirthdays(false);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // ===== FILTER LOGIC =====
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth() + 1;

    let filtered = [];

    if (selectedMonth === 0) {
        filtered = birthdays.filter(item => {
            if (!item.dob) return false;
            const dobDate = new Date(item.dob);
            return dobDate.getDate() === todayDate &&
                   dobDate.getMonth() + 1 === todayMonth;
        });
    } else {
        filtered = birthdays.filter(item => {
            if (!item.dob) return false;
            const dobDate = new Date(item.dob);
            return dobDate.getMonth() + 1 === selectedMonth;
        });

        filtered.sort((a, b) => {
            return new Date(a.dob).getDate() - new Date(b.dob).getDate();
        });
    }

    // ===== UI =====
    if (loading) {
        return (
            <div className="card birthday-card">
                <div className="card-header">
                    <h2>🎂 BIRTHDAY</h2>
                </div>

                <div className="birthday-content">
                    <div className="loading-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card birthday-card">
                <div className="card-header">
                    <h2>🎂 BIRTHDAY</h2>
                </div>

                <div className="birthday-content">
                    <div className="error-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '100%' }}>
                        <p style={{ textAlign: 'center' }}>{error}</p>
                        <button onClick={() => fetchBirthdays(true)} className="retry-btn">
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card birthday-card">

            {/* HEADER + FILTER */}
            <div className="card-header">
                <h2>🎂 BIRTHDAY</h2>

                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="birthday-filter"
                >
                    <option value={0}>Today</option>
                    <option value={1}>Jan</option>
                    <option value={2}>Feb</option>
                    <option value={3}>Mar</option>
                    <option value={4}>Apr</option>
                    <option value={5}>May</option>
                    <option value={6}>Jun</option>
                    <option value={7}>Jul</option>
                    <option value={8}>Aug</option>
                    <option value={9}>Sep</option>
                    <option value={10}>Oct</option>
                    <option value={11}>Nov</option>
                    <option value={12}>Dec</option>
                </select>
            </div>

            {/* CONTENT - Gunakan wrapper birthday-content */}
            <div className="birthday-content">
                {filtered.length === 0 ? (
                    <div className="no-birthday">
                        {selectedMonth === 0
                            ? "🎉 No Birthday Today 🎉"
                            : "🎊 No birthdays this month 🎊"}
                    </div>
                ) : (
                    <div className="birthday-items">
                        {filtered.map((item, index) => {
                            const dobDate = new Date(item.dob);
                            const day = dobDate.getDate();

                            return (
                                <div key={index} className="birthday-item">
                                    <div className="birthday-name">
                                        <span>{item.name}</span>
                                        <span className="birthday-date">
                                            {day}
                                        </span>
                                    </div>

                                    <div className="birthday-dept">
                                        {item.dept}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BirthdayCard;