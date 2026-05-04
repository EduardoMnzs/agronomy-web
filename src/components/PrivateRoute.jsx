import { Navigate } from 'react-router-dom';
import { session } from '../api/api';

export default function PrivateRoute({ children }) {
  if (!session.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
