import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, TextField 
} from '@mui/material';

export default function Leetcode({ state }) {
  const [activeLang, setActiveLang] = useState(() => {
    return localStorage.getItem('nxa_active_lang') || 'JAVASCRIPT';
  });

  const [activeProblem, setActiveProblem] = useState(null); // When inside editor
  const [code, setCode] = useState('');
  const [consoleLog, setConsoleLog] = useState('// NEURAL_CONSOLE: READY...');
  const [compiling, setCompiling] = useState(false);

  const [solved, setSolved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nxa_leetcode_solved')) || []; } catch(e) { return []; }
  });

  const generateBank = (lang) => {
    const banks = {
      'JAVASCRIPT': ['Async Logic', 'Event Loop', 'DOM Matrix', 'Promise Core', 'Closure Scope', 'Prototype Chain', 'ES6 Modules', 'Array Buffer', 'Web Workers', 'Intersection Obs'],
      'PYTHON': ['Data Frame', 'Neural Net', 'Automation', 'Tuple Logic', 'Dict Matrix', 'Iterator Core', 'Decorator Alt', 'List Comp', 'Boto3 Sync', 'Pandas Opt'],
      'JAVA': ['OOP Paradigm', 'Threads', 'JVM Memory', 'Spring Seed', 'Lambda Stream', 'Interface Flow', 'Hibernate Sync', 'Servlet Core', 'Generic Type', 'Annotation Matrix'],
      'CPP': ['Pointers', 'Malloc Core', 'Hardware', 'STL Vector', 'Template Meta', 'DirectX Logic', 'ASIO Network', 'Smart Ptrs', 'Recursion Opt', 'VTable Matrix'],
      'TYPESCRIPT': ['Type Alias', 'Generics', 'Decorators', 'Namespace', 'Union Types', 'Utility Types', 'Enum Logic', 'Exhaustive Check', 'Conditional Types', 'Mapped Types'],
      'GO': ['Goroutines', 'Channel Sync', 'Struct Opt', 'Interface', 'Panic Recovery', 'Select Logic', 'Defer Stack', 'Context Sync', 'Pointer Flow', 'Slices Opt'],
      'RUST': ['Borrowing', 'Ownership', 'Traits', 'Safety Core', 'Macros', 'Lifetimes', 'Enums Match', 'Cargo Sync', 'Zero Cost', 'Async Await'],
      'SWIFT': ['SwiftUI', 'ARC System', 'Protocols', 'Optionals', 'Closures', 'Error Handle', 'Generic Obj', 'Delegate Flow', 'Composability', 'Combine Sync']
    };
    
    let bank = [];
    const topics = banks[lang] || banks['JAVASCRIPT'];
    for (let i = 1; i <= 25; i++) {
      const topic = topics[i % topics.length];
      const variant = ['OPTIMIZED', 'SECURE', 'CONCURRENT', 'RECURSIVE', 'SCALABLE'][i % 5];
      bank.push({
        id: `${lang.slice(0,2)}_${i}`,
        lang: lang,
        title: `${lang}_${topic.toUpperCase().replace(/ /g, '_')}_${variant}_${i}`,
        diff: i < 8 ? 'EASY' : (i < 18 ? 'MEDIUM' : 'HARD'),
        desc: `Mastering ${lang} ${topic} with ${variant} methodology. Analyze logic flow and manifest solution.`
      });
    }
    return bank;
  };

  const currentBank = generateBank(activeLang);
  const allProblems = [
    { id: 'sandbox', title: 'NEURAL_SANDBOX', diff: 'FREE', desc: 'Open playground for unrestricted practice.' },
    ...currentBank
  ];

  const handleSetLanguage = (lang) => {
    setActiveLang(lang);
    localStorage.setItem('nxa_active_lang', lang);
  };

  const handleOpenProblem = (p) => {
    setActiveProblem(p);
    
    let template = `// Language: ${activeLang}\nfunction solve(input) {\n  // Code logic here...\n}\n`;
    if (activeLang === 'PYTHON') template = `# Language: ${activeLang}\ndef solve(input):\n    # Core logic here...\n    pass\n`;
    if (activeLang === 'JAVA') template = `// Language: ${activeLang}\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here...\n    }\n}\n`;
    if (activeLang === 'CPP') template = `// Language: ${activeLang}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`;
    if (activeLang === 'TYPESCRIPT') template = `// Language: ${activeLang}\ninterface Input { data: any }\nfunction solve(input: Input): void {\n  // Type-safe logic...\n}\n`;
    if (activeLang === 'GO') template = `// Language: ${activeLang}\npackage main\nimport "fmt"\n\nfunc main() {\n  // Goroutine logic here...\n}\n`;
    if (activeLang === 'RUST') template = `// Language: ${activeLang}\nfn main() {\n    let mut neural_core = String::from("ACTIVE");\n    // Ownership logic here...\n}\n`;
    if (activeLang === 'SWIFT') template = `// Language: ${activeLang}\nimport Foundation\n\nfunc solve() {\n    // Swift arc logic here...\n}\n`;

    setCode(p.id === 'sandbox' ? `// --- NEURAL_SANDBOX (${activeLang}) ---\n\n` : template);
    setConsoleLog('// NEURAL_CONSOLE: READY...');
  };

  const handleRunTest = () => {
    setCompiling(true);
    setConsoleLog('[COMPILING...] Syntactically parsing scope...');
    
    setTimeout(() => {
      if (activeLang !== 'JAVASCRIPT') {
        setConsoleLog(`[SUCCESS] Mock compiling for ${activeLang} Environment: OK.\nOutput: synthetic 200 OK.`);
        setCompiling(false);
        return;
      }

      try {
        if (activeProblem.id === 'sandbox') {
          // Eval sandbox directly
          const cleanCode = code.replace(/^\/\/.*$/gm, ''); // strip comments
          const result = new Function(cleanCode)();
          setConsoleLog(`[SUCCESS] Sandbox parsed and executed.\nOutput: ${result !== undefined ? JSON.stringify(result) : 'void undefined'}`);
        } else {
          // Evaluate solver function solve(input)
          const runWrapper = `
            ${code}
            if (typeof solve !== 'function') {
              throw new Error("Missing 'solve' function. Formulate: function solve(input) { ... }");
            }
            return solve;
          `;
          const solveFn = new Function(runWrapper)();
          
          let tests = [];
          // Problem 1: Async Logic -> Expects input * 2
          if (activeProblem.id.endsWith('_1')) {
            tests = [
              { in: 3, check: (res) => res === 6 },
              { in: -5, check: (res) => res === -10 }
            ];
          } else if (activeProblem.id.endsWith('_2')) { // Event Loop -> Expects input squared
            tests = [
              { in: 4, check: (res) => res === 16 },
              { in: 10, check: (res) => res === 100 }
            ];
          } else {
            // Generic check
            tests = [
              { in: "test", check: (res) => res !== undefined }
            ];
          }

          let logs = [];
          let passedAll = true;
          tests.forEach((t, i) => {
            try {
              const res = solveFn(t.in);
              const ok = t.check(res);
              if (ok) {
                logs.push(`[TEST ${i+1}] input: ${JSON.stringify(t.in)} -> passed ✓`);
              } else {
                passedAll = false;
                logs.push(`[TEST ${i+1}] input: ${JSON.stringify(t.in)} -> failed ❌ (got: ${JSON.stringify(res)})`);
              }
            } catch (err) {
              passedAll = false;
              logs.push(`[TEST ${i+1}] error: ${err.message} ❌`);
            }
          });

          if (passedAll) {
            setConsoleLog(`[SUCCESS] Code verified against internal test suite.\n${logs.join('\n')}\nVerdict: ALL TESTS PASSED ✓`);
          } else {
            setConsoleLog(`[ASSERTION ERROR] Core checks failed.\n${logs.join('\n')}`);
          }
        }
      } catch (err) {
        setConsoleLog(`[COMPILER ERROR] ${err.message}`);
      }
      setCompiling(false);
    }, 600);
  };

  const handleSubmit = () => {
    if (activeLang === 'JAVASCRIPT' && activeProblem.id !== 'sandbox') {
      try {
        const runWrapper = `
          ${code}
          if (typeof solve !== 'function') throw new Error("Missing 'solve' function.");
          return solve;
        `;
        const solveFn = new Function(runWrapper)();
        // Dry run test assertion
        solveFn(1);
      } catch (e) {
        alert("COMMIT ABORTED: Ensure your code compiles and the 'solve' function compiles.");
        return;
      }
    }

    if (activeProblem.id !== 'sandbox') {
      const updatedSolved = [...solved];
      if (!updatedSolved.includes(activeProblem.id)) {
        updatedSolved.push(activeProblem.id);
      }
      setSolved(updatedSolved);
      localStorage.setItem('nxa_leetcode_solved', JSON.stringify(updatedSolved));
      
      // Award additional power points to the user's score record!
      let profilePoints = parseInt(localStorage.getItem(`nxa_points_${state.user.email}`)) || 0;
      profilePoints += 50; // 50 points per problem solved
      localStorage.setItem(`nxa_points_${state.user.email}`, profilePoints);
    }
    
    setConsoleLog('[SUCCESS] Sync complete. Node saved to local manifest.');
    setTimeout(() => {
      setActiveProblem(null);
    }, 800);
  };

  if (activeProblem) {
    return (
      <Box sx={{ p: 3, pb: '120px', display: 'flex', flexDirection: 'column' }}>
        <Button 
          onClick={() => setActiveProblem(null)}
          sx={{ alignSelf: 'flex-start', color: '#0B2E59', fontWeight: 800, fontSize: '0.65rem', mb: 2, p: 0 }}
        >
          ← EXIT_CORE
        </Button>
        
        <Card sx={{ background: 'rgba(11, 46, 89, 0.02)', border: '1px solid rgba(11, 46, 89, 0.08)', p: 2, borderRadius: '12px', mb: 2, boxShadow: 'none' }}>
          <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0B2E59', mb: 0.5 }}>
            {activeProblem.title}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1.4 }}>
            {activeProblem.desc}
          </Typography>
        </Card>

        {/* Code editor */}
        <Box sx={{ flex: 1, minHeight: '320px', background: '#07070a', border: '1px solid rgba(11, 46, 89, 0.15)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ background: '#111', py: 0.5, px: 2, borderBottom: '1px solid rgba(11,46,89,0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b' }}>
            <span>NXA_TERMINAL_v4.0</span>
            <span>MODE: {activeLang}</span>
          </Box>
          
          <textarea
            spellCheck="false"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              flex: 1, width: '100%', background: 'transparent', border: 'none',
              color: '#00ff6a', fontFamily: 'monospace', fontSize: '0.75rem',
              padding: '16px', outline: 'none', resize: 'none'
            }}
          />
          
          <Box sx={{ minHeight: '55px', background: '#000', borderTop: '1px solid rgba(11,46,89,0.15)', p: 1, color: '#64748b', fontSize: '0.6rem', fontFamily: 'monospace' }}>
            {consoleLog}
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
          <Grid item xs={4}>
            <Button
              fullWidth variant="outlined" onClick={handleRunTest} disabled={compiling}
              sx={{ color: '#0B2E59', borderColor: '#0B2E59', fontWeight: 800, py: 1.2, borderRadius: '8px' }}
            >
              RUN_CORE
            </Button>
          </Grid>
          <Grid item xs={8}>
            <Button
              fullWidth variant="contained" onClick={handleSubmit}
              sx={{ background: '#0B2E59', color: '#fff', fontWeight: 900, py: 1.2, borderRadius: '8px', '&:hover': { background: '#F7931E' } }}
            >
              COMMIT_SYNC
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: '120px' }}>
      
      {/* Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0B2E59', mb: 2, letterSpacing: '1px' }}>
          MODERN_STACK_NEXUS
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}>
          {['JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA', 'CPP', 'SWIFT'].map(l => {
            const isSelected = activeLang === l;
            return (
              <Button
                key={l}
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => handleSetLanguage(l)}
                sx={{
                  flexShrink: 0, px: 2, py: 0.8, borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900,
                  background: isSelected ? '#0B2E59' : 'transparent',
                  color: isSelected ? '#fff' : '#64748b',
                  borderColor: isSelected ? '#0B2E59' : 'rgba(11, 46, 89, 0.1)',
                  '&:hover': { background: isSelected ? '#0B2E59' : 'rgba(11, 46, 89, 0.05)' }
                }}
              >
                {l}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Problem matrix */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {allProblems.map(p => {
          const isSolved = solved.includes(p.id);
          const isSandbox = p.id === 'sandbox';
          
          return (
            <Card
              key={p.id}
              onClick={() => handleOpenProblem(p)}
              sx={{
                cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(11, 46, 89, 0.08)',
                background: 'rgba(11, 46, 89, 0.01)', boxShadow: 'none', transition: 'all 0.2s',
                borderLeft: '4px solid',
                borderLeftColor: isSandbox ? '#0B2E59' : (isSolved ? '#10b981' : 'rgba(11,46,89,0.1)'),
                '&:hover': { transform: 'translateY(-1px)' }
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 900 }}>
                    [ {p.diff} ]
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0B2E59', mt: 0.2 }}>
                    {p.title}
                  </Typography>
                </Box>
                {isSolved && <Typography sx={{ fontSize: '1rem' }}>✅</Typography>}
              </CardContent>
            </Card>
          );
        })}
      </Box>

    </Box>
  );
}
