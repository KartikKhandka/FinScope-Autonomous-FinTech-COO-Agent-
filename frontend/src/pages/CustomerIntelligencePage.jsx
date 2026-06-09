import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InsightsIcon from '@mui/icons-material/Insights';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AnimatedCounter from '../components/AnimatedCounter';
import { getChurnAnalysis } from '../api';
export default function CustomerIntelligencePage() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['churn-analysis'],
    queryFn: () => getChurnAnalysis().then(res => res.data)
  });
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
        }}>Loading customer intelligence...</Typography>
        </Box>
      </Box>;
  }
  const churnPercent = data.churn_probability * 100;
  const churnStatus = churnPercent > 25 ? 'critical' : churnPercent > 12 ? 'warning' : 'active';
  return <Box>
      <PageHeader title="Customer Intelligence" subtitle="Monitor churn risk and customer behavior patterns" icon={<PeopleIcon />} />

      <Grid container spacing={3}>
        {/* Churn probability gauge */}
        <Grid item xs={12} md={5}>
          <GlassCard delay={1} sx={{
          textAlign: 'center'
        }}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 3
          }}>
              Churn Probability
            </Typography>

            {/* Circular gauge */}
            <Box sx={{
            position: 'relative',
            display: 'inline-flex',
            mb: 3
          }}>
              <Box sx={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `conic-gradient(
                    ${churnStatus === 'critical' ? '#f472b6' : churnStatus === 'warning' ? '#f59e0b' : '#10b981'} ${churnPercent * 3.6}deg,
                    rgba(99, 102, 241, 0.06) 0deg
                  )`,
              display: 'grid',
              placeItems: 'center',
              animation: 'scaleIn 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
            }}>
                <Box sx={{
                width: 148,
                height: 148,
                borderRadius: '50%',
                background: 'rgba(15, 14, 25, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'grid',
                placeItems: 'center'
              }}>
                  <Box sx={{
                  textAlign: 'center'
                }}>
                    <AnimatedCounter value={churnPercent} suffix="%" decimals={1} variant="h4" sx={{
                    color: '#e8e6f0'
                  }} />
                    <Typography sx={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                    mt: 0.5
                  }}>
                      RISK LEVEL
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: '10px',
            background: churnStatus === 'active' ? 'rgba(16, 185, 129, 0.08)' : churnStatus === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(244, 114, 182, 0.08)'
          }}>
              <StatusBadge status={churnStatus} />
              <Typography sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#a5a3b8',
              ml: 0.5
            }}>
                {churnStatus === 'active' ? 'Low Risk' : churnStatus === 'warning' ? 'Moderate Risk' : 'High Risk'}
              </Typography>
            </Box>
          </GlassCard>
        </Grid>

        {/* Segments & Drivers */}
        <Grid item xs={12} md={7}>
          <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          height: '100%'
        }}>
            {/* High-risk segments */}
            <GlassCard delay={2}>
              <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2.5
            }}>
                <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f472b6, #fda4af)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(244, 114, 182, 0.25)'
              }}>
                  <WarningAmberIcon sx={{
                  fontSize: 20,
                  color: '#fff'
                }} />
                </Box>
                <Typography variant="h6" sx={{
                fontWeight: 700,
                color: '#e8e6f0'
              }}>
                  High-Risk Segments
                </Typography>
              </Box>
              <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}>
                {data.high_risk_segments.map((segment, idx) => <Box key={segment} sx={{
                px: 2,
                py: 1,
                borderRadius: '10px',
                background: 'rgba(244, 114, 182, 0.06)',
                border: '1px solid rgba(244, 114, 182, 0.15)',
                animation: 'scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
                animationDelay: `${idx * 0.06}s`,
                transition: 'all 250ms ease',
                '&:hover': {
                  background: 'rgba(244, 114, 182, 0.1)',
                  transform: 'scale(1.03)'
                }
              }}>
                    <Typography sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#e11d48'
                }}>
                      {segment}
                    </Typography>
                  </Box>)}
              </Box>
            </GlassCard>

            {/* Primary drivers */}
            <GlassCard delay={3} variant="accent">
              <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2.5
            }}>
                <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
              }}>
                  <InsightsIcon sx={{
                  fontSize: 20,
                  color: '#fff'
                }} />
                </Box>
                <Typography variant="h6" sx={{
                fontWeight: 700,
                color: '#e8e6f0'
              }}>
                  Primary Drivers
                </Typography>
              </Box>
              <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
                {data.drivers.map((driver, idx) => <Box key={driver} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: '12px',
                background: 'rgba(22, 21, 35, 0.6)',
                border: '1px solid rgba(99, 102, 241, 0.12)',
                animation: 'slideInRight 400ms ease both',
                animationDelay: `${idx * 0.08}s`,
                transition: 'all 250ms ease',
                '&:hover': {
                  background: 'rgba(30, 28, 48, 0.8)',
                  transform: 'translateX(4px)'
                }
              }}>
                    <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #10b981)',
                  minWidth: 8
                }} />
                    <Typography sx={{
                  color: '#a5a3b8',
                  fontWeight: 500
                }}>
                      {driver}
                    </Typography>
                  </Box>)}
              </Box>
            </GlassCard>
          </Box>
        </Grid>
      </Grid>
    </Box>;
}