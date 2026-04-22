// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import CalendarCard from '../components/CalendarCard';
import BirthdayCard from '../components/BirthdayCard';
import WorkOrdersCard from '../components/WorkOrdersCard';
import DailyReviewCard from '../components/DailyReviewCard';
import TicketStatusCard from '../components/TicketStatusCard';
import '../styles/dashboard.css';

// ===== KOMPONEN DASHBOARD =====
function DashboardContent() {
    return (
        <div className="dashboard">
            <Header />
            <div className="dashboard-grid">
                {/* LEFT SECTION */}
                <div className="left-section">
                    <CalendarCard />
                    <div className="birthday-wrapper"></div>
                </div>

                {/* MIDDLE SECTION */}
                <div className="middle-section">
                    <WorkOrdersCard />
                    <DailyReviewCard />
                </div>

                {/* RIGHT SECTION */}
                <div className="right-section">
                    <TicketStatusCard />
                    <BirthdayCard />
                </div>
            </div>
        </div>
    );
}

// ===== FUNGSI PEMBANTU UNTUK CEK STATUS PIN HARI INI =====
// Dipanggil secara sinkron di luar komponen untuk menentukan state awal
function getPinVerificationStatus() {
    const savedDate = localStorage.getItem('saloka_pin_date');
    const savedVerified = localStorage.getItem('saloka_pin_verified');
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return savedVerified === 'true' && savedDate === today;
}

// ===== KOMPONEN PIN GATE =====
function PinGate({ children }) {
    // State awal langsung ditentukan dari localStorage (tanpa useEffect)
    const [isVerified, setIsVerified] = useState(getPinVerificationStatus);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin === '1154') {
            const today = new Date().toISOString().slice(0, 10);
            localStorage.setItem('saloka_pin_date', today);
            localStorage.setItem('saloka_pin_verified', 'true');
            setIsVerified(true);
        } else {
            setError('PIN salah. Silakan coba lagi.');
            setPin('');
        }
    };

    if (isVerified) {
        return children;
    }

    return (
        <div className="pin-container-saloka">
            <div className="pin-card-saloka">
                <div className="pin-logo">
                    <img src="/Images/Loka.png" alt="Logo Saloka" />
                </div>
                <h2>Masukkan PIN</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="• • • •"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength="4"
                        autoFocus
                    />
                    <button type="submit">Verifikasi</button>
                    {error && <p className="pin-error-saloka">{error}</p>}
                </form>
            </div>
        </div>
    );
}

// ===== EKSPOR UTAMA =====
export default function Dashboard() {
    return (
        <PinGate>
            <DashboardContent />
        </PinGate>
    );
}