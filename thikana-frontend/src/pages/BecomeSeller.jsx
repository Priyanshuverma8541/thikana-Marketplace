import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BecomeSeller() {
  const { becomeSeller } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await becomeSeller(storeName, bio);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 460, paddingTop: 60, paddingBottom: 60 }}>
      <p className="eyebrow">Set up your store</p>
      <h1 style={{ fontSize: 28, margin: '10px 0 12px' }}>Start selling on Thikana</h1>
      <p style={{ color: 'var(--paper-dim)', fontSize: 14, marginBottom: 28 }}>
        This creates your public storefront link — the one you'll put in your Instagram bio.
      </p>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Store name</label>
          <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ananya's Closet" required />
        </div>
        <div className="field">
          <label>Short bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Pre-loved & new fashion, sizes S-XL..." />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Create my store'}
        </button>
      </form>
    </div>
  );
}
