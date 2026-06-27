import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField } from '@mui/material';
import { syncPull, syncPush } from '../utils/sync';

export default function Live({ state }) {
  const isSuper = state.role === 'admin' && state.roleType === 'super';
  const isMax = state.role === 'admin' && state.roleType === 'max';
  const isExecutive = isMax;

  const [liveData, setLiveData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_live_broadcast')) || { active: false }; } catch(e) { return { active: false }; }
  });

  const [topic, setTopic] = useState(liveData.topic || '');
  const [link, setLink] = useState(liveData.link || '');

  // Synchronize with Firebase Firestore or local sync server in real-time
  useEffect(() => {
    let unsubscribe;
    let timer;

    const setupSync = async () => {
      const isFirebaseActive = typeof window !== 'undefined' && window.firebase && window.firebase.apps.length > 0;
      
      if (isFirebaseActive) {
        try {
          const db = window.firebase.firestore();
          unsubscribe = db.collection('config').doc('live_broadcast').onSnapshot((doc) => {
            if (doc.exists) {
              const data = doc.data();
              setLiveData(data);
              window.originalSetItem.call(localStorage, 'nxa_live_broadcast', JSON.stringify(data));
              if (!isExecutive) {
                setTopic(data.topic || '');
                setLink(data.link || '');
              }
            }
          });
        } catch (e) {
          console.warn("Firebase snapshot subscribe failed:", e);
        }
      } else {
        const fetchInitial = async () => {
          const data = await syncPull('nxa_live_broadcast');
          if (data) {
            setLiveData(data);
            if (!isExecutive) {
              setTopic(data.topic || '');
              setLink(data.link || '');
            }
          }
        };
        fetchInitial();

        if (!isExecutive) {
          timer = setInterval(async () => {
            const data = await syncPull('nxa_live_broadcast');
            if (data) {
              setLiveData(data);
              setTopic(data.topic || '');
              setLink(data.link || '');
            }
          }, 4000);
        }
      }
    };

    setupSync();

    return () => {
      if (unsubscribe) unsubscribe();
      if (timer) clearInterval(timer);
    };
  }, [isExecutive]);

  const handleStartLive = () => {
    if (!topic.trim() || !link.trim()) return alert("Topic and Meeting Link are required.");
    
    const updated = { active: true, topic: topic.trim(), link: link.trim() };
    setLiveData(updated);
    syncPush('nxa_live_broadcast', updated);

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('config').doc('live_broadcast').set(updated);
      } catch(e) {
        console.warn(e);
      }
    }
    alert("BROADCAST COMMENCED: Transmission active.");
  };

  const handleStopLive = () => {
    const updated = { active: false, topic: '', link: '' };
    setLiveData(updated);
    syncPush('nxa_live_broadcast', updated);
    setTopic('');
    setLink('');

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('config').doc('live_broadcast').set(updated);
      } catch(e) {
        console.warn(e);
      }
    }
    alert("TRANSMISSION TERMINATED.");
  };

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContents: 'space-between', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            LIVE_MATRIX
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box 
              sx={{ 
                width: 8, height: 8, borderRadius: '50%',
                background: liveData.active ? '#ff4545' : '#64748b',
                boxShadow: liveData.active ? '0 0 8px #ff4545' : 'none'
              }} 
            />
            <Typography variant="caption" sx={{ color: liveData.active ? '#ff4545' : '#64748b', fontWeight: 800, fontSize: '0.6rem' }}>
              {liveData.active ? 'BROADCAST ON AIR' : 'SYSTEM OFFLINE'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Admin controls */}
      {isExecutive && (
        <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid', borderColor: liveData.active ? '#ff4545' : 'rgba(11, 46, 89, 0.08)', p: 3, borderRadius: '18px', mb: 3, boxShadow: 'none' }}>
          <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#0B2E59', mb: 2, display: 'block' }}>
            {liveData.active ? 'SESSION ACTIVE' : 'INITIATE UPLINK'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>SESSION TOPIC</Typography>
              <TextField 
                fullWidth size="small" value={topic} onChange={(e) => setTopic(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>MEET LINK</Typography>
              <TextField 
                fullWidth size="small" value={link} onChange={(e) => setLink(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button
                variant="contained" onClick={handleStartLive}
                sx={{ flex: 1, background: '#10b981', color: '#fff', fontWeight: 900, '&:hover': { background: '#059669' } }}
              >
                {liveData.active ? 'UPDATE' : 'START LIVE'}
              </Button>
              {liveData.active && (
                <>
                  <Button
                    variant="outlined" onClick={() => window.open(liveData.link, '_blank')}
                    sx={{ flex: 1, color: '#0B2E59', borderColor: '#0B2E59', fontWeight: 800 }}
                  >
                    JOIN
                  </Button>
                  <Button
                    variant="contained" onClick={handleStopLive}
                    sx={{ flex: 1, background: '#ff4545', color: '#fff', fontWeight: 900 }}
                  >
                    TERMINATE
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Card>
      )}

      {/* Main Broadcast display */}
      <Card sx={{ background: 'rgba(11, 46, 89, 0.01)', border: '1px solid rgba(11, 46, 89, 0.08)', borderRadius: '20px', p: 4, textAlign: 'center', boxShadow: 'none' }}>
        {liveData.active ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ px: 1.5, py: 0.5, background: '#ff4545', color: '#fff', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 900, mb: 2 }}>
              LIVE NOW
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0B2E59', mb: 1.5, fontFamily: "'Outfit', sans-serif" }}>
              {liveData.topic}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
              Mentor Uplink Active. Join live session below.
            </Typography>
            <Button
              variant="contained" onClick={() => window.open(liveData.link, '_blank')}
              sx={{ background: '#ff4545', color: '#fff', px: 5, py: 1.8, borderRadius: '30px', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '1px' }}
            >
              JOIN UPLINK
            </Button>
          </Box>
        ) : (
          <Box sx={{ py: 3 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.2 }}>📡</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 2 }}>System Offline</Typography>
            <Button disabled sx={{ background: 'rgba(11, 46, 89, 0.03)', color: '#64748b', px: 4, borderRadius: '8px' }}>
              IDLE STATE
            </Button>
          </Box>
        )}
      </Card>

    </Box>
  );
}
