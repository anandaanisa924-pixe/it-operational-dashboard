// src/components/DailyReviewCard.jsx
import React, { useState, useEffect, useRef } from 'react';

function DailyReviewCard() {

  // ===== STATE UTAMA =====
  const [data, setData] = useState([]);          
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);      
  const [todayData, setTodayData] = useState([]); 
  const [isLocked, setIsLocked] = useState(false); 
  const [audioReady, setAudioReady] = useState(false); 

  // ===== REF (tidak trigger render) =====
  const playedSoundRef = useRef(false); 
  const prevLockedRef = useRef(false);  
  const intervalRef = useRef(null);     
  const audioRef = useRef(null);        

  // ===== LIST KARYAWAN YANG DI PANTAU DARI API =====
  const targetNames = [
  "Agung Prasetyo",
  "Andre Wijaksono",
  "Antika Lorien",
  "Banu Susanto",
  "Citra Aurelia Putri",
  "Farizki Adi Pratama",
  "Muhamad Khoirul Irvan",
  "Reza Zhainal Abhidin",
  "Rico Widiyatma"
];

  // ===== FORMAT TANGGAL =====
  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // 🔊 INIT AUDIO
  useEffect(() => {
    audioRef.current = new Audio('/Sound/notification.wav'); 
  }, []);

  // 🔓 UNLOCK AUDIO (harus klik user dulu)
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current.volume = 0;

      audioRef.current.play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1;
          setAudioReady(true); 
          console.log("🔓 Audio unlocked");
        })
        .catch(() => {});
    };

    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  // 🔥 CEK LOCK JAM 11
  const checkLockTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // lock aktif setelah jam 11:00
    const locked = hour > 11 || (hour === 11 && minute >= 0);
    setIsLocked(locked);
  };

  // 🔊 PLAY SOUND SAAT LOCK BERUBAH (false → true)
  useEffect(() => {
    if (!prevLockedRef.current && isLocked) {
      if (audioReady && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        playedSoundRef.current = true;
      }
    }

    prevLockedRef.current = isLocked;
  }, [isLocked, audioReady]);

  // 🔄 FETCH DATA DARI API
  const fetchData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const params = new URLSearchParams({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      });

      const response = await fetch(
        `https://serviceitchecklist.salokapark.app/api/activity-reviews?${params}`
      );

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const result = await response.json();

      if (result.status === 'success') {
        setData(result.data); // simpan data API
      } else {
        throw new Error('Data tidak valid');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 FILTER DATA HARI INI
  const processData = () => {
    if (!data.length) return;

    const todayStr = formatDate(new Date());

    // ambil hanya data tanggal hari ini
    const todayEntries = data.filter(d => d.review_date === todayStr);

    setTodayData(todayEntries);
  };

  // 🔄 INIT + AUTO REFRESH
  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(fetchData, 10000); // refresh tiap 10 detik
    const timeInterval = setInterval(checkLockTime, 1000); // cek jam tiap detik

    checkLockTime();

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timeInterval);
    };
  }, []);

  // 🔄 UPDATE DATA SAAT BERUBAH
  useEffect(() => {
    processData();
  }, [data]);

  // 🔄 RESET SOUND SETIAP HARI
  useEffect(() => {
    const reset = () => {
      playedSoundRef.current = false;
      prevLockedRef.current = false;
    };

    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

    const timeout = setTimeout(() => {
      reset();
      setInterval(reset, 86400000); 
    }, msToMidnight);

    return () => clearTimeout(timeout);
  }, []);

  // 🔄 URUTAN LIST DINAMIS
 const getOrderedList = () => {

  // yang sudah isi
  const submitted = targetNames.filter(name =>
    todayData.some(d => d.nama_karyawan === name)
  );

  // yang belum isi
  const notSubmitted = targetNames.filter(name =>
    !todayData.some(d => d.nama_karyawan === name)
  );

  // 👉 SORT ALFABET
  const sortedSubmitted = [...submitted].sort((a, b) =>
    a.localeCompare(b)
  );

  const sortedNotSubmitted = [...notSubmitted].sort((a, b) =>
    a.localeCompare(b)
  );

  // 👉 SUSUN BERDASARKAN LOCK
  return isLocked
    ? [...sortedNotSubmitted, ...sortedSubmitted]
    : [...sortedSubmitted, ...sortedNotSubmitted];
};

  const orderedNames = getOrderedList();

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card">{error}</div>;

  // ===== HITUNG STATUS =====
  const notFilledCount = targetNames.filter(
    n => !todayData.some(d => d.nama_karyawan === n)
  ).length;

  const isEmptyToday = todayData.length === 0;

  return (
    <div className="card daily-review-card">

      {/* HEADER + ICON LOCK */}
      <div className="daily-review-header">
        <h2>📋 DAILY REVIEW</h2>
        {isLocked && <span className="lock-badge">🔒</span>}
      </div>

      {/* LIST KARYAWAN */}
      <div className="daily-review-list">
        {orderedNames.map(name => {
          const filled = todayData.some(d => d.nama_karyawan === name);
          return (
            <div key={name} className="review-item">
              <span>{name}</span>
              <span>{filled ? '✅' : '❌'}</span>
            </div>
          );
        })}
      </div>

      {/* FOOTER STATUS (INTI LOGIC) */}
      <div className="daily-review-footer">
        {isEmptyToday ? (
          <span>📭 Belum ada yang mengisi hari ini</span>
        ) : notFilledCount === 0 ? (
          <span>✅ Semua sudah mengisi</span>
        ) : (
          <span>⚠️ {notFilledCount} karyawan belum mengisi</span>
        )}
      </div>

    </div>
  );
}

export default DailyReviewCard;