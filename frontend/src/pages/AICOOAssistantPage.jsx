import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Typography, InputAdornment } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import { askCOOAgent } from '../api';
export default function AICOOAssistantPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);
  const handleSubmit = async () => {
    if (!question.trim()) return;
    const userMsg = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, {
      role: 'user',
      text: userMsg
    }]);
    setLoading(true);
    try {
      const response = await askCOOAgent({
        question: userMsg
      });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: response.data.answer
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)'
  }}>
      <PageHeader title="AI COO Assistant" subtitle="Ask strategic questions about your operations" icon={<SmartToyIcon />} />

      {/* Chat area */}
      <GlassCard delay={1} hover={false} sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      p: 0
    }}>
        {/* Messages */}
        <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
          {messages.length === 0 && !loading && <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          animation: 'fadeIn 600ms ease both'
        }}>
              <Box sx={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))',
            display: 'grid',
            placeItems: 'center',
            mb: 3,
            animation: 'float 6s ease-in-out infinite'
          }}>
                <SmartToyIcon sx={{
              fontSize: 36,
              color: '#6366f1'
            }} />
              </Box>
              <Typography variant="h6" sx={{
            fontWeight: 700,
            color: '#e8e6f0',
            mb: 1
          }}>
                How can I help you today?
              </Typography>
              <Typography sx={{
            color: '#94a3b8',
            maxWidth: 420,
            lineHeight: 1.7
          }}>
                Ask me about revenue trends, customer churn, fraud patterns, cash flow forecasts, or any operational question.
              </Typography>

              {/* Suggestion chips */}
              <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mt: 3,
            justifyContent: 'center'
          }}>
                {['What is our current churn rate?', 'Summarize revenue this month', 'Any fraud alerts?', 'Cash flow forecast'].map((suggestion, idx) => <Box key={suggestion} onClick={() => {
              setQuestion(suggestion);
            }} sx={{
              px: 2,
              py: 1,
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.04)',
              border: '1px solid rgba(99, 102, 241, 0.12)',
              cursor: 'pointer',
              animation: 'fadeInUp 400ms ease both',
              animationDelay: `${idx * 0.06}s`,
              transition: 'all 250ms ease',
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.08)',
                transform: 'translateY(-2px)',
                borderColor: 'rgba(99, 102, 241, 0.25)'
              }
            }}>
                    <Typography sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#6366f1'
              }}>
                      {suggestion}
                    </Typography>
                  </Box>)}
              </Box>
            </Box>}

          {messages.map((msg, idx) => <Box key={idx} sx={{
          display: 'flex',
          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          animation: 'fadeInUp 300ms ease both'
        }}>
              <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            maxWidth: '75%',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
                <Box sx={{
              width: 34,
              height: 34,
              minWidth: 34,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #10b981, #0d9488)',
              boxShadow: msg.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.25)' : '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}>
                  {msg.role === 'user' ? <PersonIcon sx={{
                fontSize: 18,
                color: '#fff'
              }} /> : <SmartToyIcon sx={{
                fontSize: 18,
                color: '#fff'
              }} />}
                </Box>
                <Box sx={{
              p: 2,
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(22, 21, 35, 0.65)',
              backdropFilter: msg.role === 'ai' ? 'blur(8px)' : 'none',
              border: msg.role === 'ai' ? '1px solid rgba(99, 102, 241, 0.12)' : 'none',
              boxShadow: msg.role === 'user' ? '0 6px 20px rgba(99, 102, 241, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
                  <Typography sx={{
                color: msg.role === 'user' ? '#fff' : '#e8e6f0',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap'
              }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            </Box>)}

          {/* Typing indicator */}
          {loading && <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          animation: 'fadeIn 300ms ease both'
        }}>
              <Box sx={{
            width: 34,
            height: 34,
            minWidth: 34,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}>
                <SmartToyIcon sx={{
              fontSize: 18,
              color: '#fff'
            }} />
              </Box>
              <Box sx={{
            p: 1.5,
            borderRadius: '14px 14px 14px 4px',
            background: 'rgba(22, 21, 35, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(99, 102, 241, 0.12)'
          }}>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </Box>
            </Box>}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box sx={{
        p: 2,
        borderTop: '1px solid rgba(148, 163, 184, 0.12)',
        background: 'rgba(22, 21, 35, 0.5)',
        backdropFilter: 'blur(8px)'
      }}>
          <TextField fullWidth placeholder="Ask the COO Agent a question..." value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={handleKeyDown} multiline maxRows={4} InputProps={{
          endAdornment: <InputAdornment position="end">
                  <IconButton onClick={handleSubmit} disabled={loading || !question.trim()} sx={{
              width: 40,
              height: 40,
              background: question.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99, 102, 241, 0.1)',
              color: question.trim() ? '#fff' : '#94a3b8',
              transition: 'all 300ms ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#94a3b8'
              }
            }}>
                    <SendIcon sx={{
                fontSize: 20
              }} />
                  </IconButton>
                </InputAdornment>
        }} sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '14px'
          }
        }} />
        </Box>
      </GlassCard>
    </Box>;
}