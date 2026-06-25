import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './firebaseConfig';

// Expose original setItem globally to allow silent local writes
window.originalSetItem = localStorage.setItem;

localStorage.setItem = function(key, value) {
  window.originalSetItem.apply(this, arguments);
  if (key.startsWith('nxa_')) {
    const isApp = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.platform !== 'web';
    // __BACKEND_IP__ is defined globally by Vite at build time
    const host = isApp ? __BACKEND_IP__ : window.location.hostname;
    fetch(`http://${host}:3001/api/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(() => {});
  }
};
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B2E59', // Navy Blue
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#F7931E', // Saffron
      contrastText: '#ffffff'
    },
    background: {
      default: '#ffffff', // White Background
      paper: '#f8fafc' // Soft off-white for cards/accordions
    },
    text: {
      primary: '#0B2E59', // Navy Blue primary text
      secondary: '#475569', // Readability grey
      disabled: '#94a3b8'
    }
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 900 },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 900 },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 900 },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 900 },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    button: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 800
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(11, 46, 89, 0.02)'
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Remove the HTML loading mask once React initializes
const mask = document.getElementById('loading-mask');
if (mask) {
  mask.style.opacity = '0';
  setTimeout(() => mask.remove(), 600);
}
