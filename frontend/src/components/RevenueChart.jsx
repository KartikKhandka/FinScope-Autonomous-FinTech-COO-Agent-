import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Box, Typography } from '@mui/material';
const CustomTooltip = ({
  active,
  payload,
  label: tooltipLabel
}) => {
  if (!active || !payload?.length) return null;
  return <Box sx={{
    background: 'rgba(15, 14, 25, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '12px',
    border: '1px solid rgba(22, 21, 35, 0.6)',
    boxShadow: '0 8px 32px rgba(30, 27, 75, 0.12)',
    px: 2,
    py: 1.5
  }}>
      <Typography sx={{
      fontSize: '0.75rem',
      color: '#94a3b8',
      fontWeight: 600,
      mb: 0.5
    }}>
        {tooltipLabel}
      </Typography>
      <Typography sx={{
      fontSize: '1rem',
      fontWeight: 800,
      color: '#e8e6f0'
    }}>
        {payload[0].value?.toLocaleString()}
      </Typography>
    </Box>;
};
export default function RevenueChart({
  data,
  label,
  color = '#6366f1',
  gradientFrom,
  gradientTo
}) {
  const gradientId = `gradient-${label.replace(/\s+/g, '-')}`;
  const fromColor = gradientFrom || color;
  const toColor = gradientTo || color;
  return <Box sx={{
    animation: 'fadeInUp 700ms cubic-bezier(0.4, 0, 0.2, 1) both',
    animationDelay: '0.15s'
  }}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{
        top: 20,
        right: 20,
        left: 0,
        bottom: 0
      }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fromColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={toColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.06)" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{
          fill: '#94a3b8',
          fontSize: 12,
          fontWeight: 500
        }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{
          fill: '#94a3b8',
          fontSize: 12,
          fontWeight: 500
        }} dx={-8} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} name={label} dot={false} activeDot={{
          r: 6,
          fill: '#fff',
          stroke: color,
          strokeWidth: 2.5,
          style: {
            filter: `drop-shadow(0 2px 8px ${color}40)`
          }
        }} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>;
}