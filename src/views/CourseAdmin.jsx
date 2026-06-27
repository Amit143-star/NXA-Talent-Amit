import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  TextField, Select, MenuItem, Divider, List, ListItem, 
  ListItemText, Dialog, DialogTitle, DialogContent, Checkbox, FormControlLabel
} from '@mui/material';

export default function CourseAdmin({ state, setView }) {
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('nxa_system_courses');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  });

  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_student_profiles')) || {}; } catch(e) { return {}; }
  });

  const [payConfig, setPayConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_payment_config')) || { fee: '0', upi: '', qr: '' }; } catch(e) { return { fee: '0', upi: '', qr: '' }; }
  });

  const [payLogs, setPayLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_payment_logs')) || []; } catch(e) { return []; }
  });

  // Editor states
  const [editingCourse, setEditingCourse] = useState(null); // When editing content
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState(null); // When opening student assign modal
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [upiId, setUpiId] = useState(payConfig.upi || '');
  const [qrBase64, setQrBase64] = useState(payConfig.qr || '');

  // Content edit inputs
  const [vidTitle, setVidTitle] = useState('');
  const [vidYt, setVidYt] = useState('');
  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const handleUploadAdminQR = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setQrBase64(event.target.result);
      alert("Gallery QR Loaded successfully.");
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentConfig = () => {
    const conf = { ...payConfig, upi: upiId, qr: qrBase64 };
    setPayConfig(conf);
    localStorage.setItem('nxa_payment_config', JSON.stringify(conf));
    alert("GATEWAY INITIALIZED: Uplink config cached.");
  };

  const handleCreateCourse = () => {
    if (!newTitle.trim() || !newDomain.trim()) return alert("Title and Domain are required.");

    const newC = {
      id: 'c_' + Date.now(),
      title: newTitle.trim(),
      domain: newDomain.trim(),
      price: newPrice || '999',
      desc: newDesc.trim(),
      videos: [],
      refs: [],
      docs: []
    };

    const updated = [...courses, newC];
    setCourses(updated);
    localStorage.setItem('nxa_system_courses', JSON.stringify(updated));

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('courses').doc(newC.id).set(newC);
      } catch(e) {
        console.warn(e);
      }
    }

    alert("COURSE AUTHORIZED: Matrix deployment successful.");
    setNewTitle('');
    setNewDomain('');
    setNewPrice('');
    setNewDesc('');
    setShowAddCourse(false);
  };

  const handleDeleteCourse = (id) => {
    if (!confirm("Are you sure you want to purge this course?")) return;
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    localStorage.setItem('nxa_system_courses', JSON.stringify(updated));

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('courses').doc(id).delete();
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const handleFastSetPrice = (id, priceVal) => {
    const updated = courses.map(c => {
      if (c.id === id) {
        return { ...c, price: priceVal };
      }
      return c;
    });
    setCourses(updated);
    localStorage.setItem('nxa_system_courses', JSON.stringify(updated));
    alert(`Price updated successfully.`);
  };

  // Add course items
  const handleAddVideo = () => {
    if (!vidTitle.trim() || !vidYt.trim()) return alert("Title and YT ID are required.");
    const vList = editingCourse.videos || [];
    const updatedCourse = {
      ...editingCourse,
      videos: [...vList, { title: vidTitle.trim(), ytId: vidYt.trim() }]
    };
    saveEditedCourse(updatedCourse);
    setVidTitle('');
    setVidYt('');
  };

  const handleAddRef = () => {
    if (!refTitle.trim() || !refUrl.trim()) return alert("Title and URL are required.");
    const rList = editingCourse.refs || [];
    const updatedCourse = {
      ...editingCourse,
      refs: [...rList, { title: refTitle.trim(), url: refUrl.trim() }]
    };
    saveEditedCourse(updatedCourse);
    setRefTitle('');
    setRefUrl('');
  };

  const handleAddDoc = () => {
    if (!docTitle.trim() || !docUrl.trim()) return alert("Title and URL are required.");
    const dList = editingCourse.docs || [];
    const updatedCourse = {
      ...editingCourse,
      docs: [...dList, { title: docTitle.trim(), url: docUrl.trim() }]
    };
    saveEditedCourse(updatedCourse);
    setDocTitle('');
    setDocUrl('');
  };

  const saveEditedCourse = (updatedCourse) => {
    setEditingCourse(updatedCourse);
    const updatedList = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
    setCourses(updatedList);
    localStorage.setItem('nxa_system_courses', JSON.stringify(updatedList));

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('courses').doc(updatedCourse.id).set(updatedCourse);
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const handleToggleAssign = (courseId, email) => {
    const emailKey = email.toLowerCase().trim();
    const student = profiles[emailKey] || {};
    let assigned = student.assigned_courses || [];
    
    if (assigned.includes(courseId)) {
      assigned = assigned.filter(id => id !== courseId);
    } else {
      assigned = [...assigned, courseId];
    }

    const updatedProfile = { ...student, assigned_courses: assigned };
    const updatedProfiles = { ...profiles, [emailKey]: updatedProfile };
    setProfiles(updatedProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(updatedProfiles));

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('profiles').doc(emailKey).set(updatedProfile, { merge: true });
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const handleVerifyLog = (idx) => {
    const log = payLogs[idx];
    if (log.status === 'verified') return;

    // Verify payment in student profile
    const emailKey = log.email.toLowerCase().trim();
    const student = profiles[emailKey] || {};
    
    // Add to paid courses
    const paid = student.paid_courses || [];
    if (!paid.includes(log.courseId)) {
      paid.push(log.courseId);
    }
    // Remove from pending courses
    const pending = (student.pending_courses || []).filter(id => id !== log.courseId);

    const updatedProfile = { ...student, paid_courses: paid, pending_courses: pending };
    const updatedProfiles = { ...profiles, [emailKey]: updatedProfile };
    setProfiles(updatedProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(updatedProfiles));

    // Update log
    const updatedLogs = [...payLogs];
    updatedLogs[idx] = { ...log, status: 'verified', verified_at: Date.now() };
    setPayLogs(updatedLogs);
    localStorage.setItem('nxa_payment_logs', JSON.stringify(updatedLogs));

    if (typeof window.firebase !== 'undefined') {
      try {
        window.firebase.firestore().collection('profiles').doc(emailKey).set(updatedProfile, { merge: true });
        window.firebase.firestore().collection('payment_logs').doc('utr_' + log.utr).set(updatedLogs[idx]);
      } catch(e) {
        console.warn(e);
      }
    }

    alert("VERIFICATION GRANTED: Course manifest unlocked for student.");
  };

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
          COURSE_CONTROL
        </Typography>
        <Button 
          variant="outlined" size="small" onClick={() => setView('courses')}
          sx={{ color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.15)', fontSize: '0.65rem', fontWeight: 800 }}
        >
          RETURN
        </Button>
      </Box>

      {/* Gateway config */}
      <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.08)', p: 3, borderRadius: '20px', mb: 4, boxShadow: 'none' }}>
        <Typography variant="caption" sx={{ color: '#0B2E59', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', mb: 2, display: 'block' }}>
          GATEWAY UPLINK
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>UPI ID</Typography>
            <TextField 
              fullWidth size="small" value={upiId} onChange={(e) => setUpiId(e.target.value)} 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>QR CODE BASE64 IMAGE</Typography>
            <input type="file" accept="image/*" onChange={handleUploadAdminQR} style={{ fontSize: '0.65rem', display: 'block', marginTop: '5px' }} />
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth variant="contained" onClick={handleSavePaymentConfig}
              sx={{ background: '#0B2E59', color: '#fff', py: 1, borderRadius: '8px', fontWeight: 900, '&:hover': { background: '#F7931E' } }}
            >
              INITIALIZE UPLINK
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Transaction Ledger */}
      <Card sx={{ border: '1px solid rgba(11, 46, 89, 0.08)', p: 3, borderRadius: '20px', mb: 4, boxShadow: 'none', background: 'rgba(11, 46, 89, 0.01)' }}>
        <Typography variant="caption" sx={{ color: '#0B2E59', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', mb: 2, display: 'block' }}>
          TRANSACTION LEDGER
        </Typography>
        <Box sx={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {payLogs.length === 0 ? (
            <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', py: 2 }}>
              No transactions logged yet.
            </Typography>
          ) : payLogs.map((log, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                p: 2, borderRadius: '12px', background: '#fff', 
                border: '1px solid', borderColor: log.status === 'pending' ? '#F7931E' : 'rgba(11, 46, 89, 0.06)' 
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#0B2E59', fontWeight: 900, mb: 0.5, fontSize: '0.7rem' }}>
                <span>{log.email}</span>
                <span>₹{log.price}</span>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0B2E59' }}>
                ENROLLED: {log.courseTitle}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#F7931E', fontFamily: 'monospace', mt: 0.5 }}>
                UTR: {log.utr}
              </Typography>
              
              {log.proof && (
                <Box 
                  onClick={() => window.open(log.proof, '_blank')}
                  sx={{ mt: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(11, 46, 89, 0.03)', p: 1, borderRadius: '8px', width: 'fit-content' }}
                >
                  <Box component="img" src={log.proof} sx={{ width: 35, height: 35, objectFit: 'cover', borderRadius: '4px' }} />
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#0B2E59' }}>VIEW PROOF IMAGE</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1, borderTop: '1px solid rgba(11, 46, 89, 0.04)' }}>
                <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </Typography>
                {log.status === 'pending' ? (
                  <Button
                    size="small" variant="contained" onClick={() => handleVerifyLog(idx)}
                    sx={{ background: '#10b981', color: '#fff', fontSize: '0.55rem', fontWeight: 900, py: 0.5 }}
                  >
                    GRANT VERIFICATION ✅
                  </Button>
                ) : (
                  <Typography sx={{ color: '#10b981', fontSize: '0.6rem', fontWeight: 900 }}>
                    AUTHORIZED ✓
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Courses control title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', color: '#0B2E59', fontWeight: 800 }}>
          COURSE_MATRIX_DEPLOYMENT
        </Typography>
        <Button 
          variant="contained" size="small" onClick={() => setShowAddCourse(!showAddCourse)}
          sx={{ background: '#0B2E59', color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}
        >
          {showAddCourse ? 'CLOSE' : '+ NEW'}
        </Button>
      </Box>

      {/* Add Course form */}
      {showAddCourse && (
        <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid #0B2E59', borderRadius: '16px', p: 3, mb: 3, boxShadow: 'none' }}>
          <Typography variant="caption" sx={{ color: '#0B2E59', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', display: 'block', mb: 2 }}>
            NEW COURSE MODULE
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField 
              fullWidth size="small" placeholder="Course Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
            />
            <TextField 
              fullWidth size="small" placeholder="Domain (e.g. AI / Web)" value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
            />
            <TextField 
              fullWidth size="small" type="number" placeholder="Enrollment Price (₹)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
            />
            <TextField 
              fullWidth multiline rows={3} placeholder="Course Description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff' } }}
            />
            <Button
              variant="contained" onClick={handleCreateCourse}
              sx={{ background: '#0B2E59', color: '#fff', fontWeight: 800 }}
            >
              AUTHORIZE COURSE
            </Button>
          </Box>
        </Card>
      )}

      {/* Courses List admin view */}
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {courses.length === 0 ? (
          <Box sx={{ py: 6, border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '20px', textAlign: 'center', color: '#64748b' }}>
            No courses yet. Tap + NEW to create one.
          </Box>
        ) : courses.map(c => (
          <Card key={c.id} sx={{ borderRadius: '16px', border: '1px solid rgba(11, 46, 89, 0.08)', background: 'rgba(11, 46, 89, 0.01)', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#0B2E59', fontSize: '0.55rem', fontWeight: 800 }}>
                {(c.domain || 'Industrial').toUpperCase()}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800, color: '#0B2E59', mb: 1.5 }}>
                {c.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Price: ₹</Typography>
                <TextField
                  size="small" type="number"
                  defaultValue={c.price || '999'}
                  onBlur={(e) => handleFastSetPrice(c.id, e.target.value)}
                  sx={{ width: 70, '& input': { p: 0.5, fontSize: '0.7rem', textAlign: 'center' } }}
                />
                <Button 
                  size="small" variant="outlined" onClick={() => setEditingCourse(c)}
                  sx={{ ml: 'auto', fontSize: '0.55rem', color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.15)', fontWeight: 800 }}
                >
                  ✏️ EDIT CONTENT
                </Button>
                <Button 
                  size="small" variant="outlined" onClick={() => setAssigningCourse(c)}
                  sx={{ fontSize: '0.55rem', color: '#F7931E', borderColor: 'rgba(247, 147, 30, 0.15)', fontWeight: 800 }}
                >
                  👥 ASSIGN
                </Button>
                <Button 
                  size="small" variant="outlined" onClick={() => handleDeleteCourse(c.id)}
                  sx={{ fontSize: '0.55rem', color: '#ff4545', borderColor: 'rgba(255, 69, 69, 0.15)', fontWeight: 800 }}
                >
                  🗑 PURGE
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Editor dialog modal for course content details */}
      <Dialog 
        open={!!editingCourse} 
        onClose={() => setEditingCourse(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '24px', p: 3 } }}
      >
        {editingCourse && (
          <Box>
            <DialogTitle sx={{ p: 0, mb: 2, color: '#0B2E59', fontWeight: 900 }}>
              Course Content Editor: {editingCourse.title}
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Add Video Class */}
              <Box sx={{ p: 2, border: '1px solid rgba(11,46,89,0.08)', borderRadius: '12px', background: 'rgba(11,46,89,0.01)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0B2E59', display: 'block', mb: 1 }}>
                  📹 ADD VIDEO LESSON
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5, mb: 1.5 }}>
                  <TextField size="small" placeholder="Video Title (e.g. Lesson 1)" value={vidTitle} onChange={(e) => setVidTitle(e.target.value)} />
                  <TextField size="small" placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" value={vidYt} onChange={(e) => setVidYt(e.target.value)} />
                </Box>
                <Button size="small" variant="contained" onClick={handleAddVideo} sx={{ background: '#0B2E59', color: '#fff' }}>ADD VIDEO</Button>
              </Box>

              {/* Add Reference Link */}
              <Box sx={{ p: 2, border: '1px solid rgba(11,46,89,0.08)', borderRadius: '12px', background: 'rgba(11,46,89,0.01)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0B2E59', display: 'block', mb: 1 }}>
                  🔗 ADD REFERENCE LINK
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5, mb: 1.5 }}>
                  <TextField size="small" placeholder="Link Title" value={refTitle} onChange={(e) => setRefTitle(e.target.value)} />
                  <TextField size="small" placeholder="URL Link (https://...)" value={refUrl} onChange={(e) => setRefUrl(e.target.value)} />
                </Box>
                <Button size="small" variant="contained" onClick={handleAddRef} sx={{ background: '#0B2E59', color: '#fff' }}>ADD LINK</Button>
              </Box>

              {/* Add Document Link */}
              <Box sx={{ p: 2, border: '1px solid rgba(11,46,89,0.08)', borderRadius: '12px', background: 'rgba(11,46,89,0.01)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0B2E59', display: 'block', mb: 1 }}>
                  📄 ADD DOCUMENT MANIFEST
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5, mb: 1.5 }}>
                  <TextField size="small" placeholder="Document Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
                  <TextField size="small" placeholder="Document URL" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                </Box>
                <Button size="small" variant="contained" onClick={handleAddDoc} sx={{ background: '#0B2E59', color: '#fff' }}>ADD DOCUMENT</Button>
              </Box>

              {/* Added lists preview */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>MANIFEST STATS:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5, color: '#0B2E59' }}>
                  📹 {(editingCourse.videos || []).length} Video Lessons | 🔗 {(editingCourse.refs || []).length} Refs | 📄 {(editingCourse.docs || []).length} Docs
                </Typography>
              </Box>

              <Button variant="contained" onClick={() => setEditingCourse(null)} sx={{ background: '#F7931E', color: '#fff' }}>
                CLOSE EDITOR
              </Button>

            </DialogContent>
          </Box>
        )}
      </Dialog>

      {/* Assign modal dialog list */}
      <Dialog 
        open={!!assigningCourse} 
        onClose={() => setAssigningCourse(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', p: 3 } }}
      >
        {assigningCourse && (
          <Box>
            <DialogTitle sx={{ p: 0, mb: 2, color: '#0B2E59', fontWeight: 900 }}>
              Assign Course: {assigningCourse.title}
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflowY: 'auto' }}>
                {Object.values(profiles).map(student => {
                  const assigned = student.assigned_courses || [];
                  const isChecked = assigned.includes(assigningCourse.id);
                  return (
                    <FormControlLabel
                      key={student.email}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleToggleAssign(assigningCourse.id, student.email)}
                          sx={{ color: '#0B2E59', '&.Mui-checked': { color: '#F7931E' } }}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0B2E59' }}>{student.fullname}</Typography>
                          <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{student.email}</Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </Box>
              <Button fullWidth variant="contained" onClick={() => setAssigningCourse(null)} sx={{ mt: 3, background: '#0B2E59', color: '#fff' }}>
                DONE
              </Button>
            </DialogContent>
          </Box>
        )}
      </Dialog>

    </Box>
  );
}
