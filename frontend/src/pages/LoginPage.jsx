import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Checkbox, CircularProgress, Divider, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { login, register } from '../api';
import { setAccessToken } from '../auth';
const features = [{
  icon: TrendingUpIcon,
  label: 'Revenue Analytics',
  color: '#6366f1'
}, {
  icon: ShieldIcon,
  label: 'Risk Intelligence',
  color: '#10b981'
}, {
  icon: SmartToyIcon,
  label: 'AI COO Assistant',
  color: '#f59e0b'
}, {
  icon: AutoGraphIcon,
  label: 'Cash Flow Forecast',
  color: '#f472b6'
}];
export default function LoginPage() {
  const [mode, setMode] = useState('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isRegistering = mode === 'register';
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegistering && password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const response = isRegistering ? await register(username, password) : await login(username, password);
      setAccessToken(response.data.access_token);
      navigate('/');
    } catch (err) {
      setError(`${isRegistering ? 'Account creation' : 'Login'} failed: ${err.response?.data?.detail || err.message || 'Please check your credentials.'}`);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = event => {
    if (event.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };
  const switchMode = () => {
    setMode(current => current === 'login' ? 'register' : 'login');
    setError('');
    setConfirmPassword('');
  };
  return <Box sx={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    p: 2
  }}>
      {/* Floating particles background */}
      <div className="particles-container">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      {/* Main login card */}
      <Box sx={{
      width: '100%',
      maxWidth: 480,
      position: 'relative',
      zIndex: 1,
      animation: 'scaleIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
    }}>
        {/* Brand area */}
        <Box sx={{
        textAlign: 'center',
        mb: 4,
        animation: 'fadeInUp 600ms ease both'
      }}>
          <Box sx={{
          width: 64,
          height: 64,
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #6366f1, #10b981)',
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 2,
          boxShadow: '0 12px 32px rgba(99, 102, 241, 0.3)',
          animation: 'float 6s ease-in-out infinite'
        }}>
            <Typography sx={{
            color: '#fff',
            fontWeight: 900,
            fontSize: '1.6rem',
            fontFamily: "'Space Grotesk'"
          }}>
              F
            </Typography>
          </Box>
          <Typography variant="h5" sx={{
          fontWeight: 800,
          color: '#e8e6f0',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
            FinTech COO Agent
          </Typography>
          <Typography sx={{
          color: '#a5a3b8',
          fontSize: '0.9rem',
          mt: 0.5
        }}>
            AI-Powered Executive Intelligence
          </Typography>
        </Box>

        {/* Glass form card */}
        <Box sx={{
        background: 'rgba(22, 21, 35, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '20px',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        p: {
          xs: 3,
          sm: 4
        },
        animation: 'fadeInUp 600ms ease both',
        animationDelay: '0.1s'
      }}>
          <Stack spacing={1} sx={{
          mb: 3
        }}>
            <Typography variant="h5" sx={{
            color: '#e8e6f0',
            fontWeight: 800
          }}>
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </Typography>
            <Typography sx={{
            color: '#a5a3b8',
            fontSize: '0.9rem'
          }}>
              {isRegistering ? 'Choose a unique username and password to continue.' : 'Sign in to your operations command center.'}
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{
          mb: 2.5
        }}>
              {error}
            </Alert>}

          <Stack spacing={2.5}>
            <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyDown} autoComplete="username" InputProps={{
            startAdornment: <InputAdornment position="start">
                    <AccountCircleIcon sx={{
                color: '#94a3b8'
              }} />
                  </InputAdornment>
          }} />

            <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete={isRegistering ? 'new-password' : 'current-password'} InputProps={{
            startAdornment: <InputAdornment position="start">
                    <LockIcon sx={{
                color: '#94a3b8'
              }} />
                  </InputAdornment>,
            endAdornment: <InputAdornment position="end">
                    <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(c => !c)} edge="end" sx={{
                color: '#94a3b8'
              }}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
          }} />

            {isRegistering && <TextField fullWidth label="Confirm password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete="new-password" sx={{
            animation: 'slideUp 300ms ease both'
          }} InputProps={{
            startAdornment: <InputAdornment position="start">
                      <LockIcon sx={{
                color: '#94a3b8'
              }} />
                    </InputAdornment>
          }} />}

            <Stack direction={{
            xs: 'column',
            sm: 'row'
          }} justifyContent="space-between" alignItems={{
            xs: 'flex-start',
            sm: 'center'
          }} spacing={1}>
              <FormControlLabel control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} sx={{
              color: 'rgba(99, 102, 241, 0.4)',
              '&.Mui-checked': {
                color: '#6366f1'
              }
            }} />} label={<Typography sx={{
              fontSize: '0.85rem',
              color: '#a5a3b8'
            }}>
                    Remember this device
                  </Typography>} />
              <Button size="small" onClick={switchMode} sx={{
              color: '#6366f1',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
                {isRegistering ? 'I already have an account' : 'Create a new account'}
              </Button>
            </Stack>

            <Button fullWidth size="large" variant="contained" onClick={handleSubmit} disabled={loading || !username || !password || isRegistering && !confirmPassword} sx={{
            py: 1.6,
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 12px 28px rgba(99, 102, 241, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite'
            },
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              boxShadow: '0 16px 36px rgba(99, 102, 241, 0.4)',
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              background: 'rgba(99, 102, 241, 0.3)',
              boxShadow: 'none'
            }
          }}>
              {loading ? <CircularProgress size={24} sx={{
              color: 'white'
            }} /> : isRegistering ? 'Create account' : 'Sign in securely'}
            </Button>
          </Stack>

          <Divider sx={{
          my: 3
        }} />

          <Box sx={{
          p: 2,
          borderRadius: '12px',
          background: 'rgba(99, 102, 241, 0.04)',
          border: '1px solid rgba(99, 102, 241, 0.08)'
        }}>
            <Typography variant="body2" sx={{
            color: '#a5a3b8',
            fontWeight: 700,
            mb: 0.5
          }}>
              Account access
            </Typography>
            <Typography variant="body2" sx={{
            color: '#a5a3b8'
          }}>
              Your credentials are saved for this app. Use the same username and password whenever you return.
            </Typography>
          </Box>
        </Box>

        {/* Feature chips */}
        <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mt: 3
      }}>
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <Box key={feature.label} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: '12px',
            background: 'rgba(22, 21, 35, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
            animation: 'fadeInUp 500ms ease both',
            animationDelay: `${0.3 + index * 0.08}s`,
            transition: 'all 250ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 20px ${feature.color}20`
            }
          }}>
                <Icon sx={{
              fontSize: 18,
              color: feature.color
            }} />
                <Typography sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#a5a3b8'
            }}>
                  {feature.label}
                </Typography>
              </Box>;
        })}
        </Box>
      </Box>
    </Box>;
}