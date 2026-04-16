
import React from 'react';

function AnnouncementCard() {
    return (
        <div className="card">
            <h2> 📢 ANNOUNCEMENTS</h2>
            <div className="announcement-content">
                <div className="announcement-item">
                    <h4>Server Maintenance</h4>
                    
                </div>
                <div className="announcement-item">
                    <h4>Inventory Update</h4>
                    <p>Version 2.4 Released</p>
                </div>
            </div>
        </div>
    );
}

export default AnnouncementCard;