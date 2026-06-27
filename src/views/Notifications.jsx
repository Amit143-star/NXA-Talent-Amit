import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, Grid } from '@mui/material';
import { syncPull } from '../utils/sync';

export default function Notifications({ state }) {
  const isAdmin = state.role === 'admin' && (state.roleType === 'center' || state.roleType === 'super');
  
  const [customAlerts, setCustomAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_system_alerts')) || []; } catch(e) { return []; }
  });

  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('SIGNAL');

  // Synchronize alerts via central sync events
  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_system_alerts') {
        setCustomAlerts(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);

    // Initial load from storage
    try {
      const saved = localStorage.getItem('nxa_system_alerts');
      if (saved) setCustomAlerts(JSON.parse(saved));
    } catch(e) {}

    return () => {
      window.removeEventListener('nxa_db_updated', handleUpdate);
    };
  }, []);

  const defaultAlerts = [
    { id: 'def1', type: 'SYSTEM', msg: 'Core AI Matrix Updated to v1.2', time: 'SYSTEM' },
    { id: 'def2', type: 'FOUNDER', msg: 'Welcome to NXA Talent Industrial Portal.', time: 'NARENDRA' }
  ];

  const alerts = [...customAlerts, ...defaultAlerts];

  const handleDispatchBroadcast = async () => {
    if (!broadcastMsg.trim()) return alert("Enter message content.");
    
    const newAlert = {
      id: 'alert_' + Date.now(),
      type: broadcastType,
      msg: broadcastMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newAlert, ...customAlerts];
    setCustomAlerts(updated);
    localStorage.setItem('nxa_system_alerts', JSON.stringify(updated));

    if (typeof window.firebase !== 'undefined') {
      try {
        await window.firebase.firestore().collection('broadcasts').doc(newAlert.id).set(newAlert);
      } catch(err) {
        console.warn(err);
      }
    }

    alert("SIGNAL TRANSMITTED: Broadcast signal dispatched.");
    setBroadcastMsg('');
  };

  const isDark = localStorage.getItem('nxa_dark_mode') === 'true';
  const themeTextColor = isDark ? '#e2e8f0' : '#334155';
  const themeHeaderColor = isDark ? '#f8fafc' : '#0B2E59';
  const themeBorderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(11, 46, 89, 0.08)';

  const getAlertColor = (type) => {
    if (type === 'ALERT') return '#ff4545';
    if (type === 'FOUNDER') return '#F7931E';
    return isDark ? '#38bdf8' : '#0B2E59'; // SYSTEM / SIGNAL
  };

  const getAlertBg = (type) => {
    if (isDark) {
      if (type === 'ALERT') return 'rgba(255, 69, 69, 0.1)';
      if (type === 'FOUNDER') return 'rgba(247, 147, 30, 0.1)';
      return 'rgba(255, 255, 255, 0.03)';
    } else {
      if (type === 'ALERT') return 'rgba(255, 69, 69, 0.03)';
      if (type === 'FOUNDER') return 'rgba(247, 147, 30, 0.03)';
      return 'rgba(11, 46, 89, 0.01)';
    }
  };

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Admin Broadcast controls */}
      {isAdmin && (
        <Card sx={{ background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(11, 46, 89, 0.02)', border: `1px solid ${isDark ? '#F7931E' : '#0B2E59'}`, borderRadius: '20px', p: 3, mb: 4, boxShadow: 'none' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: isDark ? '#F7931E' : '#0B2E59', fontWeight: 900, letterSpacing: '2px', display: 'block', mb: 2 }}>
            📡 BROADCAST SIGNAL
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Type your message to all students..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '12px', 
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', 
                  fontSize: '0.85rem',
                  color: themeTextColor,
                  '& fieldset': { borderColor: themeBorderColor }
                } 
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                size="small"
                sx={{ 
                  flex: 1, 
                  borderRadius: '10px', 
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', 
                  fontSize: '0.75rem', 
                  color: isDark ? '#F7931E' : '#0B2E59', 
                  fontWeight: 800,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: themeBorderColor }
                }}
              >
                <MenuItem value="SIGNAL" sx={{ fontSize: '0.75rem' }}>📢 SIGNAL</MenuItem>
                <MenuItem value="ALERT" sx={{ fontSize: '0.75rem' }}>🚨 ALERT</MenuItem>
                <MenuItem value="FOUNDER" sx={{ fontSize: '0.75rem' }}>👑 FOUNDER</MenuItem>
                <MenuItem value="SYSTEM" sx={{ fontSize: '0.75rem' }}>⚙️ SYSTEM</MenuItem>
              </Select>
              <Button
                variant="contained" onClick={handleDispatchBroadcast}
                sx={{ background: '#0B2E59', color: '#fff', px: 3, borderRadius: '10px', fontWeight: 900, fontSize: '0.7rem', '&:hover': { background: '#F7931E' } }}
              >
                ⚡ DISPATCH
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* Title */}
      <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: themeHeaderColor, mb: 3, letterSpacing: '1px' }}>
        SIGNAL_FEED
      </Typography>

      {/* Broadcast Feed list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {alerts.map((a, idx) => (
          <Card 
            key={a.id || idx}
            sx={{
              borderRadius: '16px', border: `1px solid ${themeBorderColor}`,
              background: getAlertBg(a.type), boxShadow: 'none', position: 'relative', overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: getAlertColor(a.type) }} />
            <CardContent sx={{ p: 2.5, pl: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 900, color: getAlertColor(a.type), letterSpacing: '1.5px' }}>
                  [ {a.type} ]
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {a.time || 'NOW'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: themeTextColor, fontSize: '0.85rem', lineHeight: 1.5 }}>
                {a.msg}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}
