import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#0d9488',
      contrastText: '#ffffff'
    },
    error: {
      main: '#f472b6',
      light: '#fda4af',
      dark: '#e11d48'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    background: {
      default: '#0f0e17',
      paper: 'rgba(22, 21, 35, 0.85)'
    },
    text: {
      primary: '#e8e6f0',
      secondary: '#a5a3b8'
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h3: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h4: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h5: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 600
    },
    h6: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 600
    },
    subtitle1: {
      fontWeight: 600
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: '0.02em'
    },
    button: {
      fontWeight: 600,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(22, 21, 35, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 16,
          border: '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(22, 21, 35, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 16,
          border: '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(99, 102, 241, 0.25)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        },
        contained: {
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.24)',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(99, 102, 241, 0.36)',
            transform: 'translateY(-1px)'
          }
        },
        outlined: {
          borderColor: 'rgba(99, 102, 241, 0.3)',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.04)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(22, 21, 35, 0.7)',
            backdropFilter: 'blur(8px)',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.3)',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.4)'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.12)'
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(30, 28, 48, 0.9)'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          backdropFilter: 'blur(8px)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)'
        },
        outlined: {
          borderColor: 'rgba(99, 102, 241, 0.25)',
          backgroundColor: 'rgba(99, 102, 241, 0.04)',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.08)'
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(8px)',
          border: '1px solid'
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.2)'
        },
        standardError: {
          backgroundColor: 'rgba(244, 114, 182, 0.08)',
          borderColor: 'rgba(244, 114, 182, 0.2)'
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          borderColor: 'rgba(245, 158, 11, 0.2)'
        },
        standardInfo: {
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderColor: 'rgba(99, 102, 241, 0.2)'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(99, 102, 241, 0.1)'
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#6366f1'
        }
      }
    }
  }
});