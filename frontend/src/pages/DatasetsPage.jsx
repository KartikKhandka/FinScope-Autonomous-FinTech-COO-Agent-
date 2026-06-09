import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import { getDatasets, uploadDataset } from '../api';
export default function DatasetsPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => getDatasets().then(res => res.data)
  });
  const uploadMutation = useMutation({
    mutationFn: file => uploadDataset(file, setUploadProgress).then(res => res.data),
    onMutate: () => setUploadProgress(0),
    onSuccess: () => {
      setSelectedFile(null);
      queryClient.invalidateQueries({
        queryKey: ['datasets']
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      });
      queryClient.invalidateQueries({
        queryKey: ['revenue-analysis']
      });
      queryClient.invalidateQueries({
        queryKey: ['forecast']
      });
      queryClient.invalidateQueries({
        queryKey: ['fraud-analysis']
      });
      queryClient.invalidateQueries({
        queryKey: ['churn-analysis']
      });
    }
  });
  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  }, []);
  const latestDataset = data?.[0];
  return <Box>
      <PageHeader title="Data Workspace" subtitle="Upload and manage your company datasets" icon={<StorageIcon />} />

      {/* Upload area */}
      <GlassCard delay={1} sx={{
      mb: 3
    }}>
        <Typography variant="h6" sx={{
        fontWeight: 700,
        color: '#e8e6f0',
        mb: 2.5
      }}>
          Upload Company Data
        </Typography>

        <Box className={`upload-zone ${dragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={e => {
        e.preventDefault();
        setDragOver(true);
      }} onDragLeave={() => setDragOver(false)} onClick={() => document.getElementById('file-input')?.click()} sx={{
        mb: 2.5
      }}>
          <Box sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))',
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 2
        }}>
            <CloudUploadIcon sx={{
            fontSize: 28,
            color: '#6366f1'
          }} />
          </Box>
          <Typography sx={{
          fontWeight: 700,
          color: '#e8e6f0',
          mb: 0.5
        }}>
            Drop files here or click to browse
          </Typography>
          <Typography sx={{
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
            CSV, JSON, TXT, PDF, DOCX — Max 2.5GB
          </Typography>
          <input id="file-input" hidden type="file" accept=".csv,.json,.txt,.md,.html,.pdf,.docx" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
        </Box>

        {selectedFile && <Box sx={{
        p: 2,
        borderRadius: '12px',
        background: 'rgba(99, 102, 241, 0.04)',
        border: '1px solid rgba(99, 102, 241, 0.1)',
        animation: 'fadeInUp 300ms ease both',
        mb: 2
      }}>
            <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
              <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
                <InsertDriveFileIcon sx={{
              color: '#6366f1'
            }} />
                <Box>
                  <Typography sx={{
                fontWeight: 700,
                color: '#e8e6f0',
                fontSize: '0.9rem'
              }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography sx={{
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                    {selectedFile.size > 1024 * 1024 * 1024 ? `${(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : selectedFile.size > 1024 * 1024 ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : `${(selectedFile.size / 1024).toFixed(1)} KB`}
                  </Typography>
                </Box>
              </Box>
              <Button variant="contained" startIcon={uploadMutation.isPending ? undefined : <CloudUploadIcon />} disabled={uploadMutation.isPending} onClick={() => uploadMutation.mutate(selectedFile)} size="small" sx={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)'
            }
          }}>
                {uploadMutation.isPending ? `${uploadProgress}%` : 'Upload'}
              </Button>
            </Box>
            {uploadMutation.isPending && <Box sx={{
          width: '100%',
          mt: 2
        }}>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1, #10b981)'
            }
          }} />
              </Box>}
          </Box>}

        {uploadMutation.isError && <Alert severity="error" sx={{
        animation: 'fadeInUp 300ms ease both'
      }}>
            Upload failed: {uploadMutation.error?.response?.data?.detail || uploadMutation.error?.message}
          </Alert>}
        {uploadMutation.isSuccess && <Alert severity="success" icon={<CheckCircleIcon sx={{
        animation: 'checkPop 500ms ease both'
      }} />} sx={{
        animation: 'fadeInUp 300ms ease both'
      }}>
            Dataset uploaded successfully. All analytics modules now use your data.
          </Alert>}
      </GlassCard>

      {/* Loading */}
      {error && <Alert severity="error" sx={{
      mb: 2
    }}>
          Failed to load datasets: {error?.response?.data?.detail || error?.message}
        </Alert>}

      {isLoading ? <Box sx={{
      textAlign: 'center',
      py: 6
    }}>
          <CircularProgress size={40} />
        </Box> : latestDataset ? <GlassCard delay={3}>
          <Stack spacing={3}>
            <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}>
              <Box>
                <Typography variant="h6" sx={{
              fontWeight: 700,
              color: '#e8e6f0'
            }}>
                  {latestDataset.filename}
                </Typography>
                <Typography sx={{
              color: '#94a3b8',
              fontSize: '0.85rem'
            }}>
                  Uploaded {new Date(latestDataset.uploaded_at).toLocaleString()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${latestDataset.row_count} rows`} sx={{
              background: 'rgba(99, 102, 241, 0.08)',
              color: '#6366f1',
              fontWeight: 700,
              border: '1px solid rgba(99, 102, 241, 0.15)'
            }} />
                <Chip label={`${latestDataset.word_count} words`} sx={{
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#0d9488',
              fontWeight: 700,
              border: '1px solid rgba(16, 185, 129, 0.15)'
            }} />
              </Stack>
            </Box>

            {/* Summary */}
            <Box>
              <Typography variant="subtitle1" sx={{
            fontWeight: 800,
            color: '#e8e6f0',
            mb: 1.5
          }}>
                Extracted Summary
              </Typography>
              <Stack spacing={1}>
                {latestDataset.summary.map((item, idx) => <Box key={item} sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              p: 1.5,
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.03)',
              border: '1px solid rgba(99, 102, 241, 0.06)',
              animation: 'slideInLeft 400ms ease both',
              animationDelay: `${idx * 0.06}s`
            }}>
                    <Box sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #10b981)',
                mt: 1,
                minWidth: 6
              }} />
                    <Typography sx={{
                color: '#a5a3b8',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}>
                      {item}
                    </Typography>
                  </Box>)}
              </Stack>
            </Box>

            {/* Columns */}
            {latestDataset.columns.length > 0 && <Box>
                <Typography variant="subtitle1" sx={{
            fontWeight: 800,
            color: '#e8e6f0',
            mb: 1.5
          }}>
                  Detected Columns
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {latestDataset.columns.map((column, idx) => <Chip key={column} label={column} variant="outlined" sx={{
              animation: 'scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
              animationDelay: `${idx * 0.04}s`,
              borderColor: 'rgba(99, 102, 241, 0.2)',
              color: '#a5a3b8',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.06)'
              }
            }} />)}
                </Stack>
              </Box>}
          </Stack>
        </GlassCard> : <GlassCard delay={2}>
          <Box sx={{
        textAlign: 'center',
        py: 4
      }}>
            <StorageIcon sx={{
          fontSize: 48,
          color: '#94a3b8',
          mb: 2,
          opacity: 0.5
        }} />
            <Typography sx={{
          color: '#a5a3b8',
          fontWeight: 500
        }}>
              No uploaded dataset yet. Upload a CSV, JSON, text, PDF, or Word document to power the analytics.
            </Typography>
          </Box>
        </GlassCard>}
    </Box>;
}