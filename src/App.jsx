import React, { useState, useEffect } from 'react';
import { 
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme, Button 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import BookIcon from '@mui/icons-material/Book';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import TerminalIcon from '@mui/icons-material/Terminal';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Views
import Login from './views/Login';
import Home from './views/Home';
import Dossier from './views/Dossier';
import StudentManagement from './views/StudentManagement';
import Attendance from './views/Attendance';
import Projects from './views/Projects';
import Internships from './views/Internships';
import Courses from './views/Courses';
import CourseAdmin from './views/CourseAdmin';
import Leetcode from './views/Leetcode';
import Live from './views/Live';
import Notifications from './views/Notifications';
import AiCoach from './views/AiCoach';
import Leaderboard from './views/Leaderboard';
import AdminManagement from './views/AdminManagement';

export default function App() {
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  
  // App Global State
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [roleType, setRoleType] = useState(null);
  const [view, setView] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('nxa_dark_mode') === 'true');

  // Sync dark theme class on document body
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#080d16';
      document.body.style.color = '#f8fafc';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#0B2E59';
    }
  }, [darkMode]);

  // Initialize session and sync all databases from Firebase or local sync server
  useEffect(() => {
    // 1. Initialize session from LocalStorage immediately for instant boot
    try {
      const savedUser = localStorage.getItem('nxa_active_session');
      const savedRole = localStorage.getItem('nxa_active_role') || 'student';
      const savedRoleType = localStorage.getItem('nxa_active_role_type') || null;

      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const isApp = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.platform !== 'web';
        
        if (savedRole === 'admin' || savedRole === 'student') {
          setUser(JSON.parse(savedUser));
          setRole(savedRole);
          setRoleType(savedRoleType);
        }
      }
    } catch (e) {
      console.warn("State initialization failed:", e);
    }
    setInitialized(true);

    // 2. Setup real-time listeners or polling interval
    const isFirebaseActive = typeof window !== 'undefined' && window.firebase && window.firebase.apps.length > 0;
    const writeSilent = window.originalSetItem || localStorage.setItem;
    
    let unsubscribers = [];
    let pollInterval = null;

    if (isFirebaseActive) {
      try {
        const db = window.firebase.firestore();
        
        const subscribeCollection = (colName, storageKey) => {
          return db.collection(colName).onSnapshot((snap) => {
            const list = [];
            const objMap = {};
            snap.forEach((doc) => {
              const data = doc.data();
              list.push(data);
              objMap[doc.id] = data;
            });
            
            const finalData = storageKey === 'nxa_student_profiles' ? objMap : list;
            writeSilent.call(localStorage, storageKey, JSON.stringify(finalData));
            
            // Dispatch event to update active views
            window.dispatchEvent(new CustomEvent('nxa_db_updated', { 
              detail: { key: storageKey, data: finalData } 
            }));
          }, (err) => {
            console.warn(`Firestore snapshot sync failed for ${colName}:`, err);
          });
        };

        unsubscribers.push(subscribeCollection('profiles', 'nxa_student_profiles'));
        unsubscribers.push(subscribeCollection('courses', 'nxa_system_courses'));
        unsubscribers.push(subscribeCollection('projects', 'nxa_industrial_projects'));
        unsubscribers.push(subscribeCollection('internships', 'nxa_internship_matrix'));
        unsubscribers.push(subscribeCollection('users', 'nxa_users'));

        // Alerts (Notifications)
        unsubscribers.push(db.collection('broadcasts').onSnapshot((snap) => {
          const list = [];
          snap.forEach((doc) => {
            list.push(doc.data());
          });
          list.sort((a, b) => b.id.localeCompare(a.id));
          writeSilent.call(localStorage, 'nxa_system_alerts', JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('nxa_db_updated', {
            detail: { key: 'nxa_system_alerts', data: list }
          }));
        }, (err) => console.warn("broadcasts listener failed:", err)));

        // Configs
        unsubscribers.push(db.collection('config').doc('live_broadcast').onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            writeSilent.call(localStorage, 'nxa_live_broadcast', JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('nxa_db_updated', { 
              detail: { key: 'nxa_live_broadcast', data } 
            }));
          }
        }));

        unsubscribers.push(db.collection('config').doc('attendance_session').onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            writeSilent.call(localStorage, 'nxa_attendance_session', JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('nxa_db_updated', { 
              detail: { key: 'nxa_attendance_session', data } 
            }));
          }
        }));

      } catch (e) {
        console.warn("Firebase snapshot subscription initialization failed:", e);
      }
    } else {
      // Fallback polling for Express sync server
      const isApp = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.platform !== 'web';
      const host = isApp ? __BACKEND_IP__ : window.location.hostname;
      
      const fetchAndDispatch = async () => {
        try {
          const res = await fetch(`http://${host}:3001/api/get_all`);
          if (res.ok) {
            const dbVal = await res.json();
            for (const key in dbVal) {
              if (key.startsWith('nxa_') && dbVal[key]) {
                const localVal = localStorage.getItem(key);
                if (localVal !== dbVal[key]) {
                  writeSilent.call(localStorage, key, dbVal[key]);
                  let parsed = dbVal[key];
                  try { parsed = JSON.parse(dbVal[key]); } catch(e) {}
                  window.dispatchEvent(new CustomEvent('nxa_db_updated', {
                    detail: { key, data: parsed }
                  }));
                }
              }
            }
          }
        } catch (e) {
          console.warn("Initial sync pull / polling failed:", e);
        }
      };

      fetchAndDispatch(); // Run once immediately
      pollInterval = setInterval(fetchAndDispatch, 4000);
    }

    return () => {
      unsubscribers.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleLogin = (userData, userRole, type = null) => {
    setUser(userData);
    setRole(userRole);
    setRoleType(type);

    localStorage.setItem('nxa_active_session', JSON.stringify(userData));
    localStorage.setItem('nxa_active_role', userRole);
    localStorage.setItem('nxa_active_role_type', type || '');
    setView('home');

    // Cookie fallback
    document.cookie = `nxa_active_session=${encodeURIComponent(JSON.stringify(userData))}; max-age=31536000; path=/; SameSite=Lax`;
    document.cookie = `nxa_active_role=${encodeURIComponent(userRole)}; max-age=31536000; path=/; SameSite=Lax`;
  };

  const handleLogout = () => {
    if (!confirm('Are you sure you want to logout?')) return;
    setUser(null);
    setRole('student');
    setRoleType(null);
    setView('home');
    
    localStorage.removeItem('nxa_active_session');
    localStorage.removeItem('nxa_active_role');
    localStorage.removeItem('nxa_active_role_type');
    
    document.cookie = "nxa_active_session=; max-age=0; path=/";
    document.cookie = "nxa_active_role=; max-age=0; path=/";
  };

  if (!initialized) {
    return null; // Render loading mask from index.html during initialization
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const getUserDisplayName = () => {
    if (!user) return '';
    if (role === 'student') {
      try {
        const profilesObj = JSON.parse(localStorage.getItem('nxa_student_profiles')) || {};
        const emailKey = user.email.toLowerCase().trim();
        if (profilesObj[emailKey] && profilesObj[emailKey].fullname) {
          return profilesObj[emailKey].fullname;
        }
      } catch (e) {}
    }
    return user.name;
  };

  const isStudent = role === 'student';
  const isAdmin = role === 'admin';

  // Navigation Items
  const getMenuItems = () => {
    if (isStudent) {
      return [
        { text: 'Home', view: 'home', icon: <HomeIcon /> },
        { text: 'Notifications', view: 'notifications', icon: <NotificationsIcon /> },
        { text: 'Live Class', view: 'live', icon: <LiveTvIcon /> },
        { text: 'AI Coach', view: 'ai_copilot', icon: <SmartToyIcon /> },
        { text: 'Leaderboard', view: 'leaderboard', icon: <EmojiEventsIcon /> },
        { text: 'Coding Sandbox', view: 'leetcode', icon: <TerminalIcon /> },
        { text: 'Attendance', view: 'attendance', icon: <CalendarMonthIcon /> },
        { text: 'Projects', view: 'projects', icon: <FolderIcon /> },
        { text: 'Internships', view: 'internships', icon: <WorkIcon /> },
        { text: 'My Courses', view: 'courses', icon: <SchoolIcon /> },
        { text: 'My Profile', view: 'self', icon: <PersonIcon /> },
      ];
    } else {
      if (roleType === 'super') {
        // Super Admin: HEAD OF ALL — full access to every system module
        return [
          { text: 'Command Center', view: 'home', icon: <HomeIcon /> },
          { text: 'Manage Admins', view: 'admin_mgmt', icon: <SettingsIcon /> },
          { text: 'Student Profiles', view: 'student_mgmt', icon: <AnalyticsIcon /> },
          { text: 'Attendance', view: 'attendance', icon: <CalendarMonthIcon /> },
          { text: 'Broadcast Signals', view: 'notifications', icon: <NotificationsIcon /> },
          { text: 'Course Matrix', view: 'courses', icon: <SchoolIcon /> },
          { text: 'Live Stream', view: 'live', icon: <LiveTvIcon /> },
          { text: 'Project Matrix', view: 'projects', icon: <FolderIcon /> },
          { text: 'Internship Hub', view: 'internships', icon: <WorkIcon /> },
          { text: 'Leaderboard', view: 'leaderboard', icon: <EmojiEventsIcon /> },
        ];
      } else if (roleType === 'max') {
        // Max Admin: Course Matrix, Live Stream Control, Project Matrix, Leaderboard ONLY
        return [
          { text: 'Home', view: 'home', icon: <HomeIcon /> },
          { text: 'Course Matrix', view: 'courses', icon: <SchoolIcon /> },
          { text: 'Live Stream Control', view: 'live', icon: <LiveTvIcon /> },
          { text: 'Project Matrix', view: 'projects', icon: <FolderIcon /> },
          { text: 'Leaderboard', view: 'leaderboard', icon: <EmojiEventsIcon /> },
        ];
      } else {
        // Center Admin: Student Profile, Attendance, Broadcast Signals, Internship Hub, Leaderboard ONLY
        return [
          { text: 'Home', view: 'home', icon: <HomeIcon /> },
          { text: 'Student Profiles', view: 'student_mgmt', icon: <AnalyticsIcon /> },
          { text: 'Attendance', view: 'attendance', icon: <CalendarMonthIcon /> },
          { text: 'Broadcast Signals', view: 'notifications', icon: <NotificationsIcon /> },
          { text: 'Internship Hub', view: 'internships', icon: <WorkIcon /> },
          { text: 'Leaderboard', view: 'leaderboard', icon: <EmojiEventsIcon /> },
        ];
      }
    }
  };

  const menuItems = getMenuItems();

  const handleNavigate = (targetView) => {
    setView(targetView);
    setDrawerOpen(false);
  };

  const renderActiveView = () => {
    const stateObj = { user, role, roleType, view };
    
    // Scoped Navigation Security Route Protection
    if (role === 'admin') {
      if (roleType === 'super') {
        // Super Admin has FULL access to everything
        const allowed = ['home', 'student_mgmt', 'admin_mgmt', 'leaderboard', 'attendance', 'notifications', 'courses', 'course_admin', 'live', 'projects', 'internships'];
        if (!allowed.includes(view)) return <Home state={stateObj} setView={setView} />;
      } else if (roleType === 'max') {
        // Max Admin: ONLY courses, live, projects, leaderboard
        const allowed = ['home', 'courses', 'course_admin', 'live', 'projects', 'leaderboard'];
        if (!allowed.includes(view)) return <Home state={stateObj} setView={setView} />;
      } else if (roleType === 'center') {
        // Center Admin: ONLY student profiles, attendance, notifications, internships, leaderboard
        const allowed = ['home', 'student_mgmt', 'attendance', 'notifications', 'internships', 'leaderboard'];
        if (!allowed.includes(view)) return <Home state={stateObj} setView={setView} />;
      }
    } else {
      const blockedForStudents = ['student_mgmt', 'admin_mgmt', 'course_admin'];
      if (blockedForStudents.includes(view)) return <Home state={stateObj} setView={setView} />;
    }

    switch (view) {
      case 'home':
        return <Home state={stateObj} setView={setView} />;
      case 'register':
      case 'self':
        return <Dossier state={stateObj} setView={setView} />;
      case 'student_mgmt':
        return <StudentManagement state={stateObj} setView={setView} />;
      case 'admin_mgmt':
        return <AdminManagement state={stateObj} />;
      case 'attendance':
        return <Attendance state={stateObj} />;
      case 'projects':
        return <Projects state={stateObj} />;
      case 'internships':
        return <Internships state={stateObj} setView={setView} />;
      case 'courses':
        return <Courses state={stateObj} setView={setView} />;
      case 'course_admin':
        return <CourseAdmin state={stateObj} setView={setView} />;
      case 'leetcode':
        return <Leetcode state={stateObj} />;
      case 'live':
        return <Live state={stateObj} />;
      case 'notifications':
        return <Notifications state={stateObj} />;
      case 'ai_copilot':
        return <AiCoach state={stateObj} />;
      case 'leaderboard':
        return <Leaderboard state={stateObj} />;
      default:
        return <Home state={stateObj} setView={setView} />;
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, background: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#f8fafc' : '#0B2E59' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 1, pl: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, letterSpacing: '-1px' }}>
          <Box component="span" sx={{ color: darkMode ? '#F7931E' : '#0B2E59' }}>NXA</Box>
          <Box component="span" sx={{ color: darkMode ? '#f8fafc' : '#F7931E', fontWeight: 400, ml: 0.5 }}>TALENT</Box>
        </Typography>
        <Typography sx={{ fontSize: '8px', color: darkMode ? '#F7931E' : '#0B2E59', fontWeight: 900, ml: 1, mt: 0.8 }}>v11.9</Typography>
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = view === item.view || (item.view === 'self' && view === 'register');
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.view)}
                sx={{
                  borderRadius: '12px',
                  background: isActive ? (darkMode ? 'rgba(247, 147, 30, 0.15)' : 'rgba(11, 46, 89, 0.04)') : 'transparent',
                  color: isActive ? (darkMode ? '#F7931E' : '#0B2E59') : (darkMode ? '#94a3b8' : '#64748b'),
                  '&:hover': { background: darkMode ? 'rgba(247, 147, 30, 0.08)' : 'rgba(11, 46, 89, 0.03)' },
                  '& .MuiListItemIcon-root': { color: isActive ? (darkMode ? '#F7931E' : '#0B2E59') : (darkMode ? '#94a3b8' : '#64748b') }
                }}
              >
                <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ borderTop: darkMode ? '1px solid rgba(247, 147, 30, 0.15)' : '1px solid rgba(11, 46, 89, 0.08)', pt: 2, pb: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            localStorage.setItem('nxa_dark_mode', String(nextMode));
          }}
          startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          sx={{
            color: darkMode ? '#F7931E' : '#0B2E59',
            borderColor: darkMode ? 'rgba(247, 147, 30, 0.3)' : 'rgba(11, 46, 89, 0.2)',
            mb: 1.5,
            borderRadius: '10px',
            py: 1,
            fontWeight: 800,
            fontSize: '0.7rem',
            '&:hover': {
              borderColor: '#F7931E',
              background: 'rgba(247, 147, 30, 0.05)'
            }
          }}
        >
          {darkMode ? "LIGHT MODE" : "CYBER DARK"}
        </Button>

        <Typography variant="caption" sx={{ display: 'block', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.6rem', mb: 1.5, wordBreak: 'break-all' }}>
          {user.email}
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          startIcon={<ExitToAppIcon />}
          sx={{
            background: 'rgba(255, 69, 69, 0.05)', color: '#ff4545', border: '1px solid rgba(255, 69, 69, 0.15)',
            boxShadow: 'none', borderRadius: '10px', py: 1.2, fontWeight: 900, fontSize: '0.7rem',
            '&:hover': { background: 'rgba(255, 69, 69, 0.1)', boxShadow: 'none' }
          }}
        >
          🚪 LOGOUT
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#080d16' : '#ffffff' }}>
      
      {/* Top Mobile Bar */}
      {!isDesktop && (
        <AppBar position="fixed" sx={{ background: darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: darkMode ? '1px solid rgba(247, 147, 30, 0.15)' : '1px solid rgba(11, 46, 89, 0.08)', boxShadow: 'none', zIndex: 1100 }}>
          <Box sx={{ height: 'var(--sat)', width: '100%', flexShrink: 0 }} />
          <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: darkMode ? '#F7931E' : '#0B2E59', mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>
                <Box component="span" sx={{ color: darkMode ? '#F7931E' : '#0B2E59' }}>NXA</Box>
                <Box component="span" sx={{ color: darkMode ? '#f8fafc' : '#F7931E', fontWeight: 300, ml: 0.5 }}>TALENT</Box>
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isStudent && (
                <IconButton onClick={() => setView('notifications')} sx={{ color: darkMode ? '#F7931E' : '#0B2E59', p: 0.5, mr: 1 }}>
                  <NotificationsIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>
              )}
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0B2E59' }}>
                  {getUserDisplayName().split(' ')[0]}
                </Typography>
                <Typography sx={{ fontSize: '0.5rem', color: '#F7931E', fontWeight: 900, textTransform: 'uppercase' }}>
                  {role}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawer (Sidebar) */}
      <Box component="nav" sx={{ width: { lg: 290 }, flexShrink: { lg: 0 } }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            open
            PaperProps={{
              sx: { width: 290, borderRight: darkMode ? '1px solid rgba(247, 147, 30, 0.15)' : '1px solid rgba(11, 46, 89, 0.08)', background: darkMode ? '#0f172a' : '#ffffff' }
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: { width: 280, background: darkMode ? '#0f172a' : '#ffffff' }
            }}
            ModalProps={{ keepMounted: true }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main content body viewport */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: { lg: 'calc(100% - 290px)' }, 
          pt: { xs: 'calc(75px + var(--sat))', lg: 0 }, 
          height: { xs: 'calc(100vh - 75px - var(--sat))', lg: '100vh' },
          overflowY: 'auto',
          background: darkMode ? '#080d16' : '#ffffff'
        }}
      >
        {renderActiveView()}
      </Box>

      {/* Mobile Bottom Nav */}
      {!isDesktop && (
        <BottomNavigation
          showLabels
          value={view === 'register' ? 'self' : view}
          onChange={(event, newValue) => setView(newValue)}
          sx={{
            position: 'fixed', bottom: 'calc(15px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)',
            width: '94%', maxWidth: '440px', borderRadius: '24px', 
            border: darkMode ? '1px solid rgba(247, 147, 30, 0.2)' : '1px solid rgba(11, 46, 89, 0.08)',
            background: darkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 15px 35px rgba(0, 0, 0, 0.4)' : '0 15px 35px rgba(11, 46, 89, 0.08)', 
            zIndex: 1001, height: '65px',
            '& .MuiBottomNavigationAction-root': {
              color: darkMode ? '#94a3b8' : '#64748b', minWidth: 'auto', py: 0.5,
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.55rem',
                fontWeight: 800,
                letterSpacing: '0.2px',
                marginTop: '3px'
              },
              '&.Mui-selected': {
                color: '#F7931E',
                '& .MuiSvgIcon-root': { transform: 'translateY(-2px)', filter: 'drop-shadow(0 0 5px rgba(247, 147, 30, 0.4))' },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.6rem',
                  fontWeight: 900
                }
              }
            }
          }}
        >
          {/* Student Specific Flow */}
          {isStudent && <BottomNavigationAction label="Home" value="home" icon={<HomeIcon sx={{ fontSize: '1.2rem' }} />} />}
          {isStudent && <BottomNavigationAction label="Live" value="live" icon={<LiveTvIcon sx={{ fontSize: '1.2rem' }} />} />}
          {isStudent && <BottomNavigationAction label="Code" value="leetcode" icon={<TerminalIcon sx={{ fontSize: '1.2rem' }} />} />}
          {isStudent && <BottomNavigationAction label="Learn" value="courses" icon={<SchoolIcon sx={{ fontSize: '1.2rem' }} />} />}
          {isStudent && <BottomNavigationAction label="Me" value="self" icon={<PersonIcon sx={{ fontSize: '1.2rem' }} />} />}

          {/* Admin Specific Flow - Super Admin */}
          {!isStudent && roleType === 'super' && [
            <BottomNavigationAction key="home" label="Home" value="home" icon={<HomeIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="profiles" label="Profiles" value="student_mgmt" icon={<AnalyticsIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="admins" label="Admins" value="admin_mgmt" icon={<SettingsIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="board" label="Ranks" value="leaderboard" icon={<EmojiEventsIcon sx={{ fontSize: '1.2rem' }} />} />
          ]}

          {/* Admin Specific Flow - Max Admin */}
          {!isStudent && roleType === 'max' && [
            <BottomNavigationAction key="home" label="Home" value="home" icon={<HomeIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="courses" label="Learn" value="courses" icon={<SchoolIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="live" label="Live" value="live" icon={<LiveTvIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="projects" label="Projects" value="projects" icon={<FolderIcon sx={{ fontSize: '1.2rem' }} />} />
          ]}

          {/* Admin Specific Flow - Center Admin (Default) */}
          {!isStudent && roleType !== 'super' && roleType !== 'max' && [
            <BottomNavigationAction key="home" label="Home" value="home" icon={<HomeIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="profiles" label="Profiles" value="student_mgmt" icon={<AnalyticsIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="attendance" label="Attd" value="attendance" icon={<CalendarMonthIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="signals" label="Signals" value="notifications" icon={<NotificationsIcon sx={{ fontSize: '1.2rem' }} />} />,
            <BottomNavigationAction key="intern" label="Intern" value="internships" icon={<WorkIcon sx={{ fontSize: '1.2rem' }} />} />
          ]}
        </BottomNavigation>
      )}

    </Box>
  );
}
