import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  Dialog, DialogTitle, DialogContent, TextField, Link,
  Divider, List, ListItem, ListItemText
} from '@mui/material';

export default function Courses({ state, setView }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeCourseId, setActiveCourseId] = useState(null); // When viewing detail
  const [utrId, setUtrId] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submittingPay, setSubmittingPay] = useState(false);

  const [courses, setCourses] = useState(() => {
    const defaultCourses = [
      { id: '1', title: 'Advanced Neural AI', domain: 'Artificial Intelligence', price: '499', videos: [{title: 'Lesson 1: Intro', ytId: 'dQw4w9WgXcQ'}], refs: [], docs: [] },
      { id: '2', title: 'Full-Stack Nexus', domain: 'Web Engineering', price: '599', videos: [], refs: [], docs: [] },
      { id: '3', title: 'Cyber Security Protocol', domain: 'Security', price: '699', videos: [], refs: [], docs: [] }
    ];
    try {
      const saved = localStorage.getItem('nxa_system_courses');
      return saved ? JSON.parse(saved) : defaultCourses;
    } catch(e) {
      return defaultCourses;
    }
  });

  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_student_profiles')) || {}; } catch(e) { return {}; }
  });

  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_system_courses') {
        setCourses(data);
      } else if (key === 'nxa_student_profiles') {
        setProfiles(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    return () => window.removeEventListener('nxa_db_updated', handleUpdate);
  }, []);

  const myProfile = profiles[state.user.email.toLowerCase().trim()] || {};
  const myCourseIds = myProfile.assigned_courses || [];
  const myCourses = courses.filter(c => myCourseIds.includes(c.id));
  
  const payConfig = JSON.parse(localStorage.getItem('nxa_payment_config')) || { upi: '', qr: '' };

  const handleShowPayment = (course) => {
    setSelectedCourse(course);
  };

  const handleClosePayment = () => {
    setSelectedCourse(null);
    setUtrId('');
    setProofFile(null);
  };

  const handleUploadProof = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProofFile(event.target.result); // Base64 encoding of image
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = () => {
    if (!utrId.trim()) return alert("UTR Transaction ID is required.");
    setSubmittingPay(true);

    const logEntry = {
      timestamp: Date.now(),
      email: state.user.email,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      price: selectedCourse.price || '999',
      utr: utrId.trim(),
      proof: proofFile || '',
      status: 'pending'
    };

    // Save logs
    let logs = [];
    try { logs = JSON.parse(localStorage.getItem('nxa_payment_logs')) || []; } catch(e) { logs = []; }
    logs.unshift(logEntry);
    localStorage.setItem('nxa_payment_logs', JSON.stringify(logs));

    // Update pending courses state
    const pendingCourses = myProfile.pending_courses || [];
    if (!pendingCourses.includes(selectedCourse.id)) {
      pendingCourses.push(selectedCourse.id);
    }
    const updatedProfile = { ...myProfile, pending_courses: pendingCourses };
    const updatedProfiles = { ...profiles, [state.user.email.toLowerCase().trim()]: updatedProfile };
    setProfiles(updatedProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(updatedProfiles));

    // Write to Firebase if present
    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('payment_logs').doc('utr_' + utrId.trim()).set(logEntry);
        window.firebase.firestore().collection('profiles').doc(state.user.email.toLowerCase().trim()).set(updatedProfile, { merge: true });
      } catch(e) {
        console.warn(e);
      }
    }

    alert("VERIFICATION TRANSMITTED: Audit system logged transaction details.");
    handleClosePayment();
    setSubmittingPay(false);
  };

  // If viewing a single course details page
  if (activeCourseId) {
    const course = courses.find(c => c.id === activeCourseId);
    if (!course) {
      setActiveCourseId(null);
      return null;
    }

    const videos = course.videos || [];
    const refs = course.refs || [];
    const docs = course.docs || [];

    return (
      <Box sx={{ p: 3, pb: '120px' }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
          <Button 
            onClick={() => setActiveCourseId(null)}
            sx={{ minWidth: 'auto', fontSize: '1.2rem', color: '#0B2E59', p: 0 }}
          >
            ←
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
              {course.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 800, fontSize: '0.6rem' }}>
              {(course.domain || 'Industrial_Core').toUpperCase()}
            </Typography>
          </Box>
        </Box>

        {course.desc && (
          <Box sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.06)', p: 2, borderRadius: '12px', mb: 3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
              {course.desc}
            </Typography>
          </Box>
        )}

        {/* Video Classes */}
        {videos.length > 0 && (
          <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.06)', p: 3, borderRadius: '16px', mb: 3, boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 900, letterSpacing: '1.5px', display: 'block', mb: 2 }}>
              📹 VIDEO CLASSES
            </Typography>
            {videos.map((v, i) => (
              <Box key={i} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0B2E59', mb: 1 }}>{v.title}</Typography>
                <Box sx={{ position: 'relative', pb: '56.25%', height: 0, borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(11,46,89,0.08)' }}>
                  <iframe 
                    src={`https://www.youtube.com/embed/${v.ytId}`}
                    title={v.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                </Box>
              </Box>
            ))}
          </Card>
        )}

        {/* Reference links */}
        {refs.length > 0 && (
          <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.06)', p: 3, borderRadius: '16px', mb: 3, boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 900, letterSpacing: '1.5px', display: 'block', mb: 2 }}>
              🔗 REFERENCES
            </Typography>
            {refs.map((r, i) => (
              <Button
                key={i} fullWidth variant="outlined" onClick={() => window.open(r.url, '_blank')}
                sx={{
                  justifyContent: 'flex-start', py: 1.5, px: 2, background: '#fff', border: '1px solid rgba(11, 46, 89, 0.08)',
                  borderRadius: '10px', mb: 1.5, textTransform: 'none', color: '#0B2E59',
                  '&:hover': { background: 'rgba(11, 46, 89, 0.03)', borderColor: '#0B2E59' }
                }}
              >
                🔗 <Typography sx={{ ml: 1, fontSize: '0.75rem', fontWeight: 700 }}>{r.title}</Typography>
              </Button>
            ))}
          </Card>
        )}

        {/* Documents list */}
        {docs.length > 0 && (
          <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.06)', p: 3, borderRadius: '16px', mb: 3, boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 900, letterSpacing: '1.5px', display: 'block', mb: 2 }}>
              📄 DOCUMENTS
            </Typography>
            {docs.map((d, i) => (
              <Button
                key={i} fullWidth variant="outlined" onClick={() => window.open(d.url, '_blank')}
                sx={{
                  justifyContent: 'flex-start', py: 1.5, px: 2, background: '#fff', border: '1px solid rgba(11, 46, 89, 0.08)',
                  borderRadius: '10px', mb: 1.5, textTransform: 'none', color: '#F7931E', borderColor: 'rgba(247, 147, 30, 0.2)',
                  '&:hover': { background: 'rgba(247, 147, 30, 0.03)', borderColor: '#F7931E' }
                }}
              >
                📎 <Typography sx={{ ml: 1, fontSize: '0.75rem', fontWeight: 700, color: '#0B2E59' }}>{d.title}</Typography>
              </Button>
            ))}
          </Card>
        )}

        {videos.length === 0 && refs.length === 0 && docs.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', color: '#64748b', border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '16px' }}>
            📭 No content added yet.
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContents: 'space-between', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            COURSE_MATRIX
          </Typography>
          <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 800, fontSize: '0.6rem' }}>
            TOTAL ASSIGNED: {myCourses.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" size="small" onClick={() => alert("Data synchronization anchored.")}
            sx={{ color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.1)', fontSize: '0.55rem', fontWeight: 800 }}
          >
            🔄 SYNC
          </Button>
          {(state.role === 'admin' && state.roleType === 'max') && (
            <Button 
              variant="contained" size="small" onClick={() => setView('course_admin')}
              sx={{ background: '#0B2E59', color: '#fff', fontSize: '0.6rem', fontWeight: 900, '&:hover': { background: '#F7931E' } }}
            >
              MANAGE
            </Button>
          )}
        </Box>
      </Box>

      {/* Courses Grid */}
      {myCourses.length === 0 ? (
        <Box sx={{ p: 6, border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '20px', textAlign: 'center', color: '#64748b' }}>
          📚 No assigned courses.
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {myCourses.map(c => {
            const coursePrice = c.price || '999';
            const isPaid = (myProfile.paid_courses || []).includes(c.id) || String(coursePrice) === '0';
            const isPending = (myProfile.pending_courses || []).includes(c.id);

            return (
              <Card 
                key={c.id}
                onClick={() => {
                  if (isPaid) setActiveCourseId(c.id);
                  else handleShowPayment(c);
                }}
                sx={{
                  borderRadius: '16px', border: '1px solid',
                  borderColor: isPaid ? 'rgba(11, 46, 89, 0.08)' : 'rgba(247, 147, 30, 0.25)',
                  background: isPaid ? 'rgba(11, 46, 89, 0.01)' : 'rgba(247, 147, 30, 0.01)',
                  cursor: 'pointer', position: 'relative', boxShadow: 'none', transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: isPaid ? '#0B2E59' : '#F7931E', borderRadius: '4px 0 0 4px' }} />
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: isPaid ? '#0B2E59' : '#F7931E', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '1px' }}>
                        {(c.domain || 'Industrial_Core').toUpperCase()}
                      </Typography>
                      {!isPaid && <Typography sx={{ fontSize: '0.65rem' }}>🔒</Typography>}
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0B2E59', fontFamily: "'Outfit', sans-serif" }}>
                      {c.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.55rem', mt: 0.5, display: 'block' }}>
                      📹 {(c.videos||[]).length} Classes · 🔗 {(c.refs||[]).length} References · 📄 {(c.docs||[]).length} Docs
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.55rem', color: isPaid ? '#0B2E59' : '#F7931E', fontWeight: 900,
                        background: isPaid ? 'rgba(11, 46, 89, 0.05)' : 'rgba(247, 147, 30, 0.1)',
                        px: 1.2, py: 0.5, borderRadius: '6px', border: '1px solid',
                        borderColor: isPaid ? 'rgba(11, 46, 89, 0.1)' : 'rgba(247, 147, 30, 0.2)',
                        mb: 1.5, display: 'inline-block'
                      }}
                    >
                      VALUATION: ₹{coursePrice}
                    </Typography>
                    <br />
                    <Button
                      variant="contained" size="small"
                      sx={{
                        background: isPaid ? '#0B2E59' : (isPending ? '#64748b' : '#F7931E'),
                        color: '#fff', fontSize: '0.65rem', fontWeight: 900, borderRadius: '12px',
                        py: 0.8, px: 2.2, boxShadow: 'none', mt: 1,
                        '&:hover': { background: '#0B2E59' }
                      }}
                    >
                      {isPaid ? 'START MISSION' : (isPending ? 'VERIFYING...' : 'UNLOCK 🔒')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Payment Gateway Modal Dialog */}
      <Dialog 
        open={!!selectedCourse} 
        onClose={handleClosePayment}
        PaperProps={{
          sx: { borderRadius: '24px', border: '2px solid #F7931E', maxWidth: '380px', p: 3 }
        }}
      >
        {selectedCourse && (
          <Box sx={{ textAlign: 'center' }}>
            <DialogTitle sx={{ color: '#F7931E', fontWeight: 900, p: 0, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
              SECURE ENROLLMENT
            </DialogTitle>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem', mb: 3 }}>
              {selectedCourse.title}
            </Typography>

            {/* QR/UPI display */}
            <Box sx={{ mb: 3 }}>
              {payConfig.qr ? (
                <Box 
                  component="img" 
                  src={payConfig.qr} 
                  sx={{ width: 180, height: 180, p: 1.5, border: '1px solid rgba(11,46,89,0.08)', borderRadius: '12px', background: '#fff', mb: 1.5 }}
                />
              ) : (
                <Box sx={{ p: 2, background: 'rgba(11, 46, 89, 0.02)', borderRadius: '12px', border: '1px solid rgba(11, 46, 89, 0.08)', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>UPI_ID</Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B2E59' }}>{payConfig.upi}</Typography>
                </Box>
              )}
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0B2E59' }}>
                ₹{selectedCourse.price}
              </Typography>
            </Box>

            {/* Fields */}
            <Box sx={{ mb: 3, display: 'grid', gap: 2, textAlign: 'left' }}>
              <Box sx={{ p: 1.5, background: 'rgba(11, 46, 89, 0.02)', borderRadius: '12px', border: '1px solid rgba(11, 46, 89, 0.08)' }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.55rem', color: '#0B2E59', fontWeight: 800, mb: 0.5 }}>
                  TRANSACTION_ID (UTR)
                </Typography>
                <TextField 
                  fullWidth size="small" variant="standard" placeholder="12-digit UTR Number"
                  value={utrId} onChange={(e) => setUtrId(e.target.value)}
                  InputProps={{ disableUnderline: true, style: { fontSize: '0.85rem', color: '#0B2E59' } }}
                />
              </Box>
              <Box sx={{ p: 1.5, border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.55rem', color: '#0B2E59', fontWeight: 800, mb: 0.5 }}>
                  RECEIPT MANIFEST (IMAGE)
                </Typography>
                <input type="file" accept="image/*" onChange={handleUploadProof} style={{ fontSize: '0.65rem', color: '#64748b' }} />
              </Box>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Button
                variant="contained"
                disabled={submittingPay}
                onClick={handleSubmitPayment}
                sx={{ background: '#10b981', color: '#fff', py: 1.5, borderRadius: '12px', fontWeight: 900, '&:hover': { background: '#059669' } }}
              >
                SUBMIT FOR VERIFICATION
              </Button>
              <Button
                variant="outlined"
                onClick={handleClosePayment}
                sx={{ color: '#64748b', borderColor: 'rgba(11, 46, 89, 0.15)', borderRadius: '12px', '&:hover': { borderColor: '#64748b' } }}
              >
                CANCEL
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

    </Box>
  );
}
