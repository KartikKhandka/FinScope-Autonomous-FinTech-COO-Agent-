import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShieldIcon from '@mui/icons-material/Shield';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const navItems = [{
  label: 'Dashboard',
  path: '/',
  icon: DashboardIcon
}, {
  label: 'Data',
  path: '/data',
  icon: StorageIcon
}, {
  label: 'Revenue',
  path: '/revenue',
  icon: TrendingUpIcon
}, {
  label: 'Customer',
  path: '/customer',
  icon: PeopleIcon
}, {
  label: 'Cash Flow',
  path: '/cashflow',
  icon: AccountBalanceIcon
}, {
  label: 'Risk',
  path: '/risk',
  icon: ShieldIcon
}, {
  label: 'AI COO',
  path: '/assistant',
  icon: SmartToyIcon
}, {
  label: 'Report',
  path: '/report',
  icon: AssessmentIcon
}];
export default function Sidebar({
  onLogout
}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarWidth = collapsed ? 72 : 260;
  return <Box sx={{
    width: sidebarWidth,
    minWidth: sidebarWidth,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15, 14, 25, 0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(99, 102, 241, 0.1)',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
    transition: 'width 350ms cubic-bezier(0.4, 0, 0.2, 1), min-width 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    animation: 'slideInLeft 500ms cubic-bezier(0.4, 0, 0.2, 1) both'
  }}>
      {/* Brand */}
      <Box sx={{
      p: collapsed ? '20px 12px' : '20px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
      minHeight: 72,
      transition: 'padding 350ms ease'
    }}>
        <Box sx={{
        width: 40,
        height: 40,
        minWidth: 40,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)'
      }}>
          <Typography sx={{
          color: '#fff',
          fontWeight: 800,
          fontSize: '1.1rem',
          fontFamily: "'Space Grotesk'"
        }}>
            F
          </Typography>
        </Box>
        {!collapsed && <Box sx={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        animation: 'fadeIn 300ms ease both'
      }}>
            <Typography sx={{
          fontWeight: 800,
          fontSize: '0.85rem',
          color: '#e8e6f0',
          fontFamily: "'Space Grotesk', sans-serif",
          lineHeight: 1.2
        }}>
              FinTech COO
            </Typography>
            <Typography sx={{
          fontSize: '0.7rem',
          color: '#94a3b8',
          fontWeight: 600
        }}>
              Agent Platform
            </Typography>
          </Box>}
      </Box>

      {/* Navigation */}
      <Stack spacing={0.5} sx={{
      flex: 1,
      p: collapsed ? '12px 8px' : '12px',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'padding 350ms ease'
    }}>
        {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right" arrow>
              <Box onClick={() => navigate(item.path)} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: collapsed ? 1.5 : 2,
            py: 1.25,
            borderRadius: '12px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            animation: `fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) both`,
            animationDelay: `${index * 0.04}s`,
            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.06))' : 'transparent',
            border: isActive ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid transparent',
            '&:hover': {
              background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(16, 185, 129, 0.08))' : 'rgba(99, 102, 241, 0.05)',
              transform: 'translateX(2px)'
            },
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
                {isActive && <Box sx={{
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
              width: 3,
              borderRadius: 4,
              background: 'linear-gradient(180deg, #6366f1, #10b981)',
              animation: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
            }} />}
                <Icon sx={{
              fontSize: 22,
              color: isActive ? '#6366f1' : '#a5a3b8',
              transition: 'color 250ms ease',
              minWidth: 22
            }} />
                {!collapsed && <Typography sx={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#e8e6f0' : '#a5a3b8',
              transition: 'color 250ms ease',
              animation: 'fadeIn 200ms ease both'
            }}>
                    {item.label}
                  </Typography>}
              </Box>
            </Tooltip>;
      })}
      </Stack>

      {/* Bottom area */}
      <Box sx={{
      borderTop: '1px solid rgba(148, 163, 184, 0.12)',
      p: collapsed ? '12px 8px' : '12px',
      transition: 'padding 350ms ease'
    }}>
        {/* Collapse toggle */}
        <Box sx={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-end',
        mb: 1
      }}>
          <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{
          width: 32,
          height: 32,
          backgroundColor: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          color: '#6366f1',
          transition: 'all 250ms ease',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            transform: 'scale(1.05)'
          }
        }}>
            {collapsed ? <ChevronRightIcon sx={{
            fontSize: 18
          }} /> : <ChevronLeftIcon sx={{
            fontSize: 18
          }} />}
          </IconButton>
        </Box>

        {/* Logout */}
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
          <Box onClick={onLogout} sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: collapsed ? 1.5 : 2,
          py: 1.25,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 250ms ease',
          justifyContent: collapsed ? 'center' : 'flex-start',
          '&:hover': {
            background: 'rgba(244, 114, 182, 0.06)',
            transform: 'translateX(2px)'
          }
        }}>
            <LogoutIcon sx={{
            fontSize: 20,
            color: '#f472b6',
            minWidth: 20
          }} />
            {!collapsed && <Typography sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#f472b6',
            animation: 'fadeIn 200ms ease both'
          }}>
                Logout
              </Typography>}
          </Box>
        </Tooltip>
      </Box>
    </Box>;
}