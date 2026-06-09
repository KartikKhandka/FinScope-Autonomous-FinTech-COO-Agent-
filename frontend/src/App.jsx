import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import DashboardPage from './pages/DashboardPage';
import RevenueAnalyticsPage from './pages/RevenueAnalyticsPage';
import CustomerIntelligencePage from './pages/CustomerIntelligencePage';
import CashFlowForecastPage from './pages/CashFlowForecastPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import AICOOAssistantPage from './pages/AICOOAssistantPage';
import ExecutiveReportPage from './pages/ExecutiveReportPage';
import DatasetsPage from './pages/DatasetsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { getAccessToken, clearAccessToken } from './auth';
function App() {
  const [token, setToken] = useState(getAccessToken());
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const syncToken = () => {
      const newToken = getAccessToken();
      setToken(newToken);
    };
    window.addEventListener('storage', syncToken);
    window.addEventListener('token_change', syncToken);
    return () => {
      window.removeEventListener('storage', syncToken);
      window.removeEventListener('token_change', syncToken);
    };
  }, []);
  const handleLogout = () => {
    clearAccessToken();
    setToken(null);
    navigate('/login');
  };
  const isLoginPage = location.pathname === '/login';
  const showSidebar = token && !isLoginPage;
  return <Box sx={{
    display: 'flex',
    minHeight: '100vh'
  }}>
      {showSidebar && <Sidebar onLogout={handleLogout} />}

      <Box sx={{
      flex: 1,
      ml: showSidebar ? '72px' : 0,
      transition: 'margin-left 350ms cubic-bezier(0.4, 0, 0.2, 1)',
      minHeight: '100vh',
      position: 'relative',
      '@media (min-width: 900px)': {
        ml: showSidebar ? '260px' : 0
      }
    }}>
        {/* Main content wrapper */}
        <Box key={location.pathname} sx={{
        p: isLoginPage ? 0 : {
          xs: 2,
          sm: 3,
          md: 4
        },
        maxWidth: isLoginPage ? '100%' : 1400,
        mx: 'auto',
        animation: 'fadeInUp 450ms cubic-bezier(0.4, 0, 0.2, 1) both'
      }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute token={token}><DashboardPage /></ProtectedRoute>} />
            <Route path="/data" element={<ProtectedRoute token={token}><DatasetsPage /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute token={token}><RevenueAnalyticsPage /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute token={token}><CustomerIntelligencePage /></ProtectedRoute>} />
            <Route path="/cashflow" element={<ProtectedRoute token={token}><CashFlowForecastPage /></ProtectedRoute>} />
            <Route path="/risk" element={<ProtectedRoute token={token}><RiskIntelligencePage /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute token={token}><AICOOAssistantPage /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute token={token}><ExecutiveReportPage /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Box>
    </Box>;
}
export default App;