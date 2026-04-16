import React from 'react';

function InfrastructureCard() {
    return (
        <div className="card">
            <h2>⚡ INFRASTRUCTURE STATUS</h2>
            
            <div className="infrastructure-item">
                <span>APP SERVER:</span> <span>ONLINE</span>
            </div>
            <div className="infrastructure-item">
                <span>DATABASE:</span> <span>ONLINE</span>
            </div>
            <div className="infrastructure-item">
                <span>INTERNET ISP 1:</span> <span>ONLINE</span>
            </div>
            <div className="infrastructure-item warning">
                <span>BACKUP SYSTEM:</span> <span className="value">⚠️ WARNING</span>
            </div>
        </div>
    );
}

export default InfrastructureCard;