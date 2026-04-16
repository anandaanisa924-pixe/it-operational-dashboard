import React, { useState, useEffect } from 'react';

function TicketStatusCard() {
    const [open, setOpen] = useState(0);
    const [progress, setProgress] = useState(0);
    const [closed, setClosed] = useState(0);

    useEffect(() => {
        const fetchTicketStatus = async () => {
            try {
                const response = await fetch(
                    "https://servicewo.salokapark.app/api/get_wo_request?id_dept=DP011"
                );
                const result = await response.json();

                const data = result.data || result;

                let openCount = 0;
                let progressCount = 0;
                let closedCount = 0;

                data.forEach(item => {
                    if (item.track_status === 2) openCount++;
                    else if (item.track_status === 3) progressCount++;
                    else if (item.track_status === 4) closedCount++;
                });

                setOpen(openCount);
                setProgress(progressCount);
                setClosed(closedCount);

            } catch (error) {
                console.error("Error fetch ticket status:", error);
            }
        };

        // pertama kali load
        fetchTicketStatus();

        // auto refresh tiap 10 detik
        const interval = setInterval(fetchTicketStatus, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card">
            <h2>🎫 TICKET STATUS</h2>

            <ul className="ticket-list">
                <li><span>Open:</span> <span className="ticket-value">{open}</span></li>
                <li><span>In Progress:</span> <span className="ticket-value">{progress}</span></li>
                <li><span>Closed:</span> <span className="ticket-value">{closed}</span></li>
            </ul>
        </div>
    );
}

export default TicketStatusCard;