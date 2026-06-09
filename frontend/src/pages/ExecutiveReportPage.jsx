import { useState } from 'react';
import { Box, Button, TextField, Typography, Grid } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import { generateReport } from '../api';
export default function ExecutiveReportPage() {
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [reportUrl, setReportUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await generateReport({
        period_start: startDate,
        period_end: endDate,
        include_forecast: true
      });
      setReportUrl(response.data.report_url);
    } finally {
      setLoading(false);
    }
  };
  return <Box>
      <PageHeader title="Executive Report" subtitle="Generate comprehensive operational reports" icon={<AssessmentIcon />} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <GlassCard delay={1}>
            <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 3
          }}>
              Report Configuration
            </Typography>

            <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            mb: 3
          }}>
              <Box sx={{
              flex: 1,
              minWidth: 200
            }}>
                <Typography sx={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#a5a3b8',
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                  Start Date
                </Typography>
                <TextField fullWidth type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputProps={{
                startAdornment: <Box sx={{
                  mr: 1,
                  display: 'flex'
                }}>
                        <CalendarTodayIcon sx={{
                    fontSize: 18,
                    color: '#94a3b8'
                  }} />
                      </Box>
              }} />
              </Box>
              <Box sx={{
              flex: 1,
              minWidth: 200
            }}>
                <Typography sx={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#a5a3b8',
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                  End Date
                </Typography>
                <TextField fullWidth type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputProps={{
                startAdornment: <Box sx={{
                  mr: 1,
                  display: 'flex'
                }}>
                        <CalendarTodayIcon sx={{
                    fontSize: 18,
                    color: '#94a3b8'
                  }} />
                      </Box>
              }} />
              </Box>
            </Box>

            <Button fullWidth variant="contained" size="large" onClick={handleGenerate} disabled={loading} startIcon={<AssessmentIcon />} sx={{
            py: 1.6,
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite'
            },
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)'
            }
          }}>
              {loading ? 'Generating...' : 'Generate Executive Report'}
            </Button>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={5}>
          {reportUrl ? <GlassCard delay={0} variant="accent" sx={{
          animation: 'scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
        }}>
              <Box sx={{
            textAlign: 'center',
            py: 2
          }}>
                <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'grid',
              placeItems: 'center',
              mx: 'auto',
              mb: 2,
              animation: 'checkPop 600ms ease both'
            }}>
                  <CheckCircleIcon sx={{
                fontSize: 36,
                color: '#10b981'
              }} />
                </Box>
                <Typography variant="h6" sx={{
              fontWeight: 700,
              color: '#e8e6f0',
              mb: 1
            }}>
                  Report Ready!
                </Typography>
                <Typography sx={{
              color: '#a5a3b8',
              mb: 3,
              fontSize: '0.9rem'
            }}>
                  Your executive report has been generated successfully.
                </Typography>
                <Button variant="contained" startIcon={<DownloadIcon />} component="a" href={reportUrl} target="_blank" rel="noreferrer" sx={{
              py: 1.4,
              px: 4,
              borderRadius: '12px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981, #0d9488)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0d9488, #0f766e)'
              }
            }}>
                  Download PDF
                </Button>
              </Box>
            </GlassCard> : <GlassCard delay={2} hover={false}>
              <Box sx={{
            textAlign: 'center',
            py: 4
          }}>
                <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(16, 185, 129, 0.08))',
              display: 'grid',
              placeItems: 'center',
              mx: 'auto',
              mb: 2
            }}>
                  <AssessmentIcon sx={{
                fontSize: 32,
                color: '#94a3b8'
              }} />
                </Box>
                <Typography sx={{
              fontWeight: 600,
              color: '#a5a3b8',
              mb: 0.5
            }}>
                  No report generated yet
                </Typography>
                <Typography sx={{
              color: '#94a3b8',
              fontSize: '0.85rem'
            }}>
                  Configure the date range and click generate.
                </Typography>
              </Box>
            </GlassCard>}
        </Grid>
      </Grid>
    </Box>;
}