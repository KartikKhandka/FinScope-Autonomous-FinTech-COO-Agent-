import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AnimatedCounter from '../components/AnimatedCounter';
import { getFraudAnalysis } from '../api';
export default function RiskIntelligencePage() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['fraud-analysis'],
    queryFn: () => getFraudAnalysis().then(res => res.data)
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
        }}>Loading risk intelligence...</Typography>
        </Box>
      </Box>;
  }
  const score = typeof data.fraud_score === 'number' ? data.fraud_score : parseFloat(data.fraud_score) || 0;
  const scorePercent = Math.min(score * 100, 100);
  const riskStatus = scorePercent > 60 ? 'critical' : scorePercent > 30 ? 'warning' : 'active';
  const riskColors = {
    active: {
      bg: 'rgba(16, 185, 129, 0.06)',
      border: 'rgba(16, 185, 129, 0.15)',
      text: '#059669'
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.06)',
      border: 'rgba(245, 158, 11, 0.15)',
      text: '#d97706'
    },
    critical: {
      bg: 'rgba(244, 114, 182, 0.06)',
      border: 'rgba(244, 114, 182, 0.15)',
      text: '#e11d48'
    }
  };
  return <Box>
      <PageHeader title="Risk Intelligence" subtitle="Fraud detection and suspicious activity monitoring" icon={<ShieldIcon />} />

      <Grid container spacing={3}>
        {/* Fraud score gauge */}
        <Grid item xs={12} md={5}>
          <GlassCard delay={1} sx={{
          textAlign: 'center'
        }}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 3
          }}>
              Fraud Risk Score
            </Typography>

            {/* Gauge */}
            <Box sx={{
            position: 'relative',
            display: 'inline-flex',
            mb: 3
          }}>
              <Box sx={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `conic-gradient(
                    ${riskStatus === 'critical' ? '#f472b6' : riskStatus === 'warning' ? '#f59e0b' : '#10b981'} ${scorePercent * 3.6}deg,
                    rgba(99, 102, 241, 0.06) 0deg
                  )`,
              display: 'grid',
              placeItems: 'center',
              animation: 'scaleIn 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
            }}>
                <Box sx={{
                width: 164,
                height: 164,
                borderRadius: '50%',
                background: 'rgba(15, 14, 25, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'grid',
                placeItems: 'center'
              }}>
                  <Box sx={{
                  textAlign: 'center'
                }}>
                    <AnimatedCounter value={scorePercent} suffix="%" decimals={1} variant="h3" sx={{
                    color: '#e8e6f0'
                  }} />
                    <Typography sx={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                    mt: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                      Fraud Score
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Risk level badge */}
            <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2.5,
            py: 1,
            borderRadius: '10px',
            background: riskColors[riskStatus].bg,
            border: `1px solid ${riskColors[riskStatus].border}`
          }}>
              <StatusBadge status={riskStatus} />
              <Typography sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: riskColors[riskStatus].text,
              ml: 0.5
            }}>
                {riskStatus === 'active' ? 'Low Risk' : riskStatus === 'warning' ? 'Moderate Risk' : 'High Risk'}
              </Typography>
            </Box>
          </GlassCard>
        </Grid>

        {/* Suspicious segments */}
        <Grid item xs={12} md={7}>
          <GlassCard delay={2}>
            <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3
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
                <ReportProblemIcon sx={{
                fontSize: 20,
                color: '#fff'
              }} />
              </Box>
              <Typography variant="h6" sx={{
              fontWeight: 700,
              color: '#e8e6f0'
            }}>
                Suspicious Segments
              </Typography>
            </Box>

            <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
              {data.suspicious_segments.map((segment, idx) => <Box key={segment} sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: '12px',
              background: 'rgba(244, 114, 182, 0.04)',
              border: '1px solid rgba(244, 114, 182, 0.1)',
              animation: 'slideInRight 400ms ease both',
              animationDelay: `${idx * 0.08}s`,
              transition: 'all 250ms ease',
              '&:hover': {
                background: 'rgba(244, 114, 182, 0.08)',
                transform: 'translateX(4px)',
                borderColor: 'rgba(244, 114, 182, 0.2)'
              }
            }}>
                  <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: riskStatus === 'critical' ? '#f472b6' : riskStatus === 'warning' ? '#f59e0b' : '#10b981',
                minWidth: 10,
                animation: 'pulse 2s ease-in-out infinite'
              }} />
                  <Typography sx={{
                color: '#a5a3b8',
                fontWeight: 500,
                fontSize: '0.95rem'
              }}>
                    {segment}
                  </Typography>
                </Box>)}
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>;
}