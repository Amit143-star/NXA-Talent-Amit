import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, 
  Grid, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';

export default function AdminManagement({ state }) {
  const isDark = localStorage.getItem('nxa_dark_mode') === 'true';

  // State
  const [adminRoles, setAdminRoles] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Default credentials
  const defaultAdmins = {
    'nxamaxtalent@gmail.com': { name: 'Max Admin', pass: 'NXA1526', type: 'max' },
    'nxacentertalent@gmail.com': { name: 'Center Admin', pass: 'NXA1626', type: 'center' }
  };

  useEffect(() => {
    // Load admin roles database
    let savedRoles = {};
    try {
      savedRoles = JSON.parse(localStorage.getItem('nxa_admin_roles')) || {};
    } catch (e) {
      savedRoles = {};
    }

    // Merge default roles if not present
    let merged = { ...defaultAdmins, ...savedRoles };
    setAdminRoles(merged);
    localStorage.setItem('nxa_admin_roles', JSON.stringify(merged));

    // Load audit logs
    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem('nxa_audit_logs')) || [
        { id: '1', admin: 'nxasupertalent@gmail.com', role: 'super', action: 'Initialized admin security ledger', time: new Date().toLocaleString() },
        { id: '2', admin: 'nxamaxtalent@gmail.com', role: 'max', action: 'Configured course catalog nodes', time: new Date(Date.now() - 3600000).toLocaleString() },
        { id: '3', admin: 'nxacentertalent@gmail.com', role: 'center', action: 'Synchronized student check-in punch log', time: new Date(Date.now() - 7200000).toLocaleString() }
      ];
    } catch (e) {
      logs = [];
    }
    setAuditLogs(logs);
    localStorage.setItem('nxa_audit_logs', JSON.stringify(logs));
  }, []);

  const handleEditPassword = (email) => {
    const admin = adminRoles[email];
    setSelectedAdmin({ email, ...admin });
    setNewPassword(admin.pass);
    setOpenEditDialog(true);
  };

  const handleSavePassword = () => {
    if (!newPassword.trim() || newPassword.length < 4) {
      return alert("Password must be at least 4 characters.");
    }

    const updatedRoles = {
      ...adminRoles,
      [selectedAdmin.email]: {
        ...adminRoles[selectedAdmin.email],
        pass: newPassword.trim()
      }
    };

    setAdminRoles(updatedRoles);
    localStorage.setItem('nxa_admin_roles', JSON.stringify(updatedRoles));

    // Write to audit log
    const newLog = {
      id: 'log_' + Date.now(),
      admin: state.user.email,
      role: 'super',
      action: `Updated access key password for sub-admin: ${selectedAdmin.email}`,
      time: new Date().toLocaleString()
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('nxa_audit_logs', JSON.stringify(updatedLogs));

    alert("ACCESS KEY UPDATED: Sub-admin credentials saved to local sync directory.");
    setOpenEditDialog(false);
  };

  const themeCardBg = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(11, 46, 89, 0.02)';
  const themeBorderColor = isDark ? 'rgba(247, 147, 30, 0.15)' : 'rgba(11, 46, 89, 0.08)';
  const themeTextColor = isDark ? '#f8fafc' : '#0B2E59';
  const themeTextSec = isDark ? '#94a3b8' : '#64748b';
  const modalPaperBg = isDark ? '#1e293b' : '#ffffff';

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2.5px' }}>
          Root Security Command
        </Typography>
        <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: themeTextColor, letterSpacing: '-0.5px' }}>
          Admin Directory
        </Typography>
      </Box>

      {/* Admins Credentials List */}
      <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: themeTextColor, mb: 2 }}>
        🔑 MANAGED SUB-ADMINISTRATORS
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {Object.keys(adminRoles).map(email => {
          const admin = adminRoles[email];
          return (
            <Grid item xs={12} sm={6} key={email}>
              <Card sx={{ background: themeCardBg, border: `1px solid ${themeBorderColor}`, borderRadius: '24px', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeTextColor }}>
                      {admin.name}
                    </Typography>
                    <Chip 
                      label={admin.type.toUpperCase() + "_ADMIN"} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.55rem', fontWeight: 900, 
                        background: admin.type === 'max' ? 'rgba(11,46,89,0.08)' : 'rgba(247,147,30,0.1)',
                        color: admin.type === 'max' ? '#0B2E59' : '#F7931E'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'grid', gap: 1, fontSize: '0.75rem', color: themeTextSec, mb: 3 }}>
                    <Box>
                      <b>Email</b>: <span style={{ fontFamily: 'monospace' }}>{email}</span>
                    </Box>
                    <Box>
                      <b>Access Key</b>: <span style={{ fontFamily: 'monospace', filter: 'blur(3px)', transition: 'all 0.3s' }} onMouseEnter={(e) => e.target.style.filter = 'none'} onMouseLeave={(e) => e.target.style.filter = 'blur(3px)'}>{admin.pass}</span> <span style={{ fontSize: '0.6rem', fontStyle: 'italic', opacity: 0.5 }}>(Hover to reveal)</span>
                    </Box>
                    <Box>
                      <b>Scope Permissions</b>: {admin.type === 'max' ? "Projects, Live Class, Courses" : "Attendance, Signals, Internships, Student Profiles"}
                    </Box>
                  </Box>

                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleEditPassword(email)}
                    sx={{ 
                      fontSize: '0.6rem', fontWeight: 800, color: themeTextColor, borderColor: themeBorderColor, borderRadius: '8px',
                      '&:hover': { color: '#F7931E', borderColor: '#F7931E' }
                    }}
                  >
                    UPDATE ACCESS KEY
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Audit Logs */}
      <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: themeTextColor, mb: 2 }}>
        📜 SYSTEM ACTIVITY AUDIT LOG
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', border: `1px solid ${themeBorderColor}`, boxShadow: 'none', background: themeCardBg, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(11, 46, 89, 0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor }}>ADMINISTRATOR</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor }}>ROLE</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor }}>ACTION DESCRIPTION</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: themeTextColor, textAlign: 'right' }}>TIMESTAMP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id} sx={{ '& td': { py: 1.5, borderColor: themeBorderColor, fontSize: '0.7rem', color: themeTextColor } }}>
                <TableCell sx={{ fontWeight: 700 }}>{log.admin}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.role.toUpperCase()} 
                    size="small" 
                    sx={{ height: '18px', fontSize: '0.55rem', fontWeight: 900, background: log.role === 'super' ? '#10b981' : log.role === 'max' ? '#0B2E59' : '#F7931E', color: '#fff' }} 
                  />
                </TableCell>
                <TableCell sx={{ color: themeTextColor }}>{log.action}</TableCell>
                <TableCell align="right" sx={{ color: themeTextSec, fontFamily: 'monospace' }}>{log.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Password Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        PaperProps={{ sx: { bgcolor: modalPaperBg, color: themeTextColor, borderRadius: '20px', width: '100%', maxWidth: '380px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '0.95rem', borderBottom: `1px solid ${themeBorderColor}` }}>
          🔑 Update Admin Access Key
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography variant="caption" sx={{ color: themeTextSec, display: 'block', mb: 2 }}>
            Provide a new access key password for <b>{selectedAdmin?.name}</b> ({selectedAdmin?.email}).
          </Typography>
          <TextField 
            label="New Password" 
            size="small" 
            fullWidth 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
            inputProps={{ style: { fontSize: '0.75rem' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeBorderColor}` }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ fontSize: '0.65rem', fontWeight: 800, color: themeTextSec }}>CANCEL</Button>
          <Button onClick={handleSavePassword} variant="contained" sx={{ background: '#0B2E59', color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>SAVE KEY</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
