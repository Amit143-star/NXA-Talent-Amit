import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, 
  Avatar, CircularProgress, Chip, Grid, Paper, Divider, Alert
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import StarsIcon from '@mui/icons-material/Stars';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const INTERVIEW_TOPICS = {
  algorithms: {
    label: "Algorithms & Data Structures",
    questions: [
      { q: "Explain the time complexity and working of Quick Sort. Under what conditions does it degrade to O(N^2)?", keywords: ["pivot", "partition", "worst", "sorted", "O(n log n)"] },
      { q: "How does a Hash Map handle collisions? Describe Chaining versus Open Addressing.", keywords: ["hash", "collision", "chaining", "probe", "bucket", "address"] },
      { q: "What is the difference between Depth-First Search (DFS) and Breadth-First Search (BFS)? When would you use BFS over DFS?", keywords: ["queue", "stack", "level", "shortest path", "tree", "graph"] }
    ]
  },
  frontend: {
    label: "Full-Stack Web Dev (React & Node)",
    questions: [
      { q: "Explain the Virtual DOM in React and how the reconciliation process (Fiber) works.", keywords: ["diff", "reconciliation", "fiber", "render", "state", "ui"] },
      { q: "What is CORS (Cross-Origin Resource Sharing)? How do you configure it in an Express.js backend?", keywords: ["header", "origin", "middleware", "security", "http", "cross-origin"] },
      { q: "Describe the event loop in Node.js. What are the microtask and macrotask queues?", keywords: ["event loop", "non-blocking", "callback", "promise", "nexttick", "setTimeout"] }
    ]
  },
  systems: {
    label: "Distributed Architectures",
    questions: [
      { q: "What is the CAP Theorem? Can a system guarantee both Consistency and Availability during a partition?", keywords: ["partition", "consistency", "availability", "compromise", "network"] },
      { q: "How does horizontal scaling differ from vertical scaling? When is database replication useful?", keywords: ["scale", "replica", "nodes", "database", "load balance", "hardware"] },
      { q: "What is a message queue (e.g., RabbitMQ, Kafka) and why is it used in microservices?", keywords: ["asynchronous", "broker", "decouple", "pub/sub", "throughput", "consumer"] }
    ]
  }
};

export default function AiCoach({ state }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Interview state
  const [interviewTopic, setInterviewTopic] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answerInput, setAnswerInput] = useState('');
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [feedbackLog, setFeedbackLog] = useState([]);

  // Load initial welcome message
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Salutations, ${state.user.name.split(' ')[0]}. I am the NXA Neural Study & Career Advisor. I have synchronized with your industrial dossier.\n\nType a question or select a quick-query action below to begin:`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [state.user.name]);

  // Scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, {
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    addMessage('user', query);
    setInputText('');
    setIsTyping(true);

    // Mock NLP reasoning delay
    setTimeout(() => {
      let aiResponse = "";
      const profile = JSON.parse(localStorage.getItem('nxa_student_profiles'))?.[state.user.email.toLowerCase().trim()] || {};
      const leetcodeSolved = JSON.parse(localStorage.getItem('nxa_leetcode_solved')) || [];
      const assignedCourses = profile.assigned_courses || [];

      const queryLower = query.toLowerCase();

      if (queryLower.includes('dossier') || queryLower.includes('profile')) {
        aiResponse = `Analyzing Core Dossier metrics...\n\n- **CGPA**: ${profile.ug_marks || '0.00'}\n- **Degree**: ${profile.ug_degree || 'N/A'}\n- **Payment Status**: ${profile.payment_status === 'verified' ? '✅ VERIFIED' : '❌ PENDING'}\n\n*Recommendation*: Keep building industrial project nodes to increase your portfolio relevance. Ensure payment verification to access core certification modules.`;
      } else if (queryLower.includes('roadmap') || queryLower.includes('career') || queryLower.includes('learn')) {
        aiResponse = `Based on your profiles, here is your customized NXA Neural Career Roadmap:\n\n1. **Algorithms Mastery**: Continue solving Easy and Medium LeetCode problems in TS/JS.\n2. **Cloud Systems**: Your assigned course catalog holds ${assignedCourses.length} slots. Accelerate full-stack node deployments.\n3. **Assessments**: Complete the 30-MCQ qualification exam in the Internships section to manifest certificates.`;
      } else if (queryLower.includes('leetcode') || queryLower.includes('solve')) {
        aiResponse = `Evaluating stack competence...\n\nYou have unlocked **${leetcodeSolved.length} LeetCode nodes**. To elevate your ranking to Elite Tier, target completing 15 hard level blocks. Focus on recursion limits and optimized pointer bounds.`;
      } else {
        const responses = [
          `Fascinating query. I recommend strengthening your database transaction matrices. High scaling systems require lock-free queuing patterns.`,
          `Query registered in memory bank. Remember that neural scaling is a function of consistent daily study. How can I assist you with your course assignments?`,
          `Your profile is performing at optimum capacity. Target clearing the LeetCode sandbox tests to unlock additional credential nodes.`,
          `Interesting technical approach. Make sure your architectures decouple processing via publish-subscribe nodes like Kafka to avoid bottlenecks.`
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      }

      addMessage('ai', aiResponse);
      setIsTyping(false);
    }, 1000);
  };

  const handleStartInterview = (topicKey) => {
    setInterviewTopic(topicKey);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setAnswerInput('');
    setInterviewFinished(false);
    setFeedbackLog([]);
  };

  const handleNextInterviewQuestion = () => {
    if (!answerInput.trim()) return alert("Please formulate an answer.");

    const currentTopic = INTERVIEW_TOPICS[interviewTopic];
    const currentQuestion = currentTopic.questions[currentQuestionIdx];

    // Evaluate answer based on keywords matched
    const ansLower = answerInput.toLowerCase();
    const matched = currentQuestion.keywords.filter(keyword => ansLower.includes(keyword));
    const score = Math.min(10, Math.round((matched.length / currentQuestion.keywords.length) * 10) + (ansLower.length > 80 ? 2 : 0));

    const evaluation = {
      q: currentQuestion.q,
      ans: answerInput,
      score,
      matched: matched,
      missing: currentQuestion.keywords.filter(keyword => !ansLower.includes(keyword))
    };

    const newFeedbackLog = [...feedbackLog, evaluation];
    setFeedbackLog(newFeedbackLog);

    if (currentQuestionIdx < currentTopic.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setAnswerInput('');
    } else {
      // Calculate final score
      const totalScore = newFeedbackLog.reduce((acc, curr) => acc + curr.score, 0);
      const avgScore = (totalScore / currentTopic.questions.length).toFixed(1);

      // Save points to student dashboard points
      let profilePoints = parseInt(localStorage.getItem(`nxa_points_${state.user.email}`)) || 0;
      profilePoints += Math.round(totalScore * 5); // Add points
      localStorage.setItem(`nxa_points_${state.user.email}`, profilePoints);

      setInterviewFinished(true);
    }
  };

  return (
    <Box sx={{ p: 3, pb: '120px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid rgba(11, 46, 89, 0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', letterSpacing: '1px' }}>
            NEURAL_COACH_NEXUS
          </Typography>
          <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 800, fontSize: '0.6rem' }}>
            AI ADVISORY & INTERVIEW MATRIX v1.2
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Advisor Chat */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 180px)' } }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '24px', border: '1px solid rgba(11, 46, 89, 0.08)', boxShadow: 'none', background: 'rgba(11, 46, 89, 0.01)', overflow: 'hidden' }}>
            
            {/* Messages Area */}
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((m, idx) => (
                <Box 
                  key={idx} 
                  sx={{ 
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    gap: 1.5,
                    flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: m.sender === 'user' ? '#F7931E' : '#0B2E59',
                      width: 32,
                      height: 32
                    }}
                  >
                    {m.sender === 'user' ? 'U' : <SmartToyIcon sx={{ fontSize: '18px' }} />}
                  </Avatar>
                  <Box>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: m.sender === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                        background: m.sender === 'user' ? '#F7931E' : '#ffffff',
                        color: m.sender === 'user' ? '#ffffff' : '#0B2E59',
                        border: m.sender === 'user' ? 'none' : '1px solid rgba(11, 46, 89, 0.06)',
                        boxShadow: 'none',
                        whiteSpace: 'pre-line',
                        fontSize: '0.8rem',
                        lineHeight: 1.5
                      }}
                    >
                      {m.text}
                    </Paper>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: m.sender === 'user' ? 'right' : 'left', color: '#64748b', fontSize: '0.55rem' }}>
                      {m.time}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {isTyping && (
                <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0B2E59', width: 32, height: 32 }}>
                    <SmartToyIcon sx={{ fontSize: '18px' }} />
                  </Avatar>
                  <CircularProgress size={16} sx={{ color: '#0B2E59' }} />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>AI is thinking...</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Actions Panel */}
            <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 1, overflowX: 'auto', borderTop: '1px solid rgba(11, 46, 89, 0.05)', background: '#fff' }}>
              <Chip 
                label="Suggest roadmap" 
                onClick={() => handleSend("Suggest a personalized learning roadmap")} 
                sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.1)', cursor: 'pointer' }}
                variant="outlined"
              />
              <Chip 
                label="Analyze my dossier" 
                onClick={() => handleSend("Analyze my profile dossier and academic standing")} 
                sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.1)', cursor: 'pointer' }}
                variant="outlined"
              />
              <Chip 
                label="Leetcode advice" 
                onClick={() => handleSend("Give me advice on improving my LeetCode performance")} 
                sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.1)', cursor: 'pointer' }}
                variant="outlined"
              />
            </Box>

            {/* Input Bar */}
            <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid rgba(11, 46, 89, 0.08)', background: '#ffffff' }}>
              <TextField 
                fullWidth
                size="small"
                placeholder="Ask technical guidelines..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.8rem' } }}
              />
              <Button 
                variant="contained" 
                onClick={() => handleSend()}
                sx={{ minWidth: '45px', p: 0, borderRadius: '10px', background: '#0B2E59', '&:hover': { background: '#F7931E' } }}
              >
                <SendIcon sx={{ fontSize: '18px' }} />
              </Button>
            </Box>

          </Card>
        </Grid>

        {/* Right Side: Mock Interview Simulator */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 180px)' } }}>
          <Card sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', borderRadius: '24px', border: '1px solid rgba(11, 46, 89, 0.08)', boxShadow: 'none', background: 'rgba(11, 46, 89, 0.01)', overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#0B2E59', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon sx={{ color: '#F7931E' }} /> MOCK TECHNICAL INTERVIEW
            </Typography>

            {!interviewTopic ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem', mb: 3 }}>
                  Select an evaluation stream to initiate the mock interview panel.
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {Object.keys(INTERVIEW_TOPICS).map(key => (
                    <Button
                      key={key}
                      variant="outlined"
                      onClick={() => handleStartInterview(key)}
                      sx={{ 
                        color: '#0B2E59', borderColor: 'rgba(11, 46, 89, 0.15)', textTransform: 'none',
                        py: 1.2, borderRadius: '12px', fontWeight: 800, fontSize: '0.75rem',
                        '&:hover': { borderColor: '#F7931E', background: 'rgba(247,147,30,0.02)' }
                      }}
                    >
                      {INTERVIEW_TOPICS[key].label}
                    </Button>
                  ))}
                </Box>
              </Box>
            ) : interviewFinished ? (
              <Box>
                <Alert severity="success" icon={<StarsIcon />} sx={{ borderRadius: '12px', mb: 3, fontSize: '0.75rem' }}>
                  <b>INTERVIEW COMPLETED</b>. Total Score: {feedbackLog.reduce((acc, curr) => acc + curr.score, 0)}/{feedbackLog.length * 10}
                </Alert>

                <Box sx={{ display: 'grid', gap: 2.5, mb: 3 }}>
                  {feedbackLog.map((log, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: '12px', background: '#fff', border: '1px solid rgba(11, 46, 89, 0.06)' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0B2E59', mb: 1 }}>
                        Q{idx+1}: {log.q}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', mb: 1.5 }}>
                        Your answer: "{log.ans}"
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={`Score: ${log.score}/10`} 
                          size="small"
                          sx={{ 
                            background: log.score >= 7 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(247,147,30,0.1)',
                            color: log.score >= 7 ? '#10b981' : '#F7931E',
                            fontWeight: 800,
                            fontSize: '0.65rem'
                          }}
                        />
                        {log.matched.length > 0 && (
                          <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.6rem' }}>
                            ✓ Keywords: {log.matched.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setInterviewTopic(null)}
                  sx={{ background: '#0B2E59', color: '#fff', py: 1.2, borderRadius: '10px' }}
                >
                  START NEW INTERVIEW
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(11,46,89,0.06)', pb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#F7931E', fontWeight: 900 }}>
                    {INTERVIEW_TOPICS[interviewTopic].label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0B2E59', fontWeight: 800 }}>
                    Q {currentQuestionIdx + 1} of {INTERVIEW_TOPICS[interviewTopic].questions.length}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: '12px', background: '#fff', border: '1px solid rgba(11,46,89,0.06)' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B2E59', lineHeight: 1.5 }}>
                    {INTERVIEW_TOPICS[interviewTopic].questions[currentQuestionIdx].q}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Type your technical explanation or solution concept..."
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: '#ffffff',
                      fontSize: '0.75rem',
                      color: '#0B2E59',
                      fontFamily: 'monospace'
                    }
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleNextInterviewQuestion}
                  sx={{ 
                    background: '#F7931E', color: '#fff', fontWeight: 900, py: 1.5, borderRadius: '10px',
                    '&:hover': { background: '#0B2E59' }
                  }}
                >
                  {currentQuestionIdx === INTERVIEW_TOPICS[interviewTopic].questions.length - 1 ? "FINISH EVALUATION" : "SUBMIT & NEXT"}
                </Button>
                
                <Button
                  variant="text"
                  onClick={() => setInterviewTopic(null)}
                  sx={{ color: '#64748b', fontSize: '0.65rem' }}
                >
                  ABORT ASSESSMENT
                </Button>
              </Box>
            )}

          </Card>
        </Grid>

      </Grid>

    </Box>
  );
}
