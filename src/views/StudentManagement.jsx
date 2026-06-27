import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Tabs, Tab, TextField, Select, 
  MenuItem, Grid, Card, CardContent, FormControl, Dialog,
  DialogTitle, DialogContent, DialogActions, Checkbox,
  FormGroup, FormControlLabel, IconButton
} from '@mui/material';

export default function StudentManagement({ state, setView }) {
  const isDark = localStorage.getItem('nxa_dark_mode') === 'true';
  const isSuper = state.role === 'admin' && state.roleType === 'super';
  const isCenter = state.role === 'admin' && state.roleType === 'center';

  const [activeTab, setActiveTab] = useState('dossiers'); 
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDossierDialog, setOpenDossierDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Add student form states
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPass, setAddPass] = useState('');
  const [addCgpa, setAddCgpa] = useState('8.50');
  const [addBranch, setAddBranch] = useState('CSE');
  const [addUsn, setAddUsn] = useState('');
  const [addCollege, setAddCollege] = useState('NXA Industrial Academy');

  // Edit student form states
  const [editName, setEditName] = useState('');
  const [editCgpa, setEditCgpa] = useState('8.00');
  const [editBranch, setEditBranch] = useState('CSE');
  const [editUsn, setEditUsn] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editSem, setEditSem] = useState('6');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCourses, setEditCourses] = useState([]); // Array of course IDs

  // System courses for assignment
  const defaultCourses = [
    { id: '1', title: 'Advanced Neural AI' },
    { id: '2', title: 'Full-Stack Nexus' },
    { id: '3', title: 'Cyber Security Protocol' }
  ];
  const systemCourses = JSON.parse(localStorage.getItem('nxa_system_courses')) || defaultCourses;

  // Local storage databases
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_student_profiles')) || {}; } catch(e) { return {}; }
  });
  
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_users')) || []; } catch(e) { return []; }
  });

  // Setup real-time listener for sync events
  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_student_profiles') {
        setProfiles(data);
      } else if (key === 'nxa_users') {
        setUsers(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    return () => window.removeEventListener('nxa_db_updated', handleUpdate);
  }, []);

  const students = Object.values(profiles).filter(s => s && typeof s === 'object' && (s.fullname || s.email));
  const profileEmails = Object.keys(profiles).map(e => String(e).toLowerCase());
  const pending = users.filter(u => u && u.email && !profileEmails.includes(String(u.email).toLowerCase()));

  // Analytics
  const studentAtts = students.map(s => s.attendance ? Object.values(s.attendance).filter(Boolean).length : 0);
  const avgAtt = studentAtts.length > 0 ? Math.round(studentAtts.reduce((acc, curr) => acc + curr, 0) / studentAtts.length) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPresent = students.filter(s => s.attendance && s.attendance[todayStr]).length;
  const todayAbsent = students.length - todayPresent;

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (s.fullname || '').toLowerCase().includes(q) || 
           (s.usn || '').toLowerCase().includes(q) || 
           (s.email || '').toLowerCase().includes(q);
  });

  // Action log audit helper
  const logAudit = (msg) => {
    let logs = [];
    try { logs = JSON.parse(localStorage.getItem('nxa_audit_logs')) || []; } catch(e) {}
    logs.unshift({
      id: 'log_' + Date.now(),
      admin: state.user.email,
      role: state.roleType,
      action: msg,
      time: new Date().toLocaleString()
    });
    localStorage.setItem('nxa_audit_logs', JSON.stringify(logs.slice(0, 100)));
  };

  // CRUD: Toggle Lock
  const handleTogglePayment = (email, currentStatus) => {
    const emailKey = email.toLowerCase().trim();
    const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    
    const targetProfile = profiles[emailKey];
    if (!targetProfile) return;

    const updatedProfile = { ...targetProfile, payment_status: newStatus };
    const newProfiles = { ...profiles, [emailKey]: updatedProfile };
    setProfiles(newProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(newProfiles));

    logAudit(`Toggled payment status for ${email} to ${newStatus}`);
    
    if (typeof window.firebase !== 'undefined') {
      window.firebase.firestore().collection('profiles').doc(emailKey).update({ payment_status: newStatus }).catch(console.warn);
    }
  };

  // CRUD: Add Student
  const handleAddStudent = () => {
    if (!addName.trim() || !addEmail.trim() || !addPass.trim()) {
      return alert("Name, Email, and Password access keys are required.");
    }
    const emailKey = addEmail.toLowerCase().trim();
    if (profiles[emailKey]) {
      return alert("Dossier identifier already exists.");
    }

    // 1. Create account
    const newUser = {
      name: addName.trim(),
      email: addEmail.trim(),
      pass: addPass.trim(),
      role: 'student',
      created: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('nxa_users', JSON.stringify(updatedUsers));

    // 2. Create profile
    const newProfile = {
      email: addEmail.trim(),
      fullname: addName.trim(),
      cgpa: addCgpa,
      ug_marks: addCgpa,
      branch: addBranch,
      college: addCollege,
      usn: addUsn.trim() || 'USN_NXA_' + Math.random().toString(36).substring(2,6).toUpperCase(),
      sem: '1',
      passingyear: '2026',
      payment_status: 'pending',
      assigned_courses: []
    };
    const newProfiles = { ...profiles, [emailKey]: newProfile };
    setProfiles(newProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(newProfiles));

    logAudit(`Added student profile for ${addEmail}`);

    if (typeof window.firebase !== 'undefined') {
      window.firebase.firestore().collection('users').doc(emailKey).set(newUser).catch(console.warn);
      window.firebase.firestore().collection('profiles').doc(emailKey).set(newProfile).catch(console.warn);
    }

    alert("STUDENT PROFILE CREATED: Core records initialized.");
    setOpenAddDialog(false);
    // Reset fields
    setAddName('');
    setAddEmail('');
    setAddPass('');
    setAddUsn('');
  };

  // CRUD: Open Dossier
  const handleOpenDossier = (student) => {
    setSelectedStudent(student);
    setOpenDossierDialog(true);
  };

  // CRUD: Edit Student Dialog Trigger
  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setEditName(student.fullname || '');
    setEditCgpa(student.cgpa || student.ug_marks || '0.00');
    setEditBranch(student.branch || '');
    setEditUsn(student.usn || '');
    setEditCollege(student.college || '');
    setEditSem(student.sem || '1');
    setEditCity(student.city || '');
    setEditState(student.state || '');
    setEditPhone(student.phone || '');
    setEditCourses(student.assigned_courses || []);
    setOpenEditDialog(true);
  };

  // CRUD: Save Student
  const handleSaveStudent = () => {
    if (!editName.trim()) return alert("Full Name cannot be empty.");
    
    const emailKey = selectedStudent.email.toLowerCase().trim();
    const targetProfile = profiles[emailKey];
    if (!targetProfile) return;

    const updatedProfile = {
      ...targetProfile,
      fullname: editName.trim(),
      cgpa: editCgpa,
      ug_marks: editCgpa,
      branch: editBranch,
      usn: editUsn,
      college: editCollege,
      sem: editSem,
      city: editCity,
      state: editState,
      phone: editPhone,
      assigned_courses: editCourses
    };

    const newProfiles = { ...profiles, [emailKey]: updatedProfile };
    setProfiles(newProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(newProfiles));

    logAudit(`Edited student profile for ${selectedStudent.email}`);

    if (typeof window.firebase !== 'undefined') {
      window.firebase.firestore().collection('profiles').doc(emailKey).set(updatedProfile, { merge: true }).catch(console.warn);
    }

    alert("STUDENT DOSSIER SAVED: Update broadcasted to core sync.");
    setOpenEditDialog(false);
  };

  // CRUD: Delete Student
  const handleDeleteStudent = (email) => {
    if (!confirm(`Are you sure you want to permanently delete profile node for ${email}? This action is irreversible.`)) return;

    const emailKey = email.toLowerCase().trim();
    
    // 1. Remove from profiles
    const newProfiles = { ...profiles };
    delete newProfiles[emailKey];
    setProfiles(newProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(newProfiles));

    // 2. Remove from users list
    const newUsers = users.filter(u => u.email.toLowerCase() !== emailKey);
    setUsers(newUsers);
    localStorage.setItem('nxa_users', JSON.stringify(newUsers));

    logAudit(`Deleted student profile for ${email}`);

    if (typeof window.firebase !== 'undefined') {
      window.firebase.firestore().collection('profiles').doc(emailKey).delete().catch(console.warn);
      window.firebase.firestore().collection('users').doc(emailKey).delete().catch(console.warn);
    }

    alert("RECORD DELETED: Student references purged.");
  };

  // Course checklist toggle helper
  const handleToggleCourse = (courseId) => {
    if (editCourses.includes(courseId)) {
      setEditCourses(editCourses.filter(id => id !== courseId));
    } else {
      setEditCourses([...editCourses, courseId]);
    }
  };

  const themeCardBg = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(11, 46, 89, 0.02)';
  const themeBorderColor = isDark ? 'rgba(247, 147, 30, 0.15)' : 'rgba(11, 46, 89, 0.08)';
  const themeTextColor = isDark ? '#f8fafc' : '#0B2E59';
  const themeTextSec = isDark ? '#94a3b8' : '#64748b';
  const modalPaperBg = isDark ? '#1e293b' : '#ffffff';

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2.5px' }}>
            {isSuper ? "Super Admin System Center" : "Center Admin Office"}
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor, letterSpacing: '-0.5px' }}>
            Student Management
          </Typography>
        </Box>
        
        {isSuper && (
          <Button 
            variant="contained" 
            onClick={() => setOpenAddDialog(true)}
            sx={{ 
              background: '#0B2E59', color: '#fff', fontSize: '0.7rem', fontWeight: 900, py: 1.2, px: 2, borderRadius: '10px',
              '&:hover': { background: '#F7931E' }
            }}
          >
            ➕ ADD STUDENT
          </Button>
        )}
      </Box>

      {/* SVG Analytics Metric Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 950, fontSize: '0.65rem', mb: 1, letterSpacing: '1px' }}>
                TOTAL ENROLLED
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: themeTextColor }}>
                {students.length}
              </Typography>
              <Box sx={{ width: '100%', height: 40, mt: 1.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.5 }}>
                {Array.from({length: 12}).map((_, i) => (
                  <Box key={i} sx={{ width: 4, height: Math.max(10, Math.sin(i * 0.5 + students.length) * 15 + 20), background: isDark ? '#F7931E' : '#0B2E59', borderRadius: '4px 4px 0 0', opacity: i % 2 === 0 ? 1 : 0.4 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 950, fontSize: '0.65rem', mb: 1, letterSpacing: '1px' }}>
                PRESENT TODAY
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>
                {todayPresent}
              </Typography>
              <Box sx={{ width: '100%', height: 40, mt: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 8, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ width: `${students.length ? (todayPresent / students.length) * 100 : 0}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 950, fontSize: '0.65rem', mb: 1, letterSpacing: '1px' }}>
                ABSENT TODAY
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ff4545' }}>
                {todayAbsent}
              </Typography>
              <Box sx={{ width: '100%', height: 40, mt: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 8, background: 'rgba(255, 69, 69, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ width: `${students.length ? (todayAbsent / students.length) * 100 : 0}%`, height: '100%', background: '#ff4545', borderRadius: '4px' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 950, fontSize: '0.65rem', mb: 1, letterSpacing: '1px' }}>
                AVG ATTENDANCE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: themeTextColor }}>
                {avgAtt} sessions
              </Typography>
              <Box sx={{ width: '100%', height: 40, mt: 1.5 }}>
                <svg width="100%" height="40" viewBox="0 0 100 40">
                  <path d="M 10 30 L 35 15 L 60 25 L 90 8" fill="none" stroke={isDark ? '#F7931E' : '#0B2E59'} strokeWidth="2" />
                  <circle cx="90" cy="8" r="3" fill={isDark ? '#F7931E' : '#0B2E59'} />
                </svg>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: `1px solid ${themeBorderColor}`, mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTabs-indicator': { background: '#F7931E', height: '3px' },
            '& .MuiTab-root': {
              color: themeTextSec, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px',
              '&.Mui-selected': { color: '#F7931E' }
            }
          }}
        >
          <Tab value="dossiers" label={`STUDENTS (${students.length})`} />
          <Tab value="pending" label={`PENDING (${pending.length})`} />
        </Tabs>
      </Box>

      {/* Active Tab: Student dossiers */}
      {activeTab === 'dossiers' ? (
        <Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search student profiles by name, USN, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(11, 46, 89, 0.01)',
                fontSize: '0.75rem',
                color: themeTextColor,
                '& fieldset': {
                  borderColor: themeBorderColor
                }
              }
            }}
          />

          <Grid container spacing={3}>
            {filteredStudents.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ py: 6, textAlign: 'center', color: themeTextSec, border: `1px dashed ${themeBorderColor}`, borderRadius: '20px' }}>
                  No student records found in local directory.
                </Box>
              </Grid>
            ) : filteredStudents.map(s => (
              <Grid item xs={12} sm={6} key={s.email}>
                <Card 
                  sx={{ 
                    borderRadius: '24px', border: `1px solid ${themeBorderColor}`, 
                    background: themeCardBg, position: 'relative', boxShadow: 'none'
                  }}
                >
                  <Box sx={{ position: 'absolute', left: 0, top: '2rem', bottom: '2rem', width: 4, background: '#F7931E', borderRadius: '0 4px 4px 0' }} />
                  
                  <CardContent sx={{ p: 3, pl: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 800, color: themeTextColor }}>
                          {s.fullname || 'Unnamed'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeTextSec, fontSize: '0.65rem', fontFamily: 'monospace', display: 'block', mt: 0.2 }}>
                          {s.email}
                        </Typography>
                      </Box>
                      <Box sx={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11, 46, 89, 0.04)', color: themeTextColor, px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}>
                        CGPA: {s.cgpa || s.ug_marks || 'N/A'}
                      </Box>
                    </Box>

                    <Grid container spacing={1.5} sx={{ fontSize: '0.7rem', color: themeTextSec, mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ fontSize: '0.5rem', color: themeTextSec, opacity: 0.6, display: 'block' }}>USN ID</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: themeTextColor }}>{s.usn || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ fontSize: '0.5rem', color: themeTextSec, opacity: 0.6, display: 'block' }}>BRANCH</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: themeTextColor }}>{s.branch || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ fontSize: '0.5rem', color: themeTextSec, opacity: 0.6, display: 'block' }}>SEM</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: themeTextColor }}>{s.sem || '1'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ fontSize: '0.5rem', color: themeTextSec, opacity: 0.6, display: 'block' }}>COURSES ENROLLED</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: themeTextColor }}>
                          {s.assigned_courses ? s.assigned_courses.length : 0} classes
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Actions and payment status */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${themeBorderColor}`, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box 
                        sx={{ 
                          fontSize: '0.55rem', px: 1, py: 0.5, borderRadius: '4px', border: '1px solid',
                          background: s.payment_status === 'verified' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 69, 69, 0.05)',
                          color: s.payment_status === 'verified' ? '#10b981' : '#ff4545',
                          borderColor: s.payment_status === 'verified' ? '#10b981' : '#ff4545',
                          fontWeight: 900
                        }}
                      >
                        PAYMENT: {s.payment_status === 'verified' ? 'VERIFIED' : 'PENDING'}
                      </Box>

                      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => handleTogglePayment(s.email, s.payment_status)}
                          sx={{
                            fontSize: '0.55rem', fontWeight: 800, py: 0.5, px: 1,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(11,46,89,0.03)', 
                            color: themeTextColor, border: `1px solid ${themeBorderColor}`
                          }}
                        >
                          TOGGLE LOCK
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleOpenDossier(s)}
                          sx={{
                            fontSize: '0.55rem', fontWeight: 900, py: 0.5, px: 1,
                            background: '#F7931E', color: '#fff',
                            '&:hover': { background: '#e68019' }
                          }}
                        >
                          DOSSIER
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleOpenEdit(s)}
                          sx={{
                            fontSize: '0.55rem', fontWeight: 900, py: 0.5, px: 1,
                            background: '#0B2E59', color: '#fff',
                            '&:hover': { background: '#0a2342' }
                          }}
                        >
                          EDIT
                        </Button>
                        {isSuper && (
                          <Button
                            size="small"
                            onClick={() => handleDeleteStudent(s.email)}
                            sx={{
                              fontSize: '0.55rem', fontWeight: 900, py: 0.5, px: 1,
                              background: 'rgba(255, 69, 69, 0.08)', color: '#ff4545', border: '1px solid rgba(255, 69, 69, 0.2)',
                              '&:hover': { background: 'rgba(255, 69, 69, 0.15)' }
                            }}
                          >
                            DELETE
                          </Button>
                        )}
                      </Box>
                    </Box>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {pending.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: themeTextSec, border: `1px dashed ${themeBorderColor}`, borderRadius: '20px' }}>
              No registrations pending profile inputs.
            </Box>
          ) : pending.map(u => (
            <Card key={u.email} sx={{ borderRadius: '16px', border: `1px solid ${themeBorderColor}`, background: themeCardBg, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: themeTextColor }}>{u.name}</Typography>
                  <Typography variant="caption" sx={{ color: themeTextSec }}>{u.email}</Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => alert(`Waiting for student to upload details passport.`)}
                  sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#F7931E', borderColor: '#F7931E', border: '1px solid' }}
                >
                  WAITING DOSSIER
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* DIALOG 1: ADD STUDENT (Super Admin Exclusive) */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        PaperProps={{ sx: { bgcolor: modalPaperBg, color: themeTextColor, borderRadius: '20px', width: '100%', maxWidth: '450px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '0.95rem', borderBottom: `1px solid ${themeBorderColor}` }}>
          ➕ Register New Student Profile
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField label="Full Name" size="small" fullWidth value={addName} onChange={(e) => setAddName(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Email Address" size="small" fullWidth value={addEmail} onChange={(e) => setAddEmail(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Portal Password" type="password" size="small" fullWidth value={addPass} onChange={(e) => setAddPass(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="USN / Roll Number" size="small" fullWidth value={addUsn} onChange={(e) => setAddUsn(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Initial CGPA" size="small" fullWidth value={addCgpa} onChange={(e) => setAddCgpa(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Branch" size="small" fullWidth value={addBranch} onChange={(e) => setAddBranch(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="College Name" size="small" fullWidth value={addCollege} onChange={(e) => setAddCollege(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeBorderColor}` }}>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ fontSize: '0.65rem', fontWeight: 800, color: themeTextSec }}>CANCEL</Button>
          <Button onClick={handleAddStudent} variant="contained" sx={{ background: '#0B2E59', color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>CREATE PROFILE</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: EDIT STUDENT (Super Admin & Center Admin) */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        PaperProps={{ sx: { bgcolor: modalPaperBg, color: themeTextColor, borderRadius: '20px', width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '0.95rem', borderBottom: `1px solid ${themeBorderColor}` }}>
          ✏️ Edit Student Dossier ({selectedStudent?.email})
        </DialogTitle>
        <DialogContent sx={{ p: 3, maxHeight: '420px', overflowY: 'auto' }}>
          <Box sx={{ display: 'grid', gap: 2, pt: 1.5 }}>
            <TextField label="Full Name" size="small" fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Current CGPA" size="small" fullWidth value={editCgpa} onChange={(e) => setEditCgpa(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Branch / Spec" size="small" fullWidth value={editBranch} onChange={(e) => setEditBranch(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="USN / Roll Number" size="small" fullWidth value={editUsn} onChange={(e) => setEditUsn(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Semester" size="small" fullWidth value={editSem} onChange={(e) => setEditSem(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="College Name" size="small" fullWidth value={editCollege} onChange={(e) => setEditCollege(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="Mobile Number" size="small" fullWidth value={editPhone} onChange={(e) => setEditPhone(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="City" size="small" fullWidth value={editCity} onChange={(e) => setEditCity(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />
            <TextField label="State" size="small" fullWidth value={editState} onChange={(e) => setEditState(e.target.value)} InputLabelProps={{ style: { fontSize: '0.75rem' } }} inputProps={{ style: { fontSize: '0.75rem' } }} />

            {/* Course Assignments Selector */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: themeTextColor, mt: 1, display: 'block' }}>
              📚 Assigned Course Enrollment Catalog
            </Typography>
            <FormGroup sx={{ border: `1px solid ${themeBorderColor}`, p: 1.5, borderRadius: '8px', background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)' }}>
              {systemCourses.map(course => {
                const isChecked = editCourses.includes(String(course.id));
                return (
                  <FormControlLabel
                    key={course.id}
                    control={
                      <Checkbox 
                        checked={isChecked} 
                        onChange={() => handleToggleCourse(String(course.id))}
                        sx={{ '&.Mui-checked': { color: '#F7931E' } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: themeTextColor }}>
                        {course.title}
                      </Typography>
                    }
                  />
                );
              })}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeBorderColor}` }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ fontSize: '0.65rem', fontWeight: 800, color: themeTextSec }}>CANCEL</Button>
          <Button onClick={handleSaveStudent} variant="contained" sx={{ background: '#0B2E59', color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>SAVE DOSSIER</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 3: VIEW DOSSIER (Analytics & Progress) */}
      <Dialog 
        open={openDossierDialog} 
        onClose={() => setOpenDossierDialog(false)}
        PaperProps={{ sx: { bgcolor: modalPaperBg, color: themeTextColor, borderRadius: '20px', width: '100%', maxWidth: '550px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.2rem', borderBottom: `1px solid ${themeBorderColor}`, pb: 2 }}>
          📑 STUDENT DOSSIER
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedStudent && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{ width: 60, height: 60, borderRadius: '30px', background: 'linear-gradient(135deg, #0B2E59 0%, #F7931E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>
                  {(selectedStudent.fullname || selectedStudent.email || '?')[0].toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: themeTextColor }}>{selectedStudent.fullname || 'Unknown'}</Typography>
                  <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 700 }}>{selectedStudent.email}</Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: themeTextSec, fontWeight: 800 }}>USN</Typography>
                  <Typography sx={{ fontWeight: 900, color: themeTextColor }}>{selectedStudent.usn || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: themeTextSec, fontWeight: 800 }}>CGPA</Typography>
                  <Typography sx={{ fontWeight: 900, color: themeTextColor }}>{selectedStudent.cgpa || selectedStudent.ug_marks || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: themeTextSec, fontWeight: 800 }}>COLLEGE</Typography>
                  <Typography sx={{ fontWeight: 900, color: themeTextColor }}>{selectedStudent.college || '-'}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ borderTop: `1px solid ${themeBorderColor}`, pt: 3, mb: 3 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: themeTextSec, fontWeight: 900, letterSpacing: '1px', mb: 2, display: 'block' }}>
                  ATTENDANCE ANALYTICS
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography sx={{ color: '#10b981', fontWeight: 900, fontSize: '1.5rem' }}>
                          {selectedStudent.attendance ? Object.values(selectedStudent.attendance).filter(Boolean).length : 0}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 800 }}>TOTAL PRESENT</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ background: 'rgba(255, 69, 69, 0.05)', border: '1px solid #ff4545', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography sx={{ color: '#ff4545', fontWeight: 900, fontSize: '1.5rem' }}>
                          {(() => {
                             const totalPresent = selectedStudent.attendance ? Object.values(selectedStudent.attendance).filter(Boolean).length : 0;
                             const allSessionDates = Object.keys(selectedStudent.attendance || {});
                             return allSessionDates.length - totalPresent;
                          })()}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#ff4545', fontWeight: 800 }}>TOTAL ABSENT</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ borderTop: `1px solid ${themeBorderColor}`, pt: 3 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: themeTextSec, fontWeight: 900, letterSpacing: '1px', mb: 2, display: 'block' }}>
                  ASSIGNED COURSES
                </Typography>
                {selectedStudent.assigned_courses && selectedStudent.assigned_courses.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedStudent.assigned_courses.map(c => (
                      <Box key={c} sx={{ background: 'rgba(11, 46, 89, 0.05)', color: '#0B2E59', px: 2, py: 1, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900, border: '1px solid rgba(11, 46, 89, 0.2)' }}>
                        {c}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: themeTextSec }}>No courses assigned yet.</Typography>
                )}
              </Box>

            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeBorderColor}` }}>
          <Button onClick={() => setOpenDossierDialog(false)} variant="contained" sx={{ background: '#0B2E59', color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>CLOSE</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
