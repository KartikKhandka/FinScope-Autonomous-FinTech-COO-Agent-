import { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';
export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1200,
  sx = {},
  variant = 'h4'
}) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
    const animate = timestamp => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);
  const formatted = display.toFixed(decimals);

  // Add thousands separators
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const displayValue = parts.join('.');
  return <Typography variant={variant} sx={{
    fontWeight: 800,
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    ...sx
  }}>
      {prefix}{displayValue}{suffix}
    </Typography>;
}