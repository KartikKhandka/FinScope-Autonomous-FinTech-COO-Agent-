import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RevenueChart from '../components/RevenueChart';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { getForecast } from '../api';
export default function CashFlowForecastPage() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['forecast'],
    queryFn: () => getForecast().then(res => res.data)
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
        }}>Loading cash flow forecast...</Typography>
        </Box>
      </Box>;
  }
  return <Box>
      <PageHeader title="Cash Flow Forecast" subtitle="30-day predictive cash flow analysis" icon={<AccountBalanceIcon />} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <GlassCard delay={1}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 2
          }}>
              30-Day Cash Flow Forecast
            </Typography>
            <RevenueChart data={data.forecast_30d} label="Forecast" color="#6366f1" gradientFrom="#6366f1" gradientTo="#10b981" />
          </GlassCard>
        </Grid>

        <Grid item xs={12}>
          <GlassCard delay={2} variant="accent">
            <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2
          }}>
              <Box sx={{
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.25)'
            }}>
                <WarningAmberIcon sx={{
                color: '#fff',
                fontSize: 24
              }} />
              </Box>
              <Box sx={{
              flex: 1
            }}>
                <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1
              }}>
                  <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: '#e8e6f0'
                }}>
                    Risk Assessment
                  </Typography>
                  <StatusBadge status="warning" />
                </Box>
                <Box sx={{
                p: 2,
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.12)',
                animation: 'slideInLeft 500ms ease both',
                animationDelay: '0.2s'
              }}>
                  <Typography sx={{
                  color: '#a5a3b8',
                  lineHeight: 1.7,
                  fontSize: '0.95rem'
                }}>
                    {data.risk_warning}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>;
}