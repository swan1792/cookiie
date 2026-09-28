import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/dashboard" style={styles.brand}>🔐 Auth Test</Link>
          <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/profile" style={styles.navLink}>Profile</Link>
        </div>
        <div style={styles.navRight}>
          {user && <span style={styles.userName}>{user.name}</span>}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '60px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  brand: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  navLink: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '14px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    color: '#aaa',
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    padding: '24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
};

export default Layout;
