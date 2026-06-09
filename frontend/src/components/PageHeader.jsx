import { Box, Typography } from '@mui/material';
export default function PageHeader({
  title,
  subtitle,
  icon
}) {
  return <Box sx={{
    mb: 4,
    animation: 'fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1) both'
  }}>
      <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 1
    }}>
        {icon && <Box sx={{
        width: 48,
        height: 48,
        borderRadius: '14px',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
        animation: 'scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        '& svg': {
          fontSize: 26
        }
      }}>
            {icon}
          </Box>}
        <Box>
          <Typography variant="h4" sx={{
          fontWeight: 800,
          color: '#e8e6f0',
          fontSize: {
            xs: '1.5rem',
            md: '1.85rem'
          },
          lineHeight: 1.2
        }}>
            {title}
          </Typography>
          {subtitle && <Typography sx={{
          color: '#a5a3b8',
          mt: 0.5,
          fontSize: '0.95rem',
          animation: 'fadeIn 600ms ease both',
          animationDelay: '0.15s'
        }}>
              {subtitle}
            </Typography>}
        </Box>
      </Box>
      <Box sx={{
      mt: 1.5,
      height: 3,
      width: 64,
      borderRadius: 8,
      background: 'linear-gradient(90deg, #6366f1, #10b981)',
      animation: 'fadeInUp 600ms ease both',
      animationDelay: '0.2s',
      ml: icon ? '64px' : 0
    }} />
    </Box>;
}