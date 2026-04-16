// src/components/CalendarCard.jsx
import React, { useState, useEffect } from 'react';

function CalendarCard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const API_KEY = 'AIzaSyBHBdDMyz7zUHjFCeuPBQNjDEysZkV6KjQ';
  const CALENDAR_ID = 'admin.it@salokapark.com';
  const BASE_URL = 'https://www.googleapis.com/calendar/v3';

  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Hanya +6 hari untuk total 7 hari (hari ini + 6 hari ke depan)
  const getNextWeekEnd = () => {
    const end = new Date();
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const fetchEvents = async () => {
    try {
      const timeMin = getTodayStart();
      const timeMax = getNextWeekEnd();

      const params = new URLSearchParams({
        key: API_KEY,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      });

      const url = `${BASE_URL}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal fetch calendar');
      const data = await response.json();

      const formatted = (data.items || []).map(item => {
        const startDate = item.start?.dateTime || item.start?.date;
        let timeDisplay = 'All day';
        if (item.start?.dateTime) {
          const d = new Date(item.start.dateTime);
          timeDisplay = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        }

        return {
          id: item.id,
          title: item.summary || 'No Title',
          date: startDate,
          time: timeDisplay,
          location: item.location || null,
          description: item.description || null,
        };
      });

      formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const groupEventsByDate = () => {
    const grouped = new Map();
    events.forEach(event => {
      const dateObj = new Date(event.date);
      const key = dateObj.toISOString().split('T')[0];
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(event);
    });
    const sortedKeys = Array.from(grouped.keys()).sort();
    return { grouped, sortedKeys };
  };

  const { grouped, sortedKeys } = groupEventsByDate();

  return (
    <>
      <div className="card calendar-card">
        <div className="card-header">
          <h2>📅 CALENDAR</h2>
        </div>

        {loading && events.length === 0 ? (
          <div className="card-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: '#b0c4de' }}>Memuat jadwal...</p>
          </div>
        ) : sortedKeys.length === 0 ? (
          <div className="card-content">
            <p style={{ fontSize: '0.7rem', color: '#b0c4de' }}>Tidak ada event dalam 7 hari ke depan</p>
          </div>
        ) : (
          <div className="card-content">
            <div className="calendar-week-view">
              {sortedKeys.map(dateKey => {
                const dayEvents = grouped.get(dateKey);
                const isMultiple = dayEvents.length > 1;
                return (
                  <div key={dateKey} className="calendar-day-group">
                    <div className="calendar-day-header">
                      <span className="calendar-day-name">{formatDateHeader(dateKey)}</span>
                    </div>
                    <div className="calendar-day-events">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="calendar-event-item"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="calendar-event-left">
                            {isMultiple && <span className="calendar-event-bullet">•</span>}
                            <span className="calendar-event-title">{event.title}</span>
                          </div>
                          <span className="calendar-event-time-right">{event.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Event */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEvent.title}</h3>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-detail">
                <span className="modal-icon">🕒</span>
                <div>
                  <div className="modal-label">Jam</div>
                  <div className="modal-value">{selectedEvent.time}</div>
                </div>
              </div>
              <div className="modal-detail">
                <span className="modal-icon">📅</span>
                <div>
                  <div className="modal-label">Tanggal</div>
                  <div className="modal-value">{formatDateHeader(selectedEvent.date)}</div>
                </div>
              </div>
              {selectedEvent.location && (
                <div className="modal-detail">
                  <span className="modal-icon">📍</span>
                  <div>
                    <div className="modal-label">Lokasi</div>
                    <div className="modal-value">{selectedEvent.location}</div>
                  </div>
                </div>
              )}
              {selectedEvent.description && (
                <div className="modal-detail">
                  <span className="modal-icon">📝</span>
                  <div>
                    <div className="modal-label">Deskripsi</div>
                    <div className="modal-value">{selectedEvent.description}</div>
                  </div>
                </div>
              )}
            </div>
            <button className="modal-button" onClick={() => setSelectedEvent(null)}>Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

export default CalendarCard;