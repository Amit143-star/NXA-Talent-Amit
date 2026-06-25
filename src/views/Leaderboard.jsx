import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Avatar, Grid, Chip, LinearProgress
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import ComputerIcon from '@mui/icons-material/Computer';

// Static peer data
const PEERS = [
  { name: "Sneha Patel", email: "sneha@nxa.core", cgpa: "9.60", leetcodeCount: 14, attendanceCount: 22, projectsCount: 3, points: 150 },
  { name: "Rahul Sharma", email: "rahul@nxa.core", cgpa: "8.90", leetcodeCount: 21, attendanceCount: 20, projectsCount: 2, points: 120 },
  { name: "Priya Das", email: "priya@nxa.core", cgpa: "9.20", leetcodeCount: 8, attendanceCount: 24, projectsCount: 4, points: 90 },
  { name: "Vikram Singh", email: "vikram@nxa.core", cgpa: "8.40", leetcodeCount: 12, attendanceCount: 18, projectsCount: 2, points: 80 },
  { name: "Amit Kumar", email: "amit@nxa.core", cgpa: "7.80", leetcodeCount: 5, attendanceCount: 15, projectsCount: 1, points: 40 }
];

export default function Leaderboard({ state }) {
  const [boardData, setBoardData] = useState([]);
  
  // Current user metrics
  const profiles = JSON.parse(localStorage.getItem('nxa_student_profiles')) || {};
  const myProfile = profiles[state.user.email.toLowerCase().trim()] || {};
  const solvedList = JSON.parse(localStorage.getItem('nxa_leetcode_solved')) || [];
  const myPoints = parseInt(localStorage.getItem(`nxa_points_${state.user.email}`)) || 0;
  
  // Calculate attendance %
  const myAttendance = myProfile.attendance || {};
  const activeAttendanceDays = Object.values(myAttendance).filter(Boolean).length;
  
  const myProjectList = JSON.parse(localStorage.getItem('nxa_industrial_projects')) || [];
  // Mock that the student completed a random subset if not admin
  const myProjectsCount = myProfile.fullname ? 2 : 0;

  useEffect(() => {
    // 1. Prepare user details
    const userMetrics = {
      name: myProfile.fullname || state.user.name || "You",
      email: state.user.email.toLowerCase().trim(),
      cgpa: myProfile.ug_marks || "0.00",
      leetcodeCount: solvedList.length,
      attendanceCount: activeAttendanceDays || 5, // fallback baseline
      projectsCount: myProfile.assigned_courses?.length || 1,
      points: myPoints
    };

    // 2. Combine with peers and exclude any duplicate entry for the user
    const filteredPeers = PEERS.filter(p => p.email !== userMetrics.email);
    const combined = [...filteredPeers, userMetrics];

    // 3. Compute power score for each student
    // Score = (CGPA * 100) + (LeetCode * 10) + (Attendance * 5) + (Projects * 20) + points
    const computed = combined.map(student => {
      const cgpaVal = parseFloat(student.cgpa) || 0;
      const powerScore = Math.round(
        (cgpaVal * 100) + 
        (student.leetcodeCount * 10) + 
        (student.attendanceCount * 5) + 
        (student.projectsCount * 20) + 
        (student.points || 0)
      );
      return { ...student, score: powerScore };
    });

    // Sort descending
    computed.sort((a, b) => b.score - a.score);
    setBoardData(computed);
  }, [myProfile, solvedList, myPoints, activeAttendanceDays]);

  // Unlocked Badges calculator
  const cgpaFloat = parseFloat(myProfile.ug_marks || "0.00");
  const badges = [
    {
      id: "grandmaster",
      title: "Academic Grandmaster",
      desc: "Maintain a CGPA above 9.0",
      unlocked: cgpaFloat >= 9.0,
      icon: <MilitaryTechIcon sx={{ color: '#F7931E', fontSize: '28px' }} />
    },
    {
      id: "code_warrior",
      title: "Neural Overlord",
      desc: "Solve more than 3 sandbox coding nodes",
      unlocked: solvedList.length >= 3,
      icon: <ComputerIcon sx={{ color: '#0B2E59', fontSize: '28px' }} />
    },
    {
      id: "perfect_score",
      title: "Cognitive Expert",
      desc: "Complete an AI technical mock interview session",
      unlocked: myPoints > 0,
      icon: <StarIcon sx={{ color: '#10b981', fontSize: '28px' }} />
    },
    {
      id: "attendance_shield",
      title: "Zero-Failure Code",
      desc: "Maintain regular attendance punch logs",
      unlocked: activeAttendanceDays > 0,
      icon: <SecurityIcon sx={{ color: '#3b82f6', fontSize: '28px' }} />
    }
  ];

  const getRankMedal = (rank) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            CLASS_LEADERBOARD
          </Typography>
          <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 800, fontSize: '0.6rem' }}>
            COMPUTE ENGINE ACTIVE · COGNITIVE RANKS
          </Typography>
        </Box>
      </Box>

      {/* Top 3 Podiums */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {boardData.slice(0, 3).map((student, idx) => {
          const isCurrentUser = student.email === state.user.email.toLowerCase().trim();
          return (
            <Grid item xs={12} sm={4} key={student.email}>
              <Card 
                sx={{ 
                  borderRadius: '24px', 
                  border: isCurrentUser ? '2px solid #F7931E' : '1px solid rgba(11, 46, 89, 0.08)', 
                  background: isCurrentUser ? 'rgba(247, 147, 30, 0.03)' : '#ffffff',
                  boxShadow: 'none',
                  position: 'relative',
                  textAlign: 'center',
                  pt: 4, pb: 3
                }}
              >
                <Box sx={{ position: 'absolute', top: 12, right: 16, fontSize: '1.5rem' }}>
                  {getRankMedal(idx)}
                </Box>
                <Avatar 
                  sx={{ 
                    mx: 'auto', mb: 1.5, width: 64, height: 64, 
                    border: '3px solid',
                    borderColor: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32',
                    background: '#0B2E59',
                    fontSize: '1.25rem',
                    fontWeight: 900
                  }}
                >
                  {student.name.slice(0,2).toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0B2E59' }}>
                  {student.name} {isCurrentUser && "(YOU)"}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                  {student.email}
                </Typography>
                <Chip 
                  label={`Power: ${student.score}`} 
                  size="small"
                  sx={{ 
                    background: '#0B2E59', color: '#fff', fontWeight: 900, fontSize: '0.65rem',
                    px: 1
                  }}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Ranks Table Ledger */}
      <TableContainer component={Paper} sx={{ borderRadius: '20px', border: '1px solid rgba(11, 46, 89, 0.08)', boxShadow: 'none', mb: 4, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'rgba(11, 46, 89, 0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59' }}>RANK</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59' }}>STUDENT NAME</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59', textAlign: 'center' }}>CGPA</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59', textAlign: 'center' }}>LEETCODE</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59', textAlign: 'center' }}>PROJECTS</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59', textAlign: 'center' }}>EVAL POINTS</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0B2E59', textAlign: 'right' }}>POWER SCORE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boardData.map((student, idx) => {
              const isCurrentUser = student.email === state.user.email.toLowerCase().trim();
              return (
                <TableRow 
                  key={student.email} 
                  sx={{ 
                    bgcolor: isCurrentUser ? 'rgba(247, 147, 30, 0.02)' : 'inherit',
                    '& td': { py: 1.5, borderColor: 'rgba(11, 46, 89, 0.05)', fontSize: '0.75rem' } 
                  }}
                >
                  <TableCell sx={{ fontWeight: 800 }}>
                    {getRankMedal(idx)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0B2E59' }}>
                    {student.name} {isCurrentUser && " (YOU)"}
                  </TableCell>
                  <TableCell align="center">{student.cgpa}</TableCell>
                  <TableCell align="center">{student.leetcodeCount}</TableCell>
                  <TableCell align="center">{student.projectsCount}</TableCell>
                  <TableCell align="center">{student.points || 0}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, color: '#0B2E59' }}>{student.score}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Achievements System badges grid */}
      <Box>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0B2E59', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ color: '#F7931E' }} /> EARNED BADGES & CREDENTIALS
        </Typography>

        <Grid container spacing={2}>
          {badges.map(badge => (
            <Grid item xs={12} sm={6} key={badge.id}>
              <Card 
                sx={{ 
                  borderRadius: '20px', 
                  border: '1px solid rgba(11, 46, 89, 0.08)',
                  boxShadow: 'none',
                  background: badge.unlocked ? '#ffffff' : 'rgba(11, 46, 89, 0.02)',
                  opacity: badge.unlocked ? 1 : 0.65,
                  transition: 'all 0.3s'
                }}
              >
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2.5 }}>
                  <Box 
                    sx={{ 
                      p: 1, 
                      borderRadius: '12px',
                      background: badge.unlocked ? 'rgba(11, 46, 89, 0.03)' : 'rgba(11, 46, 89, 0.08)',
                      filter: badge.unlocked ? 'none' : 'grayscale(1)'
                    }}
                  >
                    {badge.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0B2E59', fontSize: '0.8rem' }}>
                        {badge.title}
                      </Typography>
                      <Chip 
                        label={badge.unlocked ? "UNLOCKED ✓" : "LOCKED 🔒"} 
                        size="small"
                        sx={{ 
                          height: '18px', fontSize: '0.55rem', fontWeight: 900,
                          background: badge.unlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(11, 46, 89, 0.08)',
                          color: badge.unlocked ? '#10b981' : '#64748b'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                      {badge.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Box>
  );
}
