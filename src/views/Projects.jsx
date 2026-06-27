import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, CardMedia, Grid, Button, TextField 
} from '@mui/material';
import { syncPull } from '../utils/sync';

export default function Projects({ state }) {
  const isSuper = state.role === 'admin' && state.roleType === 'super';
  const isMax = state.role === 'admin' && state.roleType === 'max';
  const isExecutive = isMax;

  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_industrial_projects')) || []; } catch(e) { return []; }
  });

  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_industrial_projects') {
        setProjects(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    return () => window.removeEventListener('nxa_db_updated', handleUpdate);
  }, []);

  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [info, setInfo] = useState('');
  const [source, setSource] = useState('');
  const [dataset, setDataset] = useState('');

  const handleDeployProject = async () => {
    if (!title.trim() || !info.trim()) return alert("Title and Description are required.");
    
    const newProj = {
      title: title.trim(),
      image: image.trim() || 'https://via.placeholder.com/400x200/0b2e59/ffffff?text=NXA_PROJECT',
      info: info.trim(),
      source: source.trim() || 'https://github.com',
      dataset: dataset.trim() || 'https://kaggle.com'
    };

    const updatedProjects = [...projects, newProj];
    setProjects(updatedProjects);
    localStorage.setItem('nxa_industrial_projects', JSON.stringify(updatedProjects));

    // Firebase write if present
    if (typeof window.firebase !== 'undefined') {
      try {
        await window.firebase.firestore().collection('projects').doc(newProj.title.toLowerCase().replace(/\s+/g, '_')).set(newProj);
      } catch(e) {
        console.warn(e);
      }
    }

    alert("PROJECT DEPLOYED: Node active in local repository.");
    setTitle('');
    setImage('');
    setInfo('');
    setSource('');
    setDataset('');
  };

  const handleDeleteProject = async (idx) => {
    if (!confirm("Are you sure you want to terminate this project node?")) return;
    
    const targetProj = projects[idx];
    const updatedProjects = projects.filter((_, i) => i !== idx);
    setProjects(updatedProjects);
    localStorage.setItem('nxa_industrial_projects', JSON.stringify(updatedProjects));

    // Firebase delete if present
    if (typeof window.firebase !== 'undefined' && targetProj) {
      try {
        await window.firebase.firestore().collection('projects').doc(targetProj.title.toLowerCase().replace(/\s+/g, '_')).delete();
      } catch(e) {
        console.warn(e);
      }
    }
  };

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            PROJECT_MATRIX
          </Typography>
          <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 800, fontSize: '0.6rem' }}>
            ACTIVE NODES: {projects.length}
          </Typography>
        </Box>
      </Box>

      {/* Admin project Deployer */}
      {isExecutive && (
        <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid #0B2E59', borderRadius: '20px', p: 3, mb: 4, boxShadow: 'none' }}>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#0B2E59', fontWeight: 900, letterSpacing: '1px', display: 'block', mb: 2 }}>
            DEPLOY NEW PROJECT
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>PROJECT TITLE</Typography>
              <TextField 
                fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>IMAGE MANIFEST URL</Typography>
              <TextField 
                fullWidth size="small" value={image} onChange={(e) => setImage(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>INDUSTRIAL DESCRIPTION</Typography>
              <TextField 
                fullWidth multiline rows={3} value={info} onChange={(e) => setInfo(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>SOURCE CODE UPLINK</Typography>
              <TextField 
                fullWidth size="small" value={source} onChange={(e) => setSource(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>DATASET ARCHIVE</Typography>
              <TextField 
                fullWidth size="small" value={dataset} onChange={(e) => setDataset(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth variant="contained" onClick={handleDeployProject}
                sx={{ background: '#0B2E59', color: '#fff', py: 1.5, borderRadius: '8px', fontWeight: 900, '&:hover': { background: '#F7931E' } }}
              >
                MANIFEST PROJECT
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Projects List Explorer */}
      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ py: 6, textAlign: 'center', color: '#64748b', border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '20px' }}>
              NO_PROJECTS_LOCATED_IN_MATRIX
            </Box>
          </Grid>
        ) : projects.map((p, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(11, 46, 89, 0.08)', background: 'rgba(11, 46, 89, 0.02)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: 'none' }}>
              <CardMedia
                component="img"
                height="150"
                image={p.image}
                sx={{ borderBottom: '1px solid rgba(11, 46, 89, 0.08)' }}
              />
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B2E59', mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                  {p.title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#64748b', mb: 2, lineWeight: 1.4, flexGrow: 1, height: '40px', overflow: 'hidden' }}>
                  {p.info}
                </Typography>
                
                <Grid container spacing={1.5} sx={{ mb: isExecutive ? 2 : 0 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth size="small" variant="outlined" onClick={() => window.open(p.source, '_blank')}
                      sx={{ color: '#0B2E59', borderColor: '#0B2E59', fontSize: '0.55rem', fontWeight: 800, '&:hover': { background: 'rgba(11, 46, 89, 0.05)' } }}
                    >
                      SOURCE_CODE
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth size="small" variant="outlined" onClick={() => window.open(p.dataset, '_blank')}
                      sx={{ color: '#F7931E', borderColor: '#F7931E', fontSize: '0.55rem', fontWeight: 800, '&:hover': { background: 'rgba(247, 147, 30, 0.05)' } }}
                    >
                      DATASET
                    </Button>
                  </Grid>
                </Grid>

                {isExecutive && (
                  <Button
                    fullWidth variant="outlined" size="small" onClick={() => handleDeleteProject(idx)}
                    sx={{ color: '#ff4545', borderColor: 'rgba(255, 69, 69, 0.2)', fontSize: '0.55rem', fontWeight: 900, '&:hover': { background: 'rgba(255, 69, 69, 0.05)', borderColor: '#ff4545' } }}
                  >
                    TERMINATE_NODE
                  </Button>
                )}

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}
