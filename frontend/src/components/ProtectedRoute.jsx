import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../auth';
export default function ProtectedRoute({
  token,
  children
}) {
  const hasToken = token || getAccessToken();
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}