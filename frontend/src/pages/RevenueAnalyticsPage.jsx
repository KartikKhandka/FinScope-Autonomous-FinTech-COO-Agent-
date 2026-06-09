import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import RevenueChart from '../components/RevenueChart';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import { getRevenueAnalysis } from '../api';
export default function RevenueAnalyticsPage() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['revenue-analysis'],
    queryFn: () => getRevenueAnalysis().then(res => res.data)
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
        }}>Loading revenue analytics...</Typography>
        </Box>
      </Box>;
  }
  return <Box>
      <PageHeader title="Revenue Analytics" subtitle="Track revenue and profit performance over time" icon={<TrendingUpIcon />} />

      <Grid container spacing={3} sx={{
      mb: 4
    }}>
        <Grid item xs={12} lg={6}>
          <GlassCard delay={1}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 2
          }}>
              Revenue Trend
            </Typography>
            <RevenueChart data={data.revenue_trend} label="Revenue" color="#6366f1" gradientFrom="#6366f1" gradientTo="#818cf8" />
          </GlassCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <GlassCard delay={2}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 2
          }}>
              Profit Trend
            </Typography>
            <RevenueChart data={data.profit_trend} label="Profit" color="#10b981" gradientFrom="#10b981" gradientTo="#34d399" />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard delay={3} variant="accent">
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
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
        }}>
            <LightbulbIcon sx={{
            fontSize: 20,
            color: '#fff'
          }} />
          </Box>
          <Typography variant="h6" sx={{
          fontWeight: 700,
          color: '#e8e6f0'
        }}>
            Key Insights
          </Typography>
        </Box>
        <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}>
          {data.insights.map((insight, idx) => <Box key={insight} sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: '12px',
          background: 'rgba(22, 21, 35, 0.6)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          animation: 'slideInLeft 400ms ease both',
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
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            mt: 0.8,
            minWidth: 8
          }} />
              <Typography sx={{
            color: '#a5a3b8',
            lineHeight: 1.7
          }}>
                {insight}
              </Typography>
            </Box>)}
        </Box>
      </GlassCard>
    </Box>;
}