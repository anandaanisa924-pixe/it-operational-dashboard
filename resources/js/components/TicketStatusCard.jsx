// TicketStatusCard.js
import React, { useState, useEffect } from 'react';

function TicketStatusCard() {
    const [open, setOpen] = useState(0);
    const [progress, setProgress] = useState(0);
    const [closed, setClosed] = useState(0);
    const [avgSolveTime, setAvgSolveTime] = useState(0);

    const formatDuration = (ms) => {
        if (!ms || ms <= 0) return "0 Detik";

        const totalSeconds = Math.floor(ms / 1000);

        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let result = [];

        if (days) result.push(`${days} Hari`);
        if (hours) result.push(`${hours} Jam`);
        if (minutes) result.push(`${minutes} Menit`);
        if (seconds) result.push(`${seconds} Detik`);

        return result.join(" ");
    };

    const formatDateTime = (date, endOfDay = false) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        if (endOfDay) {
            return `${year}-${month}-${day} 23:59:59`;
        }

        return `${year}-${month}-${day} 00:00:00`;
    };

    useEffect(() => {
        const fetchTicketStatus = async () => {
            try {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);

                const ticketStart = formatDateTime(startOfYear);
                const ticketFinish = formatDateTime(now, true);

                // Ambil SEMUA tiket dalam periode tahun ini (untuk hitung open, progress, closed)
                const response = await fetch(
                    `https://serviceitdesk.salokapark.app/api/get_ticket?status=&ticket_start=${ticketStart}&ticket_finish=${ticketFinish}`
                );

                const result = await response.json();
                const ticketList = result?.data?.ticket_mst || [];

                let openCount = 0;
                let progressCount = 0;
                let closedCount = 0;

                ticketList.forEach(item => {
                    if (item.status === '1') openCount++;
                    else if (item.status === '4') progressCount++;
                    else if (item.status === '9') closedCount++;
                });

                // AMBIL KHUSUS tiket CLOSED dalam periode tahun ini
                // Filter by status=9 AND ticket_start >= awal tahun AND ticket_finish <= sekarang
                const closedTickets = ticketList.filter(item => {
                    if (item.status !== '9') return false;
                    
                    // Pastikan ada ticket_start dan ticket_finish
                    if (!item.ticket_start || !item.ticket_finish) return false;
                    
                    const start = new Date(item.ticket_start.replace(' ', 'T'));
                    const finish = new Date(item.ticket_finish.replace(' ', 'T'));
                    const startOfYearDate = new Date(now.getFullYear(), 0, 1);
                    
                    // Pastikan tiket dibuat setelah awal tahun ini DAN selesai sebelum sekarang
                    return start >= startOfYearDate && finish <= now;
                });

                let totalSolveTime = 0;
                let validCount = 0;

                closedTickets.forEach(item => {
                    const start = new Date(item.ticket_start.replace(' ', 'T'));
                    const finish = new Date(item.ticket_finish.replace(' ', 'T'));

                    const diff = finish - start;

                    if (!isNaN(diff) && diff > 0) {
                        totalSolveTime += diff;
                        validCount++;
                    }
                });

                let avgTime = 0;
                if (validCount > 0) {
                    avgTime = totalSolveTime / validCount;
                }

                setOpen(openCount);
                setProgress(progressCount);
                setClosed(closedCount);
                setAvgSolveTime(avgTime);

            } catch (error) {
                console.error("Error fetch ticket status:", error);
            }
        };

        fetchTicketStatus();

        const interval = setInterval(fetchTicketStatus, 10000);
        return () => clearInterval(interval);

    }, []);

    return (
        <div className="card ticket-status-card">
            <h2>🎫 TICKET STATUS</h2>

            <ul className="ticket-list">
                <li>
                    <span> Open</span>
                    <span className="ticket-value">{open}</span>
                </li>
                <li>
                    <span> In Progress</span>
                    <span className="ticket-value">{progress}</span>
                </li>
                <li>
                    <span> Closed</span>
                    <span className="ticket-value">{closed}</span>
                </li>
            </ul>

            {/* Card terpisah untuk Avg Solve Time */}
            <div className="solve-time-card">
                <div className="solve-time-header">
                    <span className="solve-time-icon">⏱️</span>
                    <span className="solve-time-title">TIME TO SOLVE:</span>
                </div>
                <div className="solve-time-display">
                    {formatDuration(avgSolveTime)}
                </div>
                <div className="solve-time-footer">
                    <span>Berdasarkan {closed} tiket closed </span>
                </div>
            </div>
        </div>
    );
}

export default TicketStatusCard;