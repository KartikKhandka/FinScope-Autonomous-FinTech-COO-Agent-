import { Box } from '@mui/material';
export default function GlassCard({
  children,
  variant = 'default',
  hover = true,
  delay = 0,
  animate = true,
  sx = {},
  onClick,
  className = ''
}) {
  const variantStyles = {
    default: {
      background: 'rgba(22, 21, 35, 0.65)',
      border: '1px solid rgba(99, 102, 241, 0.12)'
    },
    elevated: {
      background: 'rgba(30, 28, 48, 0.8)',
      border: '1px solid rgba(99, 102, 241, 0.15)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)'
    },
    accent: {
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.08))',
      border: '1px solid rgba(99, 102, 241, 0.2)'
    }
  };
  return <Box className={className} onClick={onClick} sx={{
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    padding: '24px',
    transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    ...(animate ? {
      animation: `fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1) both`,
      animationDelay: `${delay * 0.08}s`
    } : {}),
    ...(hover ? {
      '&:hover': {
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
        borderColor: 'rgba(99, 102, 241, 0.25)',
        transform: 'translateY(-3px)'
      }
    } : {}),
    ...variantStyles[variant],
    ...sx
  }}>
      {children}
    </Box>;
}