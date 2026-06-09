import { Box } from '@mui/material';
const statusColors = {
  active: {
    bg: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  warning: {
    bg: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  critical: {
    bg: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.4)'
  },
  neutral: {
    bg: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.3)'
  }
};
export default function StatusBadge({
  status,
  size = 10
}) {
  const colors = statusColors[status];
  return <Box sx={{
    position: 'relative',
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
      <Box sx={{
      position: 'absolute',
      width: size * 2,
      height: size * 2,
      borderRadius: '50%',
      backgroundColor: colors.glow,
      animation: 'pulse 2s ease-in-out infinite'
    }} />
      <Box sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: colors.bg,
      position: 'relative',
      zIndex: 1
    }} />
    </Box>;
}