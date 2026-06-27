import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  TextField, List, ListItem, ListItemText, Alert 
} from '@mui/material';
import { syncPull } from '../utils/sync';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Attendance({ state }) {
  const isAdmin = state.role === 'admin' && state.roleType === 'center';
  
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_attendance_session')) || { active: false }; } catch(e) { return { active: false }; }
  });

  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_student_profiles')) || {}; } catch(e) { return {}; }
  });

  const myProfile = profiles[state.user.email.toLowerCase().trim()] || {};
  const [myAttendance, setMyAttendance] = useState(myProfile.attendance || {});

  const [scheduledTime, setScheduledTime] = useState(session.time || new Date().toTimeString().slice(0,5));
  const [searchQuery, setSearchQuery] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  const html5QrCodeRef = useRef(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const monthDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  let presentInMonth = 0;
  for(let i = 1; i <= monthDays; i++) {
    const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    if (myAttendance[dStr]) presentInMonth++;
  }

  const isWindowActive = !!session.active;
  const alreadyMarked = myAttendance[todayStr] === true;

  // Real-time synchronization of session and profile databases via central sync events
  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_attendance_session') {
        setSession(data);
      } else if (key === 'nxa_student_profiles') {
        setProfiles(data);
        const myEmail = state.user.email.toLowerCase().trim();
        if (data[myEmail]) {
          setMyAttendance(data[myEmail].attendance || {});
        }
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    
    // Load initial backup values from storage
    try {
      const sessData = localStorage.getItem('nxa_attendance_session');
      if (sessData) setSession(JSON.parse(sessData));
      
      const profsData = localStorage.getItem('nxa_student_profiles');
      if (profsData) {
        const parsed = JSON.parse(profsData);
        setProfiles(parsed);
        const myEmail = state.user.email.toLowerCase().trim();
        if (parsed[myEmail]) {
          setMyAttendance(parsed[myEmail].attendance || {});
        }
      }
    } catch (e) {
      console.warn("Storage sync failed in Attendance:", e);
    }

    return () => {
      window.removeEventListener('nxa_db_updated', handleUpdate);
    };
  }, [state.user.email]);

  // Admin QR scanner logic
  const handleToggleScanner = () => {
    if (scannerActive) {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current = null;
          setScannerActive(false);
        }).catch(err => console.warn(err));
      } else {
        setScannerActive(false);
      }
    } else {
      setScannerActive(true);
      setTimeout(() => {
        if (Html5Qrcode) {
          const html5QrCode = new Html5Qrcode("scanner-container");
          html5QrCodeRef.current = html5QrCode;
          html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              // Successfully scanned a student email
              const emailScanned = decodedText.toLowerCase().trim();
              markPresent(emailScanned);
              alert(`PUNCHED SUCCESS: ${emailScanned} registered present.`);
              // Stop scanner after success
              html5QrCode.stop().then(() => {
                html5QrCodeRef.current = null;
                setScannerActive(false);
              });
            },
            (errorMessage) => {
              // Ignore standard scanning failures
            }
          ).catch(err => {
            console.warn(err);
            setScannerActive(false);
          });
        }
      }, 500);
    }
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(err => console.warn(err));
      }
    };
  }, []);

  const markPresent = (email) => {
    const emailKey = email.toLowerCase().trim();
    const updatedProfiles = { ...profiles };
    if (!updatedProfiles[emailKey]) {
      updatedProfiles[emailKey] = { email, fullname: email.split('@')[0] };
    }
    if (!updatedProfiles[emailKey].attendance) {
      updatedProfiles[emailKey].attendance = {};
    }
    updatedProfiles[emailKey].attendance[todayStr] = true;
    setProfiles(updatedProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(updatedProfiles));

    if (emailKey === state.user.email.toLowerCase().trim()) {
      setMyAttendance(updatedProfiles[emailKey].attendance);
    }

    // Sync to Firebase if loaded
    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('profiles').doc(emailKey).set(updatedProfiles[emailKey], { merge: true });
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const handleAnchorSession = () => {
    const newSession = { active: true, time: scheduledTime, date: todayStr };
    setSession(newSession);
    localStorage.setItem('nxa_attendance_session', JSON.stringify(newSession));
    
    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('config').doc('attendance_session').set(newSession);
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const handleStopSession = () => {
    const stoppedSession = { active: false, time: null, date: null };
    setSession(stoppedSession);
    localStorage.setItem('nxa_attendance_session', JSON.stringify(stoppedSession));

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('config').doc('attendance_session').set(stoppedSession);
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const filteredPunchStudents = Object.values(profiles).filter(s => {
    const q = searchQuery.toLowerCase();
    return s && typeof s === 'object' && ((s.fullname || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q));
  });

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            ATTENDANCE_NEXUS
          </Typography>
          <Typography variant="caption" sx={{ color: isWindowActive ? '#10b981' : '#64748b', fontWeight: 800, fontSize: '0.6rem' }}>
            {isWindowActive ? '🟢 SESSION ACTIVE' : '⚫ STANDBY'} {session.time ? ` · ${session.time}` : ''}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.55rem' }}>
          {now.toDateString().toUpperCase()}
        </Typography>
      </Box>

      {/* Admin Panel Controls */}
      {isAdmin && (
        <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid #0B2E59', borderRadius: '20px', p: 3, mb: 3, boxShadow: 'none' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#0B2E59', fontWeight: 900, letterSpacing: '2px', display: 'block', mb: 2 }}>
            ⚓ SESSION ANCHOR
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            <TextField
              type="time"
              size="small"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
            />
            <Button
              variant="contained"
              onClick={handleAnchorSession}
              sx={{ background: '#0B2E59', color: '#fff', '&:hover': { background: '#F7931E' } }}
            >
              ANCHOR
            </Button>
            {session.active && (
              <Button
                variant="outlined"
                onClick={handleStopSession}
                sx={{ color: '#ff4545', borderColor: '#ff4545', '&:hover': { background: 'rgba(255,69,69,0.05)', borderColor: '#ff4545' } }}
              >
                STOP
              </Button>
            )}
          </Box>
          <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#64748b', textTransform: 'uppercase', display: 'block', mb: 2 }}>
            QR window: 15 min before → 60 min after session time
          </Typography>

          {/* QR scanner block */}
          <Box sx={{ pt: 2, borderTop: '1px dashed rgba(11, 46, 89, 0.15)' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleToggleScanner}
              sx={{ color: '#0B2E59', borderColor: '#0B2E59', fontWeight: 800, py: 1 }}
            >
              {scannerActive ? '📷 STOP SCANNER' : '📷 ACTIVATE QR SCANNER'}
            </Button>
            {scannerActive && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box id="scanner-container" sx={{ width: '100%', maxWidth: '280px', height: '240px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #0B2E59' }} />
              </Box>
            )}
          </Box>

          {/* Manual punch list */}
          <Box sx={{ pt: 2, borderTop: '1px dashed rgba(11, 46, 89, 0.15)', mt: 2.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, mb: 1, display: 'block' }}>
              ✋ MANUAL PUNCH
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
            />
            {searchQuery && (
              <List sx={{ maxHeight: 200, overflowY: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid rgba(11, 46, 89, 0.08)' }}>
                {filteredPunchStudents.map(student => {
                  const hasPunchedToday = student.attendance && student.attendance[todayStr] === true;
                  return (
                    <ListItem key={student.email} sx={{ py: 1 }}>
                      <ListItemText 
                        primary={student.fullname} 
                        secondary={student.email} 
                        primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 800, color: '#0B2E59' }}
                        secondaryTypographyProps={{ fontSize: '0.6rem' }}
                      />
                      <Button
                        size="small"
                        disabled={hasPunchedToday}
                        onClick={() => markPresent(student.email)}
                        sx={{ fontSize: '0.55rem', background: '#0B2E59', color: '#fff', '&:hover': { background: '#F7931E' } }}
                      >
                        {hasPunchedToday ? 'MARKED' : 'PUNCH'}
                      </Button>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Card>
      )}

      {/* Student QR Manifestation Panel */}
      {!isAdmin && (
        <Box sx={{ mb: 3 }}>
          {isWindowActive && !alreadyMarked ? (
            <Card sx={{ background: '#ffffff', border: '1px solid rgba(11, 46, 89, 0.08)', borderRadius: '24px', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(11, 46, 89, 0.05)' }}>
              <Typography variant="caption" sx={{ color: '#0B2E59', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '2px', mb: 3 }}>
                SHOW THIS TO ADMIN SCANNER
              </Typography>
              <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: '12px', border: '1px solid rgba(11, 46, 89, 0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG
                  value={state.user.email}
                  size={150}
                  fgColor="#0B2E59"
                  bgColor="#ffffff"
                  level="H"
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                {state.user.email}
              </Typography>
            </Card>
          ) : alreadyMarked ? (
            <Card sx={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981', borderRadius: '20px', p: 4, textAlign: 'center', boxShadow: 'none' }}>
              <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>✅</Typography>
              <Typography sx={{ color: '#10b981', fontSize: '1rem', fontWeight: 800 }}>PRESENT TODAY</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.65rem', mt: 0.5 }}>{todayStr}</Typography>
            </Card>
          ) : session.active && diffInMin !== null && diffInMin < -20 ? (
            <Card sx={{ background: 'rgba(247, 147, 30, 0.02)', border: '1px dashed #F7931E', borderRadius: '20px', p: 4, textAlign: 'center', boxShadow: 'none' }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>⏳</Typography>
              <Typography sx={{ color: '#F7931E', fontSize: '0.8rem', fontWeight: 800 }}>Session Too Early</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.6rem', mt: 0.5 }}>
                Scheduled for {session.time}. QR window opens 15 mins prior.
              </Typography>
            </Card>
          ) : session.active && diffInMin !== null && diffInMin > 60 ? (
            <Card sx={{ background: 'rgba(255, 69, 69, 0.02)', border: '1px dashed #ff4545', borderRadius: '20px', p: 4, textAlign: 'center', boxShadow: 'none' }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>🚫</Typography>
              <Typography sx={{ color: '#ff4545', fontSize: '0.8rem', fontWeight: 800 }}>Session Expired</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.6rem', mt: 0.5 }}>
                The attendance window for {session.time} is closed.
              </Typography>
            </Card>
          ) : (
            <Card sx={{ border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '20px', p: 4, textAlign: 'center', background: 'none', boxShadow: 'none' }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>🌑</Typography>
              <Typography sx={{ color: '#0B2E59', fontSize: '0.8rem', fontWeight: 800 }}>No Active Session</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.6rem', mt: 0.5 }}>
                Administration hasn't initialized attendance yet.
              </Typography>
            </Card>
          )}
        </Box>
      )}

      {/* Monthly Attendance Calendar */}
      <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.08)', borderRadius: '20px', p: 3, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button onClick={handlePrevMonth} size="small" sx={{ minWidth: 'auto', p: 0.5, color: '#0B2E59', background: 'rgba(11,46,89,0.05)', borderRadius: '8px' }}>
              ◀
            </Button>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', letterSpacing: '1px', minWidth: '100px', textAlign: 'center' }}>
              {monthLabel}
            </Typography>
            <Button onClick={handleNextMonth} size="small" sx={{ minWidth: 'auto', p: 0.5, color: '#0B2E59', background: 'rgba(11,46,89,0.05)', borderRadius: '8px' }}>
              ▶
            </Button>
          </Box>
          <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 900, fontSize: '0.6rem' }}>
            {presentInMonth} / {monthDays} DAYS
          </Typography>
        </Box>

        <Grid container spacing={1}>
          {Array.from({ length: monthDays }, (_, i) => {
            const day = i + 1;
            const dayFormatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPresent = myAttendance[dayFormatted] === true;
            const isToday = dayFormatted === todayStr;

            return (
              <Grid item xs={1.714} key={day}>
                <Box
                  sx={{
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isPresent ? 'rgba(247, 147, 30, 0.08)' : 'rgba(11, 46, 89, 0.01)',
                    border: '1px solid',
                    borderColor: isToday ? '#0B2E59' : isPresent ? '#F7931E' : 'rgba(11, 46, 89, 0.06)',
                    borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
                    color: isPresent ? '#F7931E' : isToday ? '#0B2E59' : '#64748b',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.1)', zIndex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                  }}
                >
                  {day}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Card>
      
    </Box>
  );
}
