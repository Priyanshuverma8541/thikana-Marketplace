import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(emailOrPhone, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60, paddingBottom: 60 }}>
      <p className="eyebrow">Welcome back</p>
      <h1 style={{ fontSize: 30, margin: '10px 0 28px' }}>Log in to Thikana</h1>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email or phone</label>
          <input value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--paper-dim)' }}>
        New here? <Link to="/register" style={{ color: 'var(--taxi)' }}>Create an account</Link>
      </p>
    </div>
  );
}
