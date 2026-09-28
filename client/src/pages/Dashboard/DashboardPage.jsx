import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from '../../redux/slices/authSlice';
import Layout from '../../components/Layout';
import { COOKIE_AUTH } from '../../utils/constants';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleRefreshSession = async () => {
    setChecking(true);
    const result = await dispatch(fetchMe());
    if (fetchMe.fulfilled.match(result)) {
      setSessionInfo({ valid: true, time: new Date().toLocaleTimeString() });
    } else {
      setSessionInfo({ valid: false, time: new Date().toLocaleTimeString() });
    }
    setChecking(false);
  };

  useEffect(() => {
    handleRefreshSession();
  }, []);

  return (
    <Layout>
      <h1 style={styles.title}>Dashboard</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>👤 User Info</h2>
        {user ? (
          <table style={styles.table}>
            <tbody>
              <tr><td style={styles.td}><strong>ID:</strong></td><td>{user.id}</td></tr>
              <tr><td style={styles.td}><strong>Name:</strong></td><td>{user.name}</td></tr>
              <tr><td style={styles.td}><strong>Email:</strong></td><td>{user.email}</td></tr>
              <tr><td style={styles.td}><strong>Role:</strong></td><td>{user.role}</td></tr>
            </tbody>
          </table>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔐 Auth Mode: {COOKIE_AUTH ? 'HttpOnly Cookie' : 'JWT'}</h2>
        {COOKIE_AUTH ? (
          <div style={styles.infoBox}>
            <p><strong>Session stored in:</strong> HttpOnly cookie (not accessible via JS)</p>
            <p><strong>Cookie name:</strong> <code>admin_session</code></p>
            <p><strong>Verification:</strong> Open DevTools → Application → Cookies → check <code>HttpOnly</code> column</p>
            <p><strong>JS access test:</strong> Run <code>document.cookie</code> in Console — should NOT show <code>admin_session</code></p>
          </div>
        ) : (
          <div style={styles.infoBox}>
            <p><strong>Session stored in:</strong> localStorage (JS-readable)</p>
            <p><strong>Header:</strong> <code>X-Session-Token</code> sent on every request</p>
            <p><strong>Vulnerability:</strong> XSS can steal the token via <code>localStorage.getItem()</code></p>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔄 Session Validation</h2>
        <button onClick={handleRefreshSession} disabled={checking} style={styles.button}>
          {checking ? 'Checking...' : 'Refresh Session'}
        </button>
        {sessionInfo && (
          <p style={{ marginTop: '12px', color: sessionInfo.valid ? '#27ae60' : '#e74c3c' }}>
            {sessionInfo.valid ? '✅ Session is valid' : '❌ Session invalid'} — checked at {sessionInfo.time}
          </p>
        )}
      </div>
    </Layout>
  );
};

const styles = {
  title: {
    marginBottom: '24px',
    color: '#1a1a2e',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    marginBottom: '16px',
    fontSize: '18px',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  td: {
    padding: '8px 16px 8px 0',
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '4px',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default DashboardPage;
