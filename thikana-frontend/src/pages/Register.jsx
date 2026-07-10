import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60, paddingBottom: 60 }}>
      <p className="eyebrow">Join Thikana</p>
      <h1 style={{ fontSize: 30, margin: '10px 0 28px' }}>Create your account</h1>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div className="field">
          <label>Phone (WhatsApp number)</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="9876543210" />
        </div>
        <div className="field">
          <label>Email (optional)</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--paper-dim)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--taxi)' }}>Log in</Link>
      </p>
    </div>
  );
}
