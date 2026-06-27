import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  TextField, FormControl, Link, Alert, RadioGroup, 
  FormControlLabel, Radio, CardActions 
} from '@mui/material';

const NXA_ELITE_QUESTIONS = [
  { q: "In a distributed system, what does the CAP theorem state regarding a network partition?", o: ["Availability and Consistency cannot both be guaranteed", "Consistency and Partition Tolerance are impossible", "Availability is prioritized over Latency", "Network speed determines Consistency"], a: 0 },
  { q: "Which Transformer architecture component allows it to handle long-range dependencies regardless of distance?", o: ["Recurrent hidden states", "Self-Attention Mechanism", "Backpropagation through time", "Convolutional kernels"], a: 1 },
  { q: "In Kubernetes, what is the primary purpose of an 'Admission Controller'?", o: ["To balance load across pods", "To intercept requests to the API server before object persistence", "To manage node-level hardware resources", "To encrypt traffic between services"], a: 1 },
  { q: "Which consensus algorithm is specifically designed for high-performance permissioned blockchains like Hyperledger Fabric?", o: ["Proof of Work", "Raft", "PBFT (Practical Byzantine Fault Tolerance)", "Proof of Stake"], a: 2 },
  { q: "In Zero Trust architecture, what is the 'Policy Decision Point' (PDP) responsible for?", o: ["Enforcing the connection", "Evaluating the access request against rules", "Storing user credentials", "Logging network traffic"], a: 1 },
  { q: "Which data structure is most efficient for implementing a 'Least Recently Used' (LRU) cache with O(1) operations?", o: ["B-Tree + Queue", "Hash Map + Doubly Linked List", "Binary Search Tree", "Skip List"], a: 1 },
  { q: "What is the time complexity of a 'Union-Find' operation with both Path Compression and Rank Optimization?", o: ["O(log N)", "O(N)", "O(α(N)) - Inverse Ackermann", "O(1)"], a: 2 },
  { q: "In modern CPU architecture, what is 'Spectre' primarily exploiting?", o: ["Buffer overflows", "Speculative execution and side-channel analysis", "Direct Memory Access (DMA)", "Kernel-level race conditions"], a: 1 },
  { q: "Which HTTP header is essential for preventing 'Clickjacking' attacks?", o: ["X-Content-Type-Options", "Content-Security-Policy (frame-ancestors)", "X-XSS-Protection", "Strict-Transport-Security"], a: 1 },
  { q: "In a 'Microservices' architecture, which pattern is used to handle cross-cutting concerns like logging and auth at the entry point?", o: ["Circuit Breaker", "Saga Pattern", "API Gateway", "Strangler Fig"], a: 2 },
  { q: "What is the primary difference between 'L1' and 'L2' Regularization in Machine Learning?", o: ["L1 produces sparse weights (zero-valued)", "L2 is only for classification", "L1 is faster to compute", "L2 prevents all overfitting"], a: 0 },
  { q: "In Docker, which namespace provides isolation for the process tree?", o: ["Network Namespace", "PID Namespace", "Mount Namespace", "User Namespace"], a: 1 },
  { q: "Which RAID level provides both mirroring and striping without using parity?", o: ["RAID 5", "RAID 10", "RAID 6", "RAID 1"], a: 1 },
  { q: "What is 'Throttling' in the context of API design?", o: ["Deleting old data", "Controlling the rate of incoming requests", "Compressing response body", "Encrypting database fields"], a: 1 },
  { q: "In Python, what does 'GIL' stand for and what is its primary effect?", o: ["Global Interlock Link - Speeds up I/O", "Global Interpreter Lock - Prevents multi-core CPU threading", "Garbage Internal Logic - Manages memory", "Generic Interface Layer - Connects to C++"], a: 1 },
  { q: "Which design pattern is used to provide a unified interface to a set of interfaces in a subsystem?", o: ["Singleton", "Adapter", "Facade", "Decorator"], a: 2 },
  { q: "In Database systems, what does 'Deadlock' refer to?", o: ["A database crash", "Two transactions waiting for each other to release locks", "A table with no primary key", "Data corruption in logs"], a: 1 },
  { q: "Which sorting algorithm is guaranteed O(N log N) even in the worst case?", o: ["Quick Sort", "Heap Sort", "Bubble Sort", "Insertion Sort"], a: 1 },
  { q: "What is the role of a 'Zookeeper' in a Hadoop/Kafka ecosystem?", o: ["Storing actual data", "Coordination and state management of distributed nodes", "Formatting hard drives", "Running SQL queries"], a: 1 },
  { q: "In React, what is the 'Virtual DOM' primarily used for?", o: ["Replacing the real DOM", "Improving performance by minimizing direct DOM manipulation", "Storing user passwords", "Connecting to the server"], a: 1 },
  { q: "Which AWS service is designed for serverless execution of code?", o: ["EC2", "S3", "Lambda", "RDS"], a: 2 },
  { q: "What is 'Idempotency' in REST API design?", o: ["Multiple identical requests have the same effect as one", "The API is always available", "The API uses JSON only", "The API requires no authentication"], a: 0 },
  { q: "In Networking, what is the purpose of 'BGP' (Border Gateway Protocol)?", o: ["Assigning IP addresses to home devices", "Routing data between different autonomous systems on the Internet", "Sending emails", "Managing local WiFi passwords"], a: 1 },
  { q: "Which encryption type uses a Public Key and a Private Key?", o: ["Symmetric Encryption", "Asymmetric Encryption", "Hashing", "Obfuscation"], a: 1 },
  { q: "In Git, what does 'Rebase' do compared to 'Merge'?", o: ["Deletes the history", "Moves or combines a sequence of commits to a new base commit", "Uploads code to GitHub", "Creates a new branch"], a: 1 },
  { q: "What is 'Cross-Site Scripting' (XSS)?", o: ["A server-side database attack", "Injecting malicious scripts into web pages viewed by other users", "Stealing a physical laptop", "Sending spam emails"], a: 1 },
  { q: "In Java, what is the purpose of the 'final' keyword on a class?", o: ["It makes the class abstract", "It prevents the class from being subclassed", "It makes all methods static", "It deletes the class on exit"], a: 1 },
  { q: "Which SQL command is used to combine rows from two or more tables based on a related column?", o: ["SELECT", "UNION", "JOIN", "GROUP BY"], a: 2 },
  { q: "What is 'Docker Swarm'?", o: ["A virus", "A native clustering tool for Docker containers", "A cloud storage service", "A code editor"], a: 1 },
  { q: "In Artificial Intelligence, what is 'Overfitting'?", o: ["The model is too small", "The model performs well on training data but poorly on unseen data", "The model is too fast", "The model uses too much RAM"], a: 1 }
];

export default function Internships({ state, setView }) {
  const isCenter = state.role === 'admin' && state.roleType === 'center';
  
  // States
  const [viewState, setViewState] = useState('hubs'); // 'hubs', 'quiz', 'pass', 'certificate'
  const [answers, setAnswers] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);

  const [internships, setInternships] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_internship_matrix')) || []; } catch(e) { return []; }
  });

  useEffect(() => {
    const handleUpdate = (e) => {
      const { key, data } = e.detail;
      if (key === 'nxa_internship_matrix') {
        setInternships(data);
      }
    };
    window.addEventListener('nxa_db_updated', handleUpdate);
    return () => window.removeEventListener('nxa_db_updated', handleUpdate);
  }, []);

  const [myApps, setMyApps] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`nxa_apps_${state.user.email}`)) || []; } catch(e) { return []; }
  });

  // Post internship fields
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [req, setReq] = useState('');
  const [link, setLink] = useState('');

  const handlePostInternship = async () => {
    if (!title.trim() || !desc.trim()) return alert("Role and Stipend are required.");
    
    const newInt = {
      id: 'int_' + Date.now(),
      title: title.trim(),
      desc: desc.trim(),
      req: req.trim() || 'React, Material UI, JavaScript',
      link: link.trim() || 'https://google.com'
    };

    const updated = [...internships, newInt];
    setInternships(updated);
    localStorage.setItem('nxa_internship_matrix', JSON.stringify(updated));

    if (typeof window.firebase !== 'undefined') {
      try {
        await window.firebase.firestore().collection('internships').doc(newInt.id).set(newInt);
      } catch(e) {
        console.warn(e);
      }
    }

    alert("OPPORTUNITY DEPLOYED: Internship listed successfully.");
    setTitle('');
    setDesc('');
    setReq('');
    setLink('');
  };

  const handleDeleteInternship = async (idx) => {
    if (!confirm("Are you sure you want to terminate this opportunity?")) return;
    
    const target = internships[idx];
    const updated = internships.filter((_, i) => i !== idx);
    setInternships(updated);
    localStorage.setItem('nxa_internship_matrix', JSON.stringify(updated));

    if (typeof window.firebase !== 'undefined' && target) {
      try {
        await window.firebase.firestore().collection('internships').doc(target.id).delete();
      } catch(e) {
        console.warn(e);
      }
    }
  };

  const handleApply = (id, applyLink) => {
    window.open(applyLink, '_blank');
    const updatedApps = [...myApps, id];
    setMyApps(updatedApps);
    localStorage.setItem(`nxa_apps_${state.user.email}`, JSON.stringify(updatedApps));
  };

  const handleQuizAnswer = (qIdx, oIdx) => {
    setAnswers({ ...answers, [qIdx]: oIdx });
  };

  const handleFinalizeQuiz = () => {
    // Check all 30 questions
    let correctCount = 0;
    NXA_ELITE_QUESTIONS.forEach((q, qIdx) => {
      if (answers[qIdx] === q.a) correctCount++;
    });

    if (correctCount === 30) {
      alert("EVALUATION COMPLETED: 100% Accuracy verified.");
      setViewState('pass');
    } else {
      alert(`EVALUATION FAILURE: ${correctCount}/30 correct. 100% Accuracy required. Retake core evaluation.`);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  if (viewState === 'quiz') {
    return (
      <Box sx={{ p: 3, pb: '120px' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#0B2E59', fontWeight: 900, letterSpacing: '4px', fontFamily: "'Outfit', sans-serif" }}>
            NXA_EVALUATION_UNIT
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 800 }}>
            30 QUESTIONS | 100% ACCURACY REQUIRED
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NXA_ELITE_QUESTIONS.map((q, qIdx) => (
            <Card key={qIdx} sx={{ borderRadius: '15px', border: '1px solid rgba(11, 46, 89, 0.08)', background: 'rgba(11, 46, 89, 0.01)', boxShadow: 'none', p: 3.5 }}>
              <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900, display: 'block', mb: 1.5 }}>
                NODE_{qIdx + 1}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#0B2E59', fontWeight: 700, mb: 2.5, lineHeight: 1.5 }}>
                {q.q}
              </Typography>
              <RadioGroup
                value={answers[qIdx] !== undefined ? String(answers[qIdx]) : ''}
                onChange={(e) => handleQuizAnswer(qIdx, parseInt(e.target.value))}
              >
                {q.o.map((opt, oIdx) => (
                  <FormControlLabel
                    key={oIdx}
                    value={String(oIdx)}
                    control={<Radio sx={{ color: '#0B2E59', '&.Mui-checked': { color: '#F7931E' } }} />}
                    label={opt}
                    sx={{
                      py: 1, px: 2, borderRadius: '8px', mb: 1, border: '1px solid rgba(11, 46, 89, 0.04)',
                      background: answers[qIdx] === oIdx ? 'rgba(247, 147, 30, 0.05)' : '#fff',
                      '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: '#0B2E59', fontWeight: 600 }
                    }}
                  />
                ))}
              </RadioGroup>
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 4, mb: 6 }}>
          <Button
            fullWidth variant="contained" onClick={handleFinalizeQuiz}
            sx={{
              background: '#0B2E59', color: '#fff', py: 2, borderRadius: '15px',
              fontWeight: 900, fontSize: '1rem', letterSpacing: '2px',
              '&:hover': { background: '#F7931E', boxShadow: '0 10px 20px rgba(247, 147, 30, 0.2)' }
            }}
          >
            FINALIZE_SUBMISSION
          </Button>
        </Box>
      </Box>
    );
  }

  if (viewState === 'pass') {
    return (
      <Box sx={{ p: 3, pb: '120px', textAlign: 'center' }}>
        <Box className="no-print" sx={{ mt: 4 }}>
          <Typography sx={{ fontSize: '4rem', mb: 1 }}>🏆</Typography>
          <Typography variant="h5" sx={{ color: '#F7931E', fontWeight: 900, mb: 1 }}>
            ASSESSMENT_PASSED
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
            100% Accuracy Verified. You are now NXA certified.
          </Typography>
          
          <Button
            variant="contained" onClick={() => setShowCertificate(true)}
            sx={{ background: '#0B2E59', color: '#fff', py: 1.5, px: 4, borderRadius: '10px', fontWeight: 900 }}
          >
            MANIFEST CERTIFICATE
          </Button>
        </Box>

        {showCertificate && (
          <Box 
            className="print-area"
            sx={{
              mt: 4, mx: 'auto', p: 4, maxWidth: '650px', background: '#fff', color: '#000',
              border: '10px double #000', display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '5px', color: '#000', fontFamily: "'Outfit', sans-serif" }}>
              NXA TALENT
            </Typography>
            <Box sx={{ my: 2, width: '100px', height: '2px', background: '#000' }} />
            <Typography variant="caption" sx={{ letterSpacing: '2px', fontWeight: 800, fontSize: '0.65rem' }}>
              INDUSTRIAL CORE CERTIFICATION
            </Typography>
            
            <Typography sx={{ my: 4, fontSize: '0.9rem' }}>This is to certify that</Typography>
            
            <Typography variant="h4" sx={{ textTransform: 'uppercase', borderBottom: '2px solid #000', px: 3, pb: 0.5, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              {state.user.name}
            </Typography>
            
            <Typography sx={{ my: 4, px: 2, lineWeight: 1.6, fontSize: '0.85rem', maxWidth: 440 }}>
              Has successfully manifested 100% accuracy in the <b>Industrial Talent Assessment</b> 
              covering Distributed Systems, Neural Architectures, and Multi-Node Synchronization.
            </Typography>

            <Grid container sx={{ mt: 5, width: '100%' }}>
              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>NXA_CORE_ID</Typography>
                <Typography sx={{ fontSize: '0.55rem' }}>{state.user.email}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>DATE_STAMP</Typography>
                <Typography sx={{ fontSize: '0.55rem' }}>{new Date().toDateString()}</Typography>
              </Grid>
            </Grid>
            
            <Button
              className="no-print"
              variant="outlined" onClick={printCertificate}
              sx={{ mt: 4, color: '#000', borderColor: '#000', fontWeight: 800 }}
            >
              🖨️ PRINT CREDENTIAL
            </Button>
          </Box>
        )}

        <Box className="no-print" sx={{ mt: 4 }}>
          <Button
            variant="text" onClick={() => setViewState('hubs')}
            sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}
          >
            RETURN TO LISTS
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            INTERNSHIP_HUBS
          </Typography>
          <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 800, fontSize: '0.6rem' }}>
            ACTIVE OPPORTUNITIES: {internships.length}
          </Typography>
        </Box>
      </Box>

      {/* Qualification block (Students) */}
      {state.role === 'student' && (
        <Card 
          sx={{
            background: 'linear-gradient(135deg, rgba(11, 46, 89, 0.04), rgba(247, 147, 30, 0.04))',
            border: '2px solid #0B2E59', borderRadius: '20px', p: 4, mb: 4, textAlign: 'center',
            boxShadow: '0 10px 30px rgba(11,46,89,0.03)'
          }}
        >
          <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 800, letterSpacing: '3px', display: 'block', mb: 1 }}>
            INDUSTRIAL QUALIFICATION
          </Typography>
          <Typography variant="h6" sx={{ color: '#0B2E59', fontWeight: 900, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
            ELITE_INTERNSHIP_ASSESSMENT
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem', mb: 3 }}>
            Solve 30 ultra-tough MCQ nodes to unlock the <b>NXA TALENT INDUSTRIAL CERTIFICATE</b>. 100% accuracy required.
          </Typography>
          <Button
            variant="contained" onClick={() => setViewState('quiz')}
            sx={{ background: '#0B2E59', color: '#fff', px: 4, py: 1.5, borderRadius: '12px', fontWeight: 900, letterSpacing: '1px', '&:hover': { background: '#F7931E' } }}
          >
            START EVALUATION CORE
          </Button>
        </Card>
      )}

      {/* Post Internship Block (Admin) */}
      {isCenter && (
        <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid #F7931E', borderRadius: '20px', p: 3, mb: 4, boxShadow: 'none' }}>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#F7931E', fontWeight: 900, letterSpacing: '1px', display: 'block', mb: 2 }}>
            POST NEW INTERNSHIP
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>COMPANY ROLE</Typography>
              <TextField 
                fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>STIPEND DURATION</Typography>
              <TextField 
                fullWidth size="small" value={desc} onChange={(e) => setDesc(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>CORE REQUIREMENTS</Typography>
              <TextField 
                fullWidth multiline rows={2} value={req} onChange={(e) => setReq(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontSize: '0.5rem', color: '#0B2E59', fontWeight: 800 }}>APPLICATION UPLINK URL</Typography>
              <TextField 
                fullWidth size="small" value={link} onChange={(e) => setLink(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', background: '#fff', fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth variant="contained" onClick={handlePostInternship}
                sx={{ background: '#F7931E', color: '#fff', py: 1.5, borderRadius: '8px', fontWeight: 900, '&:hover': { background: '#0B2E59' } }}
              >
                DEPLOY OPPORTUNITY
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Internships List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {internships.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: '#64748b', border: '1px dashed rgba(11, 46, 89, 0.15)', borderRadius: '20px' }}>
            NO_INTERNSHIP_NODES_FOUND
          </Box>
        ) : internships.map((inst, idx) => {
          const hasApplied = myApps.includes(inst.id);
          return (
            <Card key={inst.id} sx={{ borderRadius: '20px', border: '1px solid', borderColor: hasApplied ? '#10b981' : 'rgba(11, 46, 89, 0.08)', background: 'rgba(11, 46, 89, 0.02)', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '220px' }}>
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0B2E59', mb: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                    {inst.title}
                  </Typography>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ background: 'rgba(247, 147, 30, 0.1)', color: '#F7931E', px: 1, py: 0.2, borderRadius: '4px', fontSize: '0.55rem', fontWeight: 800 }}>
                      {inst.desc}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                    REQ: {inst.req}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {isCenter && (
                    <Button
                      variant="outlined" size="small" onClick={() => handleDeleteInternship(idx)}
                      sx={{ color: '#ff4545', borderColor: '#ff4545', fontSize: '0.6rem', fontWeight: 900, '&:hover': { background: 'rgba(255, 69, 69, 0.05)' } }}
                    >
                      TERMINATE
                    </Button>
                  )}
                  <Button
                    variant={hasApplied ? 'outlined' : 'contained'}
                    disabled={hasApplied}
                    onClick={() => handleApply(inst.id, inst.link)}
                    sx={{
                      fontSize: '0.65rem', fontWeight: 900, py: 1, px: 3, borderRadius: '8px',
                      background: hasApplied ? 'rgba(16, 185, 129, 0.05)' : '#0B2E59',
                      color: hasApplied ? '#10b981' : '#fff',
                      borderColor: hasApplied ? '#10b981' : 'none',
                      '&:hover': { background: '#F7931E' }
                    }}
                  >
                    {hasApplied ? 'APPLIED ✓' : 'APPLY NOW'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

    </Box>
  );
}
