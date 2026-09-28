import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import { COOKIE_AUTH } from '../../utils/constants';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 Sign In</h1>
        <div style={styles.modeBadge}>
          Mode: <strong>{COOKIE_AUTH ? 'HttpOnly Cookie' : 'JWT (localStorage)'}</strong>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.hint}>
          <p style={styles.hintTitle}>Test Credentials:</p>
          <code>admin@example.com / password123</code>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#1a1a2e',
  },
  modeBadge: {
    textAlign: 'center',
    padding: '8px',
    marginBottom: '24px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  },
  error: {
    padding: '10px',
    backgroundColor: '#ffeaea',
    color: '#e74c3c',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center',
  },
  button: {
    padding: '12px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
  hint: {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#666',
    textAlign: 'center',
  },
  hintTitle: {
    marginBottom: '4px',
    fontWeight: '500',
  },
};

export default LoginPage;
