import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Alert, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import KPIGrid from '../components/KPIGrid';
import RevenueChart from '../components/RevenueChart';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { getDashboard } from '../api';
export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then(res => res.data).catch(err => {
      throw err;
    })
  });
  if (error) {
    return <Box sx={{
      animation: 'fadeInUp 600ms ease both'
    }}>
        <Alert severity="error">
          Failed to load dashboard: {error?.response?.data?.detail || error?.message || 'Unknown error'}
        </Alert>
      </Box>;
  }
  if (isLoading || !data) {
    return <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh'
    }}>
        <Box sx={{
        textAlign: 'center',
        animation: 'fadeIn 400ms ease both'
      }}>
          <CircularProgress size={48} sx={{
          mb: 2
        }} />
          <Typography sx={{
          color: '#a5a3b8',
          fontWeight: 500
        }}>Loading dashboard...</Typography>
        </Box>
      </Box>;
  }
  return <Box>
      <PageHeader title="Executive Dashboard" subtitle="Real-time operational intelligence at a glance" icon={<DashboardIcon />} />

      {/* KPIs */}
      <Box sx={{
      mb: 4
    }}>
        <KPIGrid items={data.kpis} />
      </Box>

      {/* Charts */}
      <Grid container spacing={3} sx={{
      mb: 4
    }}>
        <Grid item xs={12} md={6}>
          <GlassCard delay={4}>
            <Typography variant="h6" sx={{
            mb: 2,
            fontWeight: 700,
            color: '#e8e6f0'
          }}>
              Revenue Trend
            </Typography>
            <RevenueChart data={data.revenue} label="Revenue" color="#6366f1" gradientFrom="#6366f1" gradientTo="#818cf8" />
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard delay={5}>
            <Typography variant="h6" sx={{
            mb: 2,
            fontWeight: 700,
            color: '#e8e6f0'
          }}>
              Profit Trend
            </Typography>
            <RevenueChart data={data.profit} label="Profit" color="#10b981" gradientFrom="#10b981" gradientTo="#34d399" />
          </GlassCard>
        </Grid>
      </Grid>

      {/* Alerts & Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <GlassCard delay={6} variant="accent">
            <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3
          }}>
              <WarningAmberIcon sx={{
              color: '#f59e0b'
            }} />
              <Typography variant="h6" sx={{
              fontWeight: 700,
              color: '#e8e6f0'
            }}>
                Operational Alerts
              </Typography>
            </Box>

            {/* Churn Rate */}
            <Box sx={{
            mb: 3
          }}>
              <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1
            }}>
                <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                  <StatusBadge status={data.churn_rate > 0.15 ? 'critical' : data.churn_rate > 0.08 ? 'warning' : 'active'} />
                  <Typography sx={{
                  fontWeight: 600,
                  color: '#e8e6f0'
                }}>Churn Rate</Typography>
                </Box>
                <Typography sx={{
                fontWeight: 800,
                color: '#e8e6f0',
                fontFamily: "'Space Grotesk'"
              }}>
                  {(data.churn_rate * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box className="progress-bar-track">
                <Box className="progress-bar-fill" sx={{
                width: `${Math.min(data.churn_rate * 100 * 3, 100)}%`
              }} />
              </Box>
            </Box>

            {/* Default Rate */}
            <Box sx={{
            mb: 3
          }}>
              <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1
            }}>
                <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                  <StatusBadge status={data.default_rate > 0.1 ? 'critical' : data.default_rate > 0.05 ? 'warning' : 'active'} />
                  <Typography sx={{
                  fontWeight: 600,
                  color: '#e8e6f0'
                }}>Default Rate</Typography>
                </Box>
                <Typography sx={{
                fontWeight: 800,
                color: '#e8e6f0',
                fontFamily: "'Space Grotesk'"
              }}>
                  {(data.default_rate * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box className="progress-bar-track">
                <Box className="progress-bar-fill" sx={{
                width: `${Math.min(data.default_rate * 100 * 3, 100)}%`
              }} />
              </Box>
            </Box>

            {/* Fraud Alerts */}
            <Box>
              <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
                <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                  <StatusBadge status={data.fraud_alerts > 10 ? 'critical' : data.fraud_alerts > 3 ? 'warning' : 'active'} />
                  <Typography sx={{
                  fontWeight: 600,
                  color: '#e8e6f0'
                }}>Fraud Alerts</Typography>
                </Box>
                <Typography sx={{
                fontWeight: 800,
                color: '#e8e6f0',
                fontFamily: "'Space Grotesk'",
                fontSize: '1.1rem'
              }}>
                  {data.fraud_alerts}
                </Typography>
              </Box>
            </Box>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <GlassCard delay={7}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 3
          }}>
              Quick Actions
            </Typography>
            <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
              <Button variant="contained" startIcon={<SmartToyIcon />} onClick={() => navigate('/assistant')} sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)'
              }
            }}>
                Ask AI COO
              </Button>
              <Button variant="contained" startIcon={<AssessmentIcon />} onClick={() => navigate('/report')} sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              background: 'linear-gradient(135deg, #10b981, #0d9488)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0d9488, #0f766e)'
              }
            }}>
                Generate Report
              </Button>
              <Button variant="outlined" onClick={() => navigate('/data')} sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderColor: 'rgba(99, 102, 241, 0.2)',
              color: '#6366f1',
              '&:hover': {
                borderColor: '#6366f1',
                background: 'rgba(99, 102, 241, 0.04)'
              }
            }}>
                Upload Dataset
              </Button>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>;
}