import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Checkbox, CircularProgress, Divider, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography, Grid } from '@mui/material';
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

const features = [
  { icon: TrendingUpIcon, label: 'Revenue Analytics', color: '#6366f1' },
  { icon: ShieldIcon, label: 'Risk Intelligence', color: '#10b981' },
  { icon: SmartToyIcon, label: 'AI COO Assistant', color: '#f59e0b' },
  { icon: AutoGraphIcon, label: 'Cash Flow Forecast', color: '#f472b6' }
];

export default function LoginPage() {
  const [mode, setMode] = useState('login');
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
    setMode(current => (current === 'login' ? 'register' : 'login'));
    setError('');
    setConfirmPassword('');
  };

  return (
    <Grid container sx={{ minHeight: '100vh', backgroundColor: '#0f0e17' }}>
      {/* Left side - Graphical/Brand section */}
      <Grid item xs={12} md={6} sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f0e17 0%, #1a1936 50%, #0f0e17 100%)',
        p: 6,
        justifyContent: 'center',
        borderRight: '1px solid rgba(99, 102, 241, 0.15)'
      }}>
        {/* Floating particles background */}
        <div className="particles-container">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            display: 'grid',
            placeItems: 'center',
            mb: 4,
            boxShadow: '0 16px 40px rgba(99, 102, 241, 0.4)',
            animation: 'float 6s ease-in-out infinite'
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '2.5rem', fontFamily: "'Space Grotesk'" }}>
              F
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#e8e6f0', mb: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
            FinScope<br />
            <span style={{ color: '#6366f1' }}>COO Agent</span>
          </Typography>
          <Typography variant="h6" sx={{ color: '#a5a3b8', mb: 6, fontWeight: 400, lineHeight: 1.6 }}>
            Empower your fintech operations with AI-driven intelligence. Monitor KPIs, predict churn, and analyze risk in real-time.
          </Typography>
          
          <Grid container spacing={2}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={6} key={feature.label}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderRadius: '16px',
                    background: 'rgba(22, 21, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <Box sx={{ p: 1, borderRadius: '10px', background: `${feature.color}20` }}>
                      <Icon sx={{ color: feature.color }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#e8e6f0' }}>
                      {feature.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Grid>

      {/* Right side - Login Form */}
      <Grid item xs={12} md={6} sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 8 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(22, 21, 35, 0.75)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          p: { xs: 4, sm: 5 },
          animation: 'fadeInUp 600ms ease both'
        }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#e8e6f0', fontWeight: 800, fontFamily: "'Space Grotesk'" }}>
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography sx={{ color: '#a5a3b8', fontSize: '1rem' }}>
              {isRegistering ? 'Enter your details to get started.' : 'Sign in to access your dashboard.'}
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Stack spacing={3}>
            <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyDown} autoComplete="username" InputProps={{
              startAdornment: <InputAdornment position="start"><AccountCircleIcon sx={{ color: '#94a3b8' }} /></InputAdornment>
            }} />

            <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete={isRegistering ? 'new-password' : 'current-password'} InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }} />

            {isRegistering && (
              <TextField fullWidth label="Confirm Password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete="new-password" sx={{ animation: 'slideUp 300ms ease both' }} InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8' }} /></InputAdornment>
              }} />
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} sx={{ color: 'rgba(99, 102, 241, 0.4)', '&.Mui-checked': { color: '#6366f1' } }} />} label={<Typography sx={{ fontSize: '0.9rem', color: '#a5a3b8' }}>Remember me</Typography>} />
              {!isRegistering && (
                <Button size="small" sx={{ color: '#6366f1', textTransform: 'none', fontWeight: 600 }}>Forgot password?</Button>
              )}
            </Stack>

            <Button fullWidth size="large" variant="contained" onClick={handleSubmit} disabled={loading || !username || !password || (isRegistering && !confirmPassword)} sx={{
              py: 1.8,
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 12px 28px rgba(99, 102, 241, 0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #4338ca)', transform: 'translateY(-2px)' }
            }}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (isRegistering ? 'Sign Up' : 'Sign In')}
            </Button>
          </Stack>

          <Divider sx={{ my: 4, '&::before, &::after': { borderColor: 'rgba(99, 102, 241, 0.15)' } }}>
            <Typography sx={{ color: '#a5a3b8', fontSize: '0.85rem' }}>OR</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#a5a3b8', fontSize: '0.95rem' }}>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Button onClick={switchMode} sx={{ color: '#6366f1', fontWeight: 700, p: 0, '&:hover': { background: 'none', textDecoration: 'underline' } }}>
                {isRegistering ? 'Sign In' : 'Create one'}
              </Button>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}