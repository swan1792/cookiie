import { Navigate, Outlet } from 'react-router-dom';
import { COOKIE_AUTH, LOCAL_STORAGE_KEYS } from '../utils/constants';
import { loadState } from '../utils/localStorage';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  // Quick pre-check from localStorage
  // Cookie mode: check loginAdminDetails (user info stored on login)
  // JWT mode: check sessionId (token stored in localStorage)
  const storedValue = COOKIE_AUTH
    ? loadState(LOCAL_STORAGE_KEYS.loginAdminDetails)
    : loadState(LOCAL_STORAGE_KEYS.sessionId);

  if (!storedValue) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
