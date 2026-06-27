import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Card, CardContent, Avatar, Button, Grid, 
  TextField, Select, MenuItem, FormControl, Table, TableBody, 
  TableCell, TableRow, Tabs, Tab, Modal, Paper, Divider
} from '@mui/material';

export default function Dossier({ state, setView }) {
  const isDark = localStorage.getItem('nxa_dark_mode') === 'true';
  const emailKey = state.user.email.toLowerCase().trim();
  
  // Local storage structures
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_student_profiles')) || {}; } catch(e) { return {}; }
  });
  
  const p = profiles[emailKey] || {};
  const isRegistered = !!p.fullname;
  
  const [activeTab, setActiveTab] = useState(0);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Form states
  const [isEditing, setIsEditing] = useState(!isRegistered);
  const [fullname, setFullname] = useState(p.fullname || state.user.name || '');
  const [dob, setDob] = useState(p.dob || '');
  const [gender, setGender] = useState(p.gender || 'Male');
  const [fatherName, setFatherName] = useState(p.father_name || '');
  const [motherName, setMotherName] = useState(p.mother_name || '');
  const [category, setCategory] = useState(p.category || 'GEN');
  const [aadhar, setAadhar] = useState(p.aadhar || '');
  const [phone, setPhone] = useState(p.phone || '');
  const [altPhone, setAltPhone] = useState(p.alt_phone || '');
  
  const [stateName, setStateName] = useState(p.state || '');
  const [cityName, setCityName] = useState(p.city || '');
  const [address, setAddress] = useState(p.permanent_address || '');
  const [pincode, setPincode] = useState(p.pincode || '');
  
  const [marks10, setMarks10] = useState(p.marks10 || '');
  const [marks12, setMarks12] = useState(p.marks12 || '');
  const [ugDegree, setUgDegree] = useState(p.ug_degree || 'BE');
  const [ugMarks, setUgMarks] = useState(p.ug_marks || '0.00');
  const [branch, setBranch] = useState(p.branch || '');
  const [college, setCollege] = useState(p.college || '');
  const [gradYear, setGradYear] = useState(p.passingyear || '2026');
  const [photo, setPhoto] = useState(p.photo || '');

  // Setup real-time listener for profiles updates
  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_student_profiles') {
        setProfiles(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    return () => window.removeEventListener('nxa_db_updated', handleUpdate);
  }, []);

  // Update input states dynamically if they are not being actively edited
  useEffect(() => {
    if (!isEditing) {
      setFullname(p.fullname || state.user.name || '');
      setDob(p.dob || '');
      setGender(p.gender || 'Male');
      setFatherName(p.father_name || '');
      setMotherName(p.mother_name || '');
      setCategory(p.category || 'GEN');
      setAadhar(p.aadhar || '');
      setPhone(p.phone || '');
      setAltPhone(p.alt_phone || '');
      setStateName(p.state || '');
      setCityName(p.city || '');
      setAddress(p.permanent_address || '');
      setPincode(p.pincode || '');
      setMarks10(p.marks10 || '');
      setMarks12(p.marks12 || '');
      setUgDegree(p.ug_degree || 'BE');
      setUgMarks(p.ug_marks || '0.00');
      setBranch(p.branch || '');
      setCollege(p.college || '');
      setGradYear(p.passingyear || '2026');
      setPhoto(p.photo || '');
    }
  }, [profiles, isEditing, emailKey, state.user.name]);

  // Performance calculations
  const solvedList = JSON.parse(localStorage.getItem('nxa_leetcode_solved')) || [];
  const myPoints = parseInt(localStorage.getItem(`nxa_points_${state.user.email}`)) || 0;
  const myAttendance = p.attendance || {};
  const activeAttendanceDays = Object.values(myAttendance).filter(Boolean).length;
  
  // Theme styling
  const themeCardBg = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(11, 46, 89, 0.02)';
  const themeBorderColor = isDark ? 'rgba(247, 147, 30, 0.15)' : 'rgba(11, 46, 89, 0.08)';
  const themeTextColor = isDark ? '#f8fafc' : '#0B2E59';
  const themeTextSec = isDark ? '#94a3b8' : '#64748b';
  const themeInputBg = isDark ? '#1e293b' : 'rgba(11, 46, 89, 0.02)';
  const bodyBg = isDark ? '#080d16' : '#ffffff';

  const saveDossier = async () => {
    if (!fullname.trim()) return alert("Full Name is required.");
    
    const updatedProfile = {
      ...p,
      email: state.user.email,
      fullname: fullname.trim(),
      dob,
      gender,
      father_name: fatherName.trim(),
      mother_name: motherName.trim(),
      category,
      aadhar,
      phone,
      alt_phone: altPhone,
      state: stateName,
      city: cityName,
      permanent_address: address,
      pincode,
      marks10,
      marks12,
      ug_degree: ugDegree,
      ug_marks: ugMarks,
      branch,
      college,
      passingyear: gradYear,
      photo: photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.email}`
    };

    const newProfiles = { ...profiles, [emailKey]: updatedProfile };
    setProfiles(newProfiles);
    localStorage.setItem('nxa_student_profiles', JSON.stringify(newProfiles));
    
    if (typeof window.firebase !== 'undefined') {
      try {
        await window.firebase.firestore().collection('profiles').doc(emailKey).set(updatedProfile);
      } catch(err) {
        console.warn("Firestore sync failed:", err);
      }
    }
    
    alert("Profile saved successfully.");
    setIsEditing(false);
  };

  const fileInputRef = useRef(null);

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Please select an image smaller than 1.5MB to maintain dashboard speed.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        setPhoto(base64Data);
        
        // Save immediately in local storage
        const updatedProfile = {
          ...p,
          photo: base64Data
        };
        const newProfiles = { ...profiles, [emailKey]: updatedProfile };
        setProfiles(newProfiles);
        localStorage.setItem('nxa_student_profiles', JSON.stringify(newProfiles));
        
        if (typeof window.firebase !== 'undefined') {
          window.firebase.firestore().collection('profiles').doc(emailKey).set(updatedProfile, { merge: true }).catch(err => {
            console.warn("Firestore photo sync failed:", err);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (label, value, onChange, placeholder = '', type = 'text') => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: themeTextColor, fontWeight: 800, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            background: themeInputBg,
            fontSize: '0.75rem',
            color: themeTextColor,
            '& fieldset': {
              borderColor: themeBorderColor
            }
          }
        }}
      />
    </Box>
  );

  const renderRow = (label, val) => (
    <TableRow key={label} sx={{ '& td': { py: 1.2, px: 0.5, borderColor: themeBorderColor } }}>
      <TableCell sx={{ fontSize: '0.65rem', color: themeTextSec, fontWeight: 800, textTransform: 'uppercase' }}>
        {label}
      </TableCell>
      <TableCell sx={{ fontSize: '0.75rem', color: themeTextColor, fontWeight: 600, textAlign: 'right' }}>
        {val || '---'}
      </TableCell>
    </TableRow>
  );

  // SVG Circular Gauge Component
  const CircularGauge = ({ value, max, label, color, suffix = "" }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 1 }}>
        <Box sx={{ position: 'relative', width: 56, height: 56, mb: 1 }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={radius} fill="transparent" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,46,89,0.04)'} strokeWidth="4" />
            <circle cx="28" cy="28" r={radius} fill="transparent" stroke={color} strokeWidth="4"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontWeight: 900, color: themeTextColor, fontSize: '0.7rem' }}>
              {value}{suffix}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color: themeTextSec, textTransform: 'uppercase', letterSpacing: '0.2px' }}>
          {label}
        </Typography>
      </Box>
    );
  };

  // Badges lists
  const cgpaFloat = parseFloat(ugMarks) || 0;
  const badges = [
    { id: "academic", title: "Academic Elite", desc: "Maintain a CGPA above 9.0", unlocked: cgpaFloat >= 9.0, certName: "Honor Roll Grade Certification", emoji: "🏆" },
    { id: "coding", title: "Code Sentinel", desc: "Solve 3+ Sandboxed Code Nodes", unlocked: solvedList.length >= 3, certName: "Algorithmic Code Proficiency", emoji: "⚡" },
    { id: "interview", title: "Interview Expert", desc: "Pass an AI Mock Interview", unlocked: myPoints > 0, certName: "Technical Competency Verification", emoji: "🧠" },
    { id: "attendance", title: "Active Student", desc: "Regular class logs verified", unlocked: activeAttendanceDays > 0, certName: "Class Participation Log", emoji: "🛡️" }
  ];

  return (
    <Box sx={{ p: 3, pb: '120px', background: bodyBg }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', letterSpacing: '2.5px', color: '#F7931E', fontWeight: 900, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
            Talent Passport
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor, letterSpacing: '-0.5px' }}>
            Student Profile
          </Typography>
        </Box>
        <Box 
          sx={{ 
            background: isDark ? 'rgba(247,147,30,0.1)' : 'rgba(11, 46, 89, 0.04)', 
            border: `1px solid ${isDark ? 'rgba(247, 147, 30, 0.3)' : 'rgba(11, 46, 89, 0.15)'}`, 
            px: 1.8, py: 0.6, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 1 
          }}
        >
          <Box sx={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: themeTextColor, fontSize: '0.55rem', fontWeight: 900, letterSpacing: '1px' }}>
            VERIFIED
          </Typography>
        </Box>
      </Box>

      {/* Tabs Menu */}
      <Tabs 
        value={activeTab} 
        onChange={(e, nv) => setActiveTab(nv)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          borderBottom: `1px solid ${themeBorderColor}`,
          '& .MuiTabs-indicator': { bgcolor: '#F7931E', height: '3px' },
          '& .MuiTab-root': {
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: themeTextSec,
            minWidth: 'auto',
            px: 2,
            '&.Mui-selected': { color: '#F7931E' }
          }
        }}
      >
        <Tab label="OVERVIEW" />
        <Tab label="PERSONAL DETAILS" />
        <Tab label="ACADEMICS" />
        <Tab label="TRANSACTIONS" />
      </Tabs>

      {/* TAB 0: OVERVIEW */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Cyberpunk Holographic Digital ID Card */}
          <Card 
            sx={{
              position: 'relative',
              borderRadius: '24px',
              border: `1px solid ${themeBorderColor}`,
              background: isDark 
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(8, 13, 22, 0.9))' 
                : 'linear-gradient(135deg, #ffffff, rgba(11, 46, 89, 0.02))',
              overflow: 'hidden',
              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 30px rgba(11, 46, 89, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: '#F7931E'
              }
            }}
          >
            {/* Neon accent corner lines */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: 40, height: 2, background: '#F7931E' }} />
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: 2, height: 40, background: '#F7931E' }} />
            <Box sx={{ position: 'absolute', top: 20, right: 20, opacity: 0.1, pointerEvents: 'none' }}>
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke={themeTextColor} strokeWidth="8" strokeDasharray="10 10" />
                <path d="M50 20v60M20 50h60" stroke={themeTextColor} strokeWidth="8" />
              </svg>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box onClick={triggerFileSelect} sx={{ position: 'relative', cursor: 'pointer', mb: 1.5 }}>
                    <Avatar 
                      src={photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.email}`} 
                      sx={{ 
                        width: 96, 
                        height: 96, 
                        border: `3px solid ${isDark ? '#F7931E' : '#0B2E59'}`,
                        background: '#0B2E59' 
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', bottom: 0, right: 0, background: '#F7931E', color: '#fff', 
                        width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: '10px', border: '2px solid #ffffff' 
                      }}
                    >
                      📷
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, letterSpacing: '1px' }}>
                    STUDENT ID CARD
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Box sx={{ mb: 2, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: themeTextColor, fontSize: '1.2rem', mb: 0.5 }}>
                      {fullname || state.user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: themeTextSec, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      UID: {state.user.email}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: themeTextSec, display: 'block', fontSize: '0.6rem' }}>DEGREE / STREAM</Typography>
                      <Typography sx={{ fontWeight: 800, color: themeTextColor, fontSize: '0.75rem' }}>{ugDegree} - {branch || 'CSE'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: themeTextSec, display: 'block', fontSize: '0.6rem' }}>COLLEGE</Typography>
                      <Typography sx={{ fontWeight: 800, color: themeTextColor, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{college || 'Institute Core'}</Typography>
                    </Grid>
                  </Grid>

                  {/* SVG barcode decoration */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.65 }}>
                    {[2,4,1,3,2,6,1,4,2,1,5,2,3,1,4,2,3,1,6,2,1,3,4].map((width, idx) => (
                      <Box key={idx} sx={{ height: '24px', width: `${width}px`, background: themeTextColor }} />
                    ))}
                    <Typography sx={{ ml: 1, fontSize: '0.55rem', fontFamily: 'monospace', color: themeTextSec }}>
                      AUTHENTIC_NXA_CORE
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Interactive Progress Gauges */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, boxShadow: 'none', borderRadius: '16px' }}>
                <CardContent sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <CircularGauge value={cgpaFloat.toFixed(2)} max={10.0} label="Academic CGPA" color="#F7931E" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, boxShadow: 'none', borderRadius: '16px' }}>
                <CardContent sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <CircularGauge value={solvedList.length} max={50} label="Leetcode Solved" color="#0B2E59" suffix="/50" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, boxShadow: 'none', borderRadius: '16px' }}>
                <CardContent sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <CircularGauge value={activeAttendanceDays} max={30} label="Attendance Days" color="#10b981" suffix="d" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, boxShadow: 'none', borderRadius: '16px' }}>
                <CardContent sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <CircularGauge value={myPoints} max={100} label="Interview Points" color="#3b82f6" suffix=" pts" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Achievements Grid */}
          <Box>
            <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: themeTextColor, mb: 2 }}>
              🔓 EARNED BADGES & CREDENTIALS
            </Typography>
            <Grid container spacing={2}>
              {badges.map(badge => (
                <Grid item xs={12} sm={6} key={badge.id}>
                  <Card 
                    sx={{ 
                      borderRadius: '16px', 
                      border: `1px solid ${themeBorderColor}`,
                      boxShadow: 'none',
                      background: badge.unlocked ? (isDark ? 'rgba(247,147,30,0.05)' : '#ffffff') : 'rgba(0,0,0,0.02)',
                      opacity: badge.unlocked ? 1 : 0.5,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      p: 2
                    }}
                  >
                    <Box sx={{ fontSize: '2rem', mr: 2 }}>{badge.emoji}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: themeTextColor, fontSize: '0.75rem' }}>{badge.title}</Typography>
                      <Typography sx={{ color: themeTextSec, fontSize: '0.65rem' }}>{badge.desc}</Typography>
                    </Box>
                    {badge.unlocked ? (
                      <Button
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          setSelectedCert(badge);
                          setCertModalOpen(true);
                        }}
                        sx={{ 
                          fontSize: '0.55rem', 
                          fontWeight: 900, 
                          color: '#F7931E', 
                          borderColor: '#F7931E',
                          borderRadius: '8px',
                          px: 1.5,
                          '&:hover': {
                            background: 'rgba(247,147,30,0.05)',
                            borderColor: '#F7931E'
                          }
                        }}
                      >
                        CERTIFICATE
                      </Button>
                    ) : (
                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: themeTextSec }}>LOCKED 🔒</Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* TAB 1: PERSONAL DETAILS */}
      {activeTab === 1 && (
        <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: themeTextColor }}>
              Personal Details Details
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(!isEditing)}
              sx={{ color: '#F7931E', borderColor: '#F7931E', fontSize: '0.65rem', fontWeight: 800 }}
            >
              {isEditing ? "VIEW INFORMATION" : "EDIT INFORMATION"}
            </Button>
          </Box>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveDossier(); }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>{renderField('Full Name', fullname, setFullname)}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Date of Birth', dob, setDob, '', 'date')}</Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: themeTextColor, fontWeight: 800, mb: 0.5 }}>
                      Gender
                    </Typography>
                    <Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      sx={{ 
                        borderRadius: '8px', 
                        background: themeInputBg, 
                        fontSize: '0.75rem', 
                        color: themeTextColor,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeBorderColor
                        }
                      }}
                    >
                      <MenuItem value="Male" sx={{ fontSize: '0.75rem' }}>MALE</MenuItem>
                      <MenuItem value="Female" sx={{ fontSize: '0.75rem' }}>FEMALE</MenuItem>
                      <MenuItem value="Other" sx={{ fontSize: '0.75rem' }}>OTHER</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>{renderField("Father's Name", fatherName, setFatherName)}</Grid>
                <Grid item xs={12} sm={6}>{renderField("Mother's Name", motherName, setMotherName)}</Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: themeTextColor, fontWeight: 800, mb: 0.5 }}>
                      Category
                    </Typography>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      sx={{ 
                        borderRadius: '8px', 
                        background: themeInputBg, 
                        fontSize: '0.75rem', 
                        color: themeTextColor,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeBorderColor
                        }
                      }}
                    >
                      <MenuItem value="GEN" sx={{ fontSize: '0.75rem' }}>GEN</MenuItem>
                      <MenuItem value="OBC" sx={{ fontSize: '0.75rem' }}>OBC</MenuItem>
                      <MenuItem value="SC" sx={{ fontSize: '0.75rem' }}>SC</MenuItem>
                      <MenuItem value="ST" sx={{ fontSize: '0.75rem' }}>ST</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>{renderField('Aadhar Number', aadhar, setAadhar, '12-digit number')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Mobile Number', phone, setPhone, '10-digit number', 'tel')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Alternate Mobile Number', altPhone, setAltPhone, '', 'tel')}</Grid>
              </Grid>

              <Divider sx={{ my: 3, borderColor: themeBorderColor }} />
              
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#F7931E', letterSpacing: '1px', display: 'block', mb: 2 }}>
                Address Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>{renderField('State', stateName, setStateName)}</Grid>
                <Grid item xs={12} sm={6}>{renderField('City', cityName, setCityName)}</Grid>
                <Grid item xs={12}>{renderField('Full Address', address, setAddress)}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Pincode', pincode, setPincode, '6-digit number')}</Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: '#0B2E59', color: '#fff', py: 1.8, borderRadius: '12px',
                  fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px',
                  '&:hover': { background: '#F7931E' }
                }}
              >
                SAVE DETAILS
              </Button>
            </form>
          ) : (
            <Table size="small">
              <TableBody>
                {renderRow('Full Name', p.fullname || state.user.name)}
                {renderRow('Date of Birth', p.dob)}
                {renderRow('Gender', p.gender)}
                {renderRow('Father Name', p.father_name)}
                {renderRow('Mother Name', p.mother_name)}
                {renderRow('Category', p.category)}
                {renderRow('Aadhar Number', p.aadhar)}
                {renderRow('Mobile Number', p.phone)}
                {renderRow('Address', p.permanent_address)}
                {renderRow('Location', `${p.city || ''}, ${p.state || ''} ${p.pincode || ''}`)}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* TAB 2: ACADEMICS */}
      {activeTab === 2 && (
        <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: themeTextColor }}>
              Education Details
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(!isEditing)}
              sx={{ color: '#F7931E', borderColor: '#F7931E', fontSize: '0.65rem', fontWeight: 800 }}
            >
              {isEditing ? "VIEW INFORMATION" : "EDIT INFORMATION"}
            </Button>
          </Box>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveDossier(); }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>{renderField('10th Percentage / GPA', marks10, setMarks10, 'e.g. 92%')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('12th Percentage / GPA', marks12, setMarks12, 'e.g. 88%')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Degree Stream (UG)', ugDegree, setUgDegree, 'e.g. B.Tech / BE')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Current CGPA', ugMarks, setUgMarks, 'e.g. 9.15')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Branch / Specialization', branch, setBranch, 'e.g. CSE / ECE')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('College Name', college, setCollege, 'e.g. MIT Institute')}</Grid>
                <Grid item xs={12} sm={6}>{renderField('Graduation Year', gradYear, setGradYear, 'e.g. 2026', 'number')}</Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: '#0B2E59', color: '#fff', py: 1.8, borderRadius: '12px',
                  fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px',
                  '&:hover': { background: '#F7931E' }
                }}
              >
                SAVE ACADEMICS
              </Button>
            </form>
          ) : (
            <Table size="small">
              <TableBody>
                {renderRow('10th Marksheet', p.marks10)}
                {renderRow('12th Marksheet', p.marks12)}
                {renderRow('UG Degree Stream', p.ug_degree)}
                {renderRow('College Name', p.college)}
                {renderRow('Branch / Spec', p.branch)}
                {renderRow('Graduation Year', p.passingyear)}
                {renderRow('Verified GPA', p.ug_marks)}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* TAB 3: TRANSACTIONS */}
      {activeTab === 3 && (
        <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', p: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: themeTextColor, mb: 3 }}>
            Payment History Details
          </Typography>
          
          {p.paid_courses && p.paid_courses.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {p.paid_courses.map(courseId => {
                const defaultCourses = [
                  { id: '1', title: 'Advanced Neural AI', price: '₹4,999' },
                  { id: '2', title: 'Full-Stack Nexus', price: '₹6,499' },
                  { id: '3', title: 'Cyber Security Protocol', price: '₹5,200' }
                ];
                let savedCourses = [];
                try { savedCourses = JSON.parse(localStorage.getItem('nxa_system_courses')) || defaultCourses; } catch(e) { savedCourses = defaultCourses; }
                const c = savedCourses.find(item => item.id === courseId) || { title: `Course_${courseId}`, price: '₹4,999' };
                
                return (
                  <Box 
                    key={courseId} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 2, 
                      borderRadius: '12px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                      border: `1px solid ${themeBorderColor}`
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: themeTextColor }}>{c.title}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: themeTextSec }}>Txn ID: NXA_TXN_00{courseId}8A2 · Status: VERIFIED</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>{c.price || '₹4,999'}</Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => alert(`Generating receipt details for ${c.title}`)}
                        sx={{ 
                          color: themeTextColor, borderColor: themeBorderColor, fontSize: '0.55rem', fontWeight: 800,
                          px: 1.5,
                          '&:hover': { background: 'rgba(247,147,30,0.05)', borderColor: '#F7931E', color: '#F7931E' }
                        }}
                      >
                        RECEIPT
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography sx={{ textAlign: 'center', color: themeTextSec, fontSize: '0.65rem', py: 4 }}>
              No course payment records found in transaction database ledger.
            </Typography>
          )}
        </Card>
      )}

      {/* Printable Digital Certificate Modal */}
      <Modal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Paper
          sx={{
            maxWidth: '650px',
            width: '100%',
            p: 4,
            borderRadius: '24px',
            border: `6px double ${isDark ? '#F7931E' : '#0B2E59'}`,
            background: '#ffffff',
            color: '#000000',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative',
            outline: 'none'
          }}
        >
          {/* Holographic details watermark */}
          <Box sx={{ position: 'absolute', bottom: 30, right: 30, opacity: 0.1, transform: 'rotate(-15deg)', pointerEvents: 'none', border: '5px solid #F7931E', p: 1, borderRadius: '50%', color: '#F7931E', fontWeight: 900 }}>
            NXA VERIFIED
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: '4px', color: '#0B2E59', fontFamily: "'Outfit', sans-serif" }}>
              NXA TALENT MATRIX
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: '2px', fontWeight: 800, fontSize: '0.6rem', color: '#F7931E' }}>
              SECURE INDUSTRIAL CREDENTIAL
            </Typography>
            
            <Box sx={{ my: 3, height: '2px', background: 'linear-gradient(to right, transparent, #0B2E59, transparent)' }} />
            
            <Typography sx={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#4b5563', mb: 2 }}>
              This is to officially certify that
            </Typography>
            
            <Typography variant="h4" sx={{ textTransform: 'uppercase', fontWeight: 900, fontFamily: "'Outfit', sans-serif', sans-serif", color: '#0B2E59', mb: 3 }}>
              {fullname || state.user.name}
            </Typography>
            
            <Typography sx={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.6, maxWidth: 460, mx: 'auto', mb: 4 }}>
              Has successfully fulfilled all structural requirements and demonstrated excellence in the field of <b>{selectedCert?.certName || 'Software Core'}</b>, earning the credential endorsement of NXA Talent Board.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2, borderTop: '1px solid #e5e7eb', pt: 3 }}>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.65rem', color: '#0B2E59' }}>CREDENTIAL ID</Typography>
                <Typography sx={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#6b7280' }}>
                  NXA-PRT-{Math.random().toString(36).substring(2, 8).toUpperCase()}-{gradYear}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.65rem', color: '#0B2E59' }}>VERIFIED LOG</Typography>
                <Typography sx={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#6b7280' }}>
                  {state.user.email}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }} className="no-print">
              <Button 
                variant="contained" 
                onClick={() => window.print()}
                sx={{ background: '#0B2E59', color: '#fff', fontWeight: 900, px: 3, borderRadius: '8px' }}
              >
                🖨️ PRINT
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setCertModalOpen(false)}
                sx={{ color: '#6b7280', borderColor: '#d1d5db', borderRadius: '8px' }}
              >
                CLOSE
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
}
