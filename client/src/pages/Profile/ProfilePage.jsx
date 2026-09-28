import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { COOKIE_AUTH } from '../../utils/constants';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <h1 style={styles.title}>Profile</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>👤 Profile Details</h2>
        {user ? (
          <div style={styles.details}>
            <div style={styles.field}>
              <span style={styles.label}>Name</span>
              <span style={styles.value}>{user.name}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user.email}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Role</span>
              <span style={styles.value}>{user.role}</span>
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📋 Security Info</h2>
        <div style={styles.securityInfo}>
          <div style={styles.field}>
            <span style={styles.label}>Auth Mode</span>
            <span style={styles.value}>
              {COOKIE_AUTH ? 'HttpOnly Cookie' : 'JWT (localStorage)'}
            </span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>XSS Protection</span>
            <span style={styles.value}>
              {COOKIE_AUTH ? '✅ Protected (HttpOnly)' : '❌ Vulnerable (JS-readable)'}
            </span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>CSRF Protection</span>
            <span style={styles.value}>
              {COOKIE_AUTH ? '✅ SameSite=Strict' : '⚠️ Custom header required'}
            </span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Session Revocation</span>
            <span style={styles.value}>
              {COOKIE_AUTH ? '✅ Immediate (server-side)' : '❌ Must wait for expiry'}
            </span>
          </div>
        </div>
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
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  securityInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  label: {
    color: '#666',
    fontSize: '14px',
  },
  value: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#333',
  },
};

export default ProfilePage;
