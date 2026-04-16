// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import CalendarCard from '../components/CalendarCard';
import BirthdayCard from '../components/BirthdayCard';
import WorkOrdersCard from '../components/WorkOrdersCard';
import DailyReviewCard from '../components/DailyReviewCard';
import TicketStatusCard from '../components/TicketStatusCard';
import InfrastructureCard from '../components/InfrastructureCard';
import StatusFooter from '../components/StatusFooter';
import '../styles/dashboard.css';

function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const [shake, setShake] = useState(false);
    
    const CORRECT_PIN = '1154';

    const handlePinSubmit = (e) => {
        e.preventDefault();
        
        if (pinInput === CORRECT_PIN) {
            setIsAuthenticated(true);
            setPinError('');
            setPinInput('');
        } else {
            setPinError('PIN salah!');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPinInput('');
        }
    };

    // Tampilkan PIN Modal jika belum authenticated
    if (!isAuthenticated) {
        return (
            <div className="pin-overlay">
                <div className={`pin-container ${shake ? 'shake' : ''}`}>
                    <div className="pin-header">
                        <span className="pin-lock-icon">🔒</span>
                        <h2>MASUKKAN PIN</h2>
                        <p className="pin-subtitle">Akses Dashboard</p>
                    </div>
                    
                    <form onSubmit={handlePinSubmit}>
                        <div className="pin-input-wrapper">
                            <input
                                type="password"
                                maxLength="4"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="****"
                                className="pin-input-field"
                                autoFocus
                                autoComplete="off"
                            />
                            <div className="pin-dots">
                                {[...Array(4)].map((_, i) => (
                                    <span key={i} className={`pin-dot ${pinInput.length > i ? 'filled' : ''}`}>
                                        {pinInput.length > i ? '●' : '○'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {pinError && <div className="pin-error-message">{pinError}</div>}
                        
                        <button type="submit" className="pin-submit-button">
                            Verifikasi
                        </button>
                    </form>
                    
                    <div className="pin-footer">
                        <span className="pin-hint">PIN 4 digit</span>
                    </div>
                </div>
            </div>
        );
    }

    // Tampilkan Dashboard jika sudah authenticated
    return (
        <div className="dashboard">
            <Header />
            
            <div className="dashboard-grid">
                {/* ===== LEFT SECTION ===== */}
                <div className="left-section">
                    <CalendarCard />
                    <div className="birthday-wrapper">
                        <StatusFooter />
                    </div>
                </div>

                {/* ===== MIDDLE SECTION ===== */}
                <div className="middle-section">
                    <WorkOrdersCard />
                    <DailyReviewCard />
                </div>

                {/* ===== RIGHT SECTION ===== */}
                <div className="right-section">
                    <TicketStatusCard />
                    <InfrastructureCard />
                    <BirthdayCard />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;