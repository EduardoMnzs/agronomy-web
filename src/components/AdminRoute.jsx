import { Navigate } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';

export default function AdminRoute({ children }) {
  const { loading, isAdmin } = useCurrentUser();

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
