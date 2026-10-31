import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';

// --- PREMIUM THEME SETUP ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // A slightly deeper, more professional blue
      light: '#60a5fa',
      dark: '#1e40af',
    },
    background: {
      default: '#f8fafc', // Very light gray-blue background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Softer than pure black
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Use Inter if available, else Roboto
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, // No all-caps buttons
  },
  shape: {
    borderRadius: 12, // Softer, larger border radius globally
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(148, 163, 184, 0.05), 0px 4px 8px rgba(148, 163, 184, 0.05)', // Soft shadow 1
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)', // Soft shadow 2
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Premium hover shadow (index 3)
    // ... fill others if needed, but we mainly use these
    ...Array(21).fill('none')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', // Subtle gradient
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 2px 4px rgba(148, 163, 184, 0.05), 0px 4px 8px rgba(148, 163, 184, 0.05)',
          border: '1px solid #f1f5f9',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }
      }
    }
  },
});

// Global Animation Styles
const globalStyles = (
  <GlobalStyles
    styles={{
      '@keyframes fadeInUp': {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      '.stagger-enter': {
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0,
      },
    }}
  />
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);