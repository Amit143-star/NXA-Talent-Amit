import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Avatar } from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';

export default function Home({ state, setView }) {
  const isDark = localStorage.getItem('nxa_dark_mode') === 'true';

  const [liveData, setLiveData] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_live_broadcast')) || { active: false }; } catch(e) { return { active: false }; }
  });
  const [profiles, setProfiles] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_student_profiles')) || {}; } catch(e) { return {}; }
  });

  React.useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_live_broadcast') {
        setLiveData(data);
      } else if (key === 'nxa_student_profiles') {
        setProfiles(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    return () => window.removeEventListener('nxa_db_updated', handleUpdate);
  }, []);

  const pd = profiles[state.user.email.toLowerCase().trim()] || {};
  const myCourseIds = pd.assigned_courses || [];

  const solvedList = JSON.parse(localStorage.getItem('nxa_leetcode_solved')) || [];
  const solvedCount = solvedList.length;

  const myPoints = parseInt(localStorage.getItem(`nxa_points_${state.user.email}`)) || 0;
  const myAttendance = pd.attendance || {};
  const activeAttendanceDays = Object.values(myAttendance).filter(Boolean).length;

  const thoughts = [
    "Your identity is manifested through code.",
    "Technology is the ultimate bridge to success.",
    "Algorithm is the logic of industrial progress.",
    "Manifest your universal potential today."
  ];
  const dailyThought = thoughts[new Date().getDate() % thoughts.length];

  // Theme-aware color variables
  const themeCardBg = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(11, 46, 89, 0.02)';
  const themeBorderColor = isDark ? 'rgba(247, 147, 30, 0.15)' : 'rgba(11, 46, 89, 0.08)';
  const themeTextColor = isDark ? '#f8fafc' : '#0B2E59';
  const themeTextSec = isDark ? '#94a3b8' : '#64748b';

  // Badges Earned check
  const hasCourses = myCourseIds.length > 0;
  const hasLeetcode = solvedCount >= 3;
  const hasMockPoints = myPoints > 0;
  const hasAttendance = activeAttendanceDays > 0;

  // Render SVG Skills Radar Chart
  // Center is (75, 75). Scale is 50 max.
  // 5 metrics: Algorithms (solvedCount/10), Web (hasCourses ? 0.9 : 0.2), Projects (0.7), Security (pd.payment_status === 'verified' ? 0.8 : 0.3), Mock (myPoints > 0 ? 0.95 : 0.1)
  const skills = [
    { name: "Algo", val: Math.min(1.0, solvedCount / 10) },
    { name: "Web", val: hasCourses ? 0.95 : 0.2 },
    { name: "Cloud", val: myCourseIds.length > 1 ? 0.85 : 0.3 },
    { name: "Security", val: pd.payment_status === 'verified' ? 0.9 : 0.25 },
    { name: "Mock", val: myPoints > 0 ? 0.95 : 0.15 }
  ];

  // Radar math
  // angles for 5 axes: -90, -18, 54, 126, 198
  const angles = [-Math.PI/2, -Math.PI/10, Math.PI*3/10, Math.PI*7/10, Math.PI*11/10];
  const getRadarPoint = (index, value) => {
    const radius = 50 * value;
    const x = 75 + radius * Math.cos(angles[index]);
    const y = 75 + radius * Math.sin(angles[index]);
    return { x, y };
  };

  const polyPoints = skills.map((s, idx) => {
    const pt = getRadarPoint(idx, s.val);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // Concertic polygon backgrounds
  const makeBgPoly = (val) => {
    return skills.map((_, idx) => {
      const pt = getRadarPoint(idx, val);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  };

  return (
    <Box sx={{ p: 3, pb: '120px', background: isDark ? '#080d16' : '#ffffff', minHeight: '100vh' }}>

      {/* ═══════════════ SUPER ADMIN COMMAND CENTER ═══════════════ */}
      {state.role === 'admin' && state.roleType === 'super' && (() => {
        const allStudents = Object.values(profiles).filter(s => s && typeof s === 'object' && (s.fullname || s.email));
        const todayStr = new Date().toISOString().split('T')[0];
        const presentToday = allStudents.filter(s => s.attendance && s.attendance[todayStr]).length;
        const absentToday = allStudents.length - presentToday;
        let adminRoles = {};
        try { adminRoles = JSON.parse(localStorage.getItem('nxa_admin_roles')) || {}; } catch(e) {}
        const adminCount = Object.keys(adminRoles).length;
        let courses = [];
        try { courses = JSON.parse(localStorage.getItem('nxa_system_courses')) || []; } catch(e) {}
        let projects = [];
        try { projects = JSON.parse(localStorage.getItem('nxa_industrial_projects')) || []; } catch(e) {}
        let internships = [];
        try { internships = JSON.parse(localStorage.getItem('nxa_internship_matrix')) || []; } catch(e) {}
        let alerts = [];
        try { alerts = JSON.parse(localStorage.getItem('nxa_system_alerts')) || []; } catch(e) {}

        return (
          <>
            {/* Super Admin Header */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${themeBorderColor}` }}>
              <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '3px', display: 'block', mb: 1 }}>
                👑 SUPER ADMINISTRATOR
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor }}>
                Command Center
              </Typography>
              <Typography variant="body2" sx={{ color: themeTextSec, mt: 0.5, fontSize: '0.8rem' }}>
                Full system oversight · Head of all Center & Max Admins
              </Typography>
            </Box>

            {/* Live System Status Banner */}
            <Card sx={{ mb: 3, borderRadius: '20px', border: `1px solid ${liveData.active ? '#ff4545' : themeBorderColor}`, background: liveData.active ? (isDark ? 'rgba(255,69,69,0.08)' : 'rgba(255,69,69,0.03)') : themeCardBg, boxShadow: 'none', cursor: 'pointer' }} onClick={() => setView('live')}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: themeTextSec, fontWeight: 800, letterSpacing: '1.5px' }}>LIVE STREAM STATUS</Typography>
                  <Typography variant="body1" sx={{ color: themeTextColor, fontWeight: 800, mt: 0.5 }}>{liveData.active ? `🔴 LIVE: ${liveData.topic}` : '⚫ No Active Stream'}</Typography>
                </Box>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: liveData.active ? '#ff4545' : '#64748b', boxShadow: liveData.active ? '0 0 10px #ff4545' : 'none' }} />
              </CardContent>
            </Card>

            {/* Primary Metrics Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card onClick={() => setView('student_mgmt')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#F7931E' } }}>
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>👥</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: themeTextColor }}>{allStudents.length}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>TOTAL STUDENTS</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card onClick={() => setView('attendance')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#10b981' } }}>
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>✅</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>{presentToday}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>PRESENT TODAY</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card onClick={() => setView('attendance')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#ff4545' } }}>
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>❌</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#ff4545' }}>{absentToday}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>ABSENT TODAY</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card onClick={() => setView('admin_mgmt')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#F7931E' } }}>
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>🛡️</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#F7931E' }}>{adminCount}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>SUB-ADMINS</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Secondary Metrics Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card onClick={() => setView('courses')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#F7931E' } }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: themeTextColor }}>{courses.length}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 800, fontSize: '0.5rem', letterSpacing: '1px' }}>COURSES</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card onClick={() => setView('projects')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#F7931E' } }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: themeTextColor }}>{projects.length}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 800, fontSize: '0.5rem', letterSpacing: '1px' }}>PROJECTS</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card onClick={() => setView('internships')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: '#F7931E' } }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: themeTextColor }}>{internships.length}</Typography>
                    <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 800, fontSize: '0.5rem', letterSpacing: '1px' }}>INTERNSHIPS</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Access Command Grid */}
            <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.65rem', letterSpacing: '2px', display: 'block', mb: 2 }}>
              ⚡ QUICK ACCESS
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {[
                { label: 'MANAGE ADMINS', emoji: '🔑', view: 'admin_mgmt' },
                { label: 'STUDENT PROFILES', emoji: '📋', view: 'student_mgmt' },
                { label: 'ATTENDANCE', emoji: '📅', view: 'attendance' },
                { label: 'BROADCAST', emoji: '📡', view: 'notifications' },
                { label: 'COURSES', emoji: '📚', view: 'courses' },
                { label: 'LEADERBOARD', emoji: '🏆', view: 'leaderboard' },
              ].map(item => (
                <Grid item xs={6} sm={4} key={item.view}>
                  <Card onClick={() => setView(item.view)} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '16px', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#F7931E' } }}>
                    <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '1.3rem' }}>{item.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor, letterSpacing: '0.5px' }}>{item.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Broadcasts */}
            <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.65rem', letterSpacing: '2px', display: 'block', mb: 2 }}>
              📡 RECENT BROADCASTS
            </Typography>
            <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                {alerts.length === 0 ? (
                  <Typography sx={{ color: themeTextSec, fontSize: '0.75rem', textAlign: 'center', py: 2 }}>No broadcasts sent yet.</Typography>
                ) : alerts.slice(0, 5).map((alert, idx) => (
                  <Box key={idx} sx={{ py: 1.5, borderBottom: idx < Math.min(alerts.length, 5) - 1 ? `1px solid ${themeBorderColor}` : 'none' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: themeTextColor }}>{alert.title || 'Broadcast'}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: themeTextSec, mt: 0.3 }}>{alert.message || alert.body || ''}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </>
        );
      })()}

      {/* ═══════════════ CENTER ADMIN HOME ═══════════════ */}
      {state.role === 'admin' && state.roleType === 'center' && (() => {
        const allStudents = Object.values(profiles).filter(s => s && typeof s === 'object' && (s.fullname || s.email));
        const todayStr = new Date().toISOString().split('T')[0];
        const presentToday = allStudents.filter(s => s.attendance && s.attendance[todayStr]).length;
        return (
          <>
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${themeBorderColor}` }}>
              <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '3px', display: 'block', mb: 1 }}>🏢 CENTER ADMINISTRATOR</Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor }}>Center Dashboard</Typography>
              <Typography variant="body2" sx={{ color: themeTextSec, mt: 0.5, fontSize: '0.8rem' }}>Student management · Attendance · Broadcasts · Internships</Typography>
            </Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}><Card onClick={() => setView('student_mgmt')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', '&:hover': { borderColor: '#F7931E' } }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}><Typography sx={{ fontSize: '2rem', mb: 0.5 }}>👥</Typography><Typography variant="h5" sx={{ fontWeight: 900, color: themeTextColor }}>{allStudents.length}</Typography><Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem' }}>STUDENTS</Typography></CardContent></Card></Grid>
              <Grid item xs={6}><Card onClick={() => setView('attendance')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', '&:hover': { borderColor: '#10b981' } }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}><Typography sx={{ fontSize: '2rem', mb: 0.5 }}>✅</Typography><Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>{presentToday}</Typography><Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem' }}>PRESENT TODAY</Typography></CardContent></Card></Grid>
            </Grid>
            <Grid container spacing={1.5}>
              {[{ label: 'STUDENT PROFILES', emoji: '📋', v: 'student_mgmt' }, { label: 'ATTENDANCE', emoji: '📅', v: 'attendance' }, { label: 'BROADCAST', emoji: '📡', v: 'notifications' }, { label: 'INTERNSHIPS', emoji: '💼', v: 'internships' }, { label: 'LEADERBOARD', emoji: '🏆', v: 'leaderboard' }].map(item => (
                <Grid item xs={6} key={item.v}><Card onClick={() => setView(item.v)} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '16px', boxShadow: 'none', '&:hover': { transform: 'translateY(-2px)', borderColor: '#F7931E' } }}><CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}><Typography sx={{ fontSize: '1.3rem' }}>{item.emoji}</Typography><Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor }}>{item.label}</Typography></CardContent></Card></Grid>
              ))}
            </Grid>
          </>
        );
      })()}

      {/* ═══════════════ MAX ADMIN HOME ═══════════════ */}
      {state.role === 'admin' && state.roleType === 'max' && (() => {
        let courses = [];
        try { courses = JSON.parse(localStorage.getItem('nxa_system_courses')) || []; } catch(e) {}
        let projects = [];
        try { projects = JSON.parse(localStorage.getItem('nxa_industrial_projects')) || []; } catch(e) {}
        return (
          <>
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${themeBorderColor}` }}>
              <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '3px', display: 'block', mb: 1 }}>🔬 MAX ADMINISTRATOR</Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor }}>Max Dashboard</Typography>
              <Typography variant="body2" sx={{ color: themeTextSec, mt: 0.5, fontSize: '0.8rem' }}>Course Matrix · Live Stream · Project Matrix</Typography>
            </Box>
            <Card sx={{ mb: 3, borderRadius: '20px', border: `1px solid ${liveData.active ? '#ff4545' : themeBorderColor}`, background: liveData.active ? (isDark ? 'rgba(255,69,69,0.08)' : 'rgba(255,69,69,0.03)') : themeCardBg, boxShadow: 'none', cursor: 'pointer' }} onClick={() => setView('live')}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: themeTextSec, fontWeight: 800, letterSpacing: '1.5px' }}>LIVE STREAM STATUS</Typography>
                  <Typography variant="body1" sx={{ color: themeTextColor, fontWeight: 800, mt: 0.5 }}>{liveData.active ? `🔴 LIVE: ${liveData.topic}` : '⚫ No Active Stream'}</Typography>
                </Box>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: liveData.active ? '#ff4545' : '#64748b', boxShadow: liveData.active ? '0 0 10px #ff4545' : 'none' }} />
              </CardContent>
            </Card>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}><Card onClick={() => setView('courses')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', '&:hover': { borderColor: '#F7931E' } }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}><Typography sx={{ fontSize: '2rem', mb: 0.5 }}>📚</Typography><Typography variant="h5" sx={{ fontWeight: 900, color: themeTextColor }}>{courses.length}</Typography><Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem' }}>COURSES</Typography></CardContent></Card></Grid>
              <Grid item xs={6}><Card onClick={() => setView('projects')} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '20px', boxShadow: 'none', '&:hover': { borderColor: '#F7931E' } }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}><Typography sx={{ fontSize: '2rem', mb: 0.5 }}>🔧</Typography><Typography variant="h5" sx={{ fontWeight: 900, color: themeTextColor }}>{projects.length}</Typography><Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.55rem' }}>PROJECTS</Typography></CardContent></Card></Grid>
            </Grid>
            <Grid container spacing={1.5}>
              {[{ label: 'COURSE MATRIX', emoji: '📚', v: 'courses' }, { label: 'LIVE STREAM', emoji: '🎥', v: 'live' }, { label: 'PROJECTS', emoji: '🔧', v: 'projects' }, { label: 'LEADERBOARD', emoji: '🏆', v: 'leaderboard' }].map(item => (
                <Grid item xs={6} key={item.v}><Card onClick={() => setView(item.v)} sx={{ cursor: 'pointer', background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '16px', boxShadow: 'none', '&:hover': { transform: 'translateY(-2px)', borderColor: '#F7931E' } }}><CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}><Typography sx={{ fontSize: '1.3rem' }}>{item.emoji}</Typography><Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor }}>{item.label}</Typography></CardContent></Card></Grid>
              ))}
            </Grid>
          </>
        );
      })()}

      {/* ═══════════════ STUDENT HOME (original) ═══════════════ */}
      {state.role === 'student' && (
      <>

      {/* Welcome & Info */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor, mb: 1 }}>
            Welcome, {(pd.fullname || state.user.name).split(' ')[0]}
          </Typography>
          <Box sx={{ borderLeft: `3px solid ${isDark ? '#F7931E' : '#0B2E59'}`, pl: 2, mt: 1.5 }}>
            <Typography variant="body2" sx={{ color: themeTextSec, fontStyle: 'italic', fontSize: '0.85rem' }}>
              " {dailyThought} "
            </Typography>
          </Box>
        </Box>

        {/* Dynamic Badges Display */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasCourses && <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(11, 46, 89, 0.1)', color: '#0B2E59', fontSize: '12px', border: '1px solid rgba(11, 46, 89, 0.2)' }} title="System Architect">🚀</Avatar>}
          {hasLeetcode && <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(247, 147, 30, 0.1)', color: '#F7931E', fontSize: '12px', border: '1px solid rgba(247, 147, 30, 0.2)' }} title="Neural Overlord">⚡</Avatar>}
          {hasMockPoints && <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }} title="Cognitive Expert">🧠</Avatar>}
          {hasAttendance && <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }} title="Zero-Failure Code">🛡️</Avatar>}
        </Box>
      </Box>

      {/* Live Status Card */}
      <Card 
        onClick={() => setView('live')}
        sx={{
          mb: 3.5, cursor: 'pointer', borderRadius: '24px', border: '1px solid',
          borderColor: liveData.active ? '#ff4545' : themeBorderColor,
          background: liveData.active ? 'rgba(255, 69, 69, 0.05)' : themeCardBg,
          boxShadow: 'none', transition: 'all 0.3s',
          '&:hover': { transform: 'translateY(-2px)' }
        }}
      >
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: themeTextSec, fontWeight: 800, letterSpacing: '1.5px' }}>
              LIVE STREAM TRANSMISSION
            </Typography>
            <Typography variant="h6" sx={{ color: themeTextColor, fontWeight: 700, mt: 0.5 }}>
              {liveData.active ? liveData.topic : 'System Idle - Awaiting Mentor Uplink'}
            </Typography>
          </Box>
          <Box 
            sx={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: liveData.active ? '#ff4545' : '#64748b',
              boxShadow: liveData.active ? '0 0 10px #ff4545' : 'none',
              animation: liveData.active ? 'pulse 2s infinite' : 'none'
            }}
          />
        </CardContent>
      </Card>

      {/* SVG Interactive Dashboard Panels */}
      <Grid container spacing={3} sx={{ mb: 4.5 }}>
        
        {/* LeetCode progress circular widget */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '24px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.65rem', mb: 2, letterSpacing: '1px', display: 'block' }}>
                LEETCODE PROGRESS
              </Typography>
              
              <Box sx={{ position: 'relative', width: 90, height: 90, my: 1.5 }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="36" fill="transparent" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11, 46, 89, 0.05)'} strokeWidth="8"/>
                  <circle 
                    cx="45" cy="45" r="36" fill="transparent" 
                    stroke={isDark ? '#F7931E' : '#0B2E59'} 
                    strokeWidth="8"
                    strokeDasharray="226.19"
                    strokeDashoffset={226.19 - (Math.min(25, solvedCount) / 25) * 226.19}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ color: themeTextColor, fontWeight: 900, fontSize: '1.1rem', p: 0, m: 0 }}>
                    {solvedCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: themeTextSec, fontSize: '0.55rem', mt: -0.5 }}>
                    / 25 SOLVED
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: themeTextSec, fontSize: '0.65rem', mt: 1 }}>
                Submit solved nodes in LeetCode view
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Radar view widget */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '24px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.65rem', mb: 1, letterSpacing: '1px', display: 'block' }}>
                SKILL RADAR MATRIX
              </Typography>

              <Box sx={{ width: 110, height: 110, my: 0.5 }}>
                <svg width="110" height="110" viewBox="0 0 150 150">
                  {/* Concentric grid lines */}
                  <polygon points={makeBgPoly(0.2)} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="0.5" />
                  <polygon points={makeBgPoly(0.4)} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="0.5" />
                  <polygon points={makeBgPoly(0.6)} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="0.5" />
                  <polygon points={makeBgPoly(0.8)} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="0.5" />
                  <polygon points={makeBgPoly(1.0)} fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="1" />

                  {/* Axes lines */}
                  {angles.map((ang, idx) => {
                    const outerPt = getRadarPoint(idx, 1.0);
                    return <line key={idx} x1="75" y1="75" x2={outerPt.x} y2={outerPt.y} stroke="rgba(100,116,139,0.3)" strokeWidth="1" />;
                  })}

                  {/* Filled skills area */}
                  <polygon points={polyPoints} fill={isDark ? 'rgba(247, 147, 30, 0.25)' : 'rgba(11, 46, 89, 0.2)'} stroke={isDark ? '#F7931E' : '#0B2E59'} strokeWidth="1.5" />

                  {/* Vertices indicator dots */}
                  {skills.map((s, idx) => {
                    const pt = getRadarPoint(idx, s.val);
                    return <circle key={idx} cx={pt.x} cy={pt.y} r="3" fill={isDark ? '#F7931E' : '#0B2E59'} />;
                  })}
                </svg>
              </Box>

              <Typography variant="caption" sx={{ color: themeTextSec, fontSize: '0.6rem', mt: 0.5 }}>
                {skills.map(s => `${s.name}: ${Math.round(s.val * 100)}%`).join(' · ')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Study hours tracker widget */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '24px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeTextSec, fontWeight: 900, fontSize: '0.65rem', mb: 2, letterSpacing: '1px', display: 'block', width: '100%', textAlign: 'center' }}>
                WEEKLY STUDY METRIC
              </Typography>

              <Box sx={{ width: '100%', height: 95, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 1 }}>
                {[
                  { day: "M", val: 50 },
                  { day: "T", val: 80 },
                  { day: "W", val: 40 },
                  { day: "T", val: 90 },
                  { day: "F", val: 30 },
                  { day: "S", val: 70 },
                  { day: "S", val: 60 }
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: `${item.val * 0.7}px`, 
                        background: idx === 3 ? '#F7931E' : (isDark ? '#3b82f6' : '#0B2E59'),
                        borderRadius: '4px',
                        transition: 'height 1s ease',
                        mb: 1
                      }} 
                    />
                    <Typography sx={{ fontSize: '0.6rem', color: themeTextSec, fontWeight: 800 }}>{item.day}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Grid Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card 
            onClick={() => setView('courses')}
            sx={{
              cursor: 'pointer', borderRadius: '20px', border: `1px solid ${themeBorderColor}`,
              background: themeCardBg, boxShadow: 'none', transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isDark ? '#F7931E' : '#0B2E59', fontWeight: 800, letterSpacing: '1px' }}>
                COURSES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeTextColor, my: 1.5 }}>
                {myCourseIds.length}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: themeTextSec, fontWeight: 800 }}>
                ASSIGNED SECTIONS
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card 
            onClick={() => setView('self')}
            sx={{
              cursor: 'pointer', borderRadius: '20px', border: `1px solid ${themeBorderColor}`,
              background: themeCardBg, boxShadow: 'none', transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isDark ? '#F7931E' : '#0B2E59', fontWeight: 800, letterSpacing: '1px' }}>
                PROFILE
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F7931E', my: 1.5 }}>
                {pd.cgpa || pd.ug_marks || '0.00'}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: themeTextSec, fontWeight: 800 }}>
                CGPA INDEX
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Shortcut */}
      {state.role === 'student' && (
        <Card 
          onClick={() => setView('register')}
          sx={{
            background: isDark ? 'rgba(247, 147, 30, 0.04)' : 'linear-gradient(135deg, rgba(11, 46, 89, 0.05), rgba(247, 147, 30, 0.03))',
            border: `1px solid ${isDark ? '#F7931E' : '#0B2E59'}`, cursor: 'pointer', borderRadius: '24px', p: 3, mb: 3,
            position: 'relative', overflow: 'hidden', boxShadow: 'none', transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Box sx={{ position: 'absolute', top: -10, right: -10, fontSize: '4.5rem', opacity: 0.05, transform: 'rotate(15deg)' }}>
            📝
          </Box>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: isDark ? '#F7931E' : '#0B2E59', fontWeight: 900, letterSpacing: '2px' }}>
            ACTION_REQUIRED
          </Typography>
          <Typography variant="h6" sx={{ color: themeTextColor, fontWeight: 800, my: 0.8 }}>
            MANIFEST_INDUSTRIAL_DOSSIER
          </Typography>
          <Typography variant="body2" sx={{ color: themeTextSec, fontSize: '0.7rem', lineHeight: 1.4 }}>
            Complete your 21-field core identity to unlock full system permissions and certifications.
          </Typography>
        </Card>
      )}

      {/* Grid Buttons */}
      <Card 
        sx={{
          background: themeCardBg, border: `1px solid ${themeBorderColor}`,
          borderRadius: '20px', p: 2, boxShadow: 'none', display: 'flex', justifyContent: 'space-around'
        }}
      >
        <Button 
          onClick={() => setView('attendance')}
          sx={{ color: themeTextColor, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}
        >
          ATTENDANCE
        </Button>
        <Box sx={{ width: '1px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(11, 46, 89, 0.1)', my: 0.5 }} />
        <Button 
          onClick={() => setView('projects')}
          sx={{ color: themeTextColor, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}
        >
          PROJECTS
        </Button>
      </Card>
      </>
      )}
    </Box>
  );
}
