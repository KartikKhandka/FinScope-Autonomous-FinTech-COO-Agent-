import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AnimatedCounter from './AnimatedCounter';
const kpiAccentColors = [{
  gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
  shadow: 'rgba(99, 102, 241, 0.25)'
}, {
  gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  shadow: 'rgba(16, 185, 129, 0.25)'
}, {
  gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  shadow: 'rgba(245, 158, 11, 0.25)'
}, {
  gradient: 'linear-gradient(135deg, #f472b6, #fda4af)',
  shadow: 'rgba(244, 114, 182, 0.25)'
}, {
  gradient: 'linear-gradient(135deg, #6366f1, #10b981)',
  shadow: 'rgba(99, 102, 241, 0.2)'
}, {
  gradient: 'linear-gradient(135deg, #0d9488, #34d399)',
  shadow: 'rgba(13, 148, 136, 0.25)'
}];
export default function KPIGrid({
  items
}) {
  return <Box sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      lg: `repeat(${Math.min(items.length, 3)}, 1fr)`
    },
    gap: 2.5
  }}>
      {items.map((item, index) => {
      const accent = kpiAccentColors[index % kpiAccentColors.length];
      const isUp = item.trend === 'up';
      return <Box key={item.label} sx={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(99, 102, 241, 0.12)',
        boxShadow: '0 8px 24px rgba(30, 27, 75, 0.06)',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1) both`,
        animationDelay: `${index * 0.08}s`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 48px rgba(30, 27, 75, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.1)`
        }
      }}>
            {/* Accent bar */}
            <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent.gradient,
          borderRadius: '16px 16px 0 0'
        }} />

            {/* Background glow */}
            <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: accent.gradient,
          opacity: 0.06,
          filter: 'blur(20px)'
        }} />

            <Typography variant="subtitle2" sx={{
          color: '#a5a3b8',
          fontWeight: 600,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: 1.5
        }}>
              {item.label}
            </Typography>

            <AnimatedCounter value={item.value} variant="h4" sx={{
          color: '#e8e6f0',
          mb: 1.5
        }} />

            <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          borderRadius: '8px',
          backgroundColor: isUp ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 114, 182, 0.08)',
          width: 'fit-content'
        }}>
              {isUp ? <TrendingUpIcon sx={{
            fontSize: 16,
            color: '#10b981'
          }} /> : <TrendingDownIcon sx={{
            fontSize: 16,
            color: '#f472b6'
          }} />}
              <Typography sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: isUp ? '#059669' : '#e11d48'
          }}>
                {item.change}%
              </Typography>
            </Box>
          </Box>;
    })}
    </Box>;
}