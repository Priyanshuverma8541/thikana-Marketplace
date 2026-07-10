import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'var(--taxi)', active: 'var(--tram)', rejected: 'var(--brick)', sold: 'var(--paper-dim)'
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get('/listings/mine/all').then((d) => setListings(d.listings)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markSold(id) {
    await api.patch(`/listings/${id}`, { status: 'sold' });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this listing permanently?')) return;
    await api.delete(`/listings/${id}`);
    load();
  }

  return (
    <div className="wrap" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="eyebrow">Your store</p>
          <h1 style={{ fontSize: 26 }}>{user?.storeName}</h1>
        </div>
        <Link to="/post-listing" className="btn btn-primary">+ Post new listing</Link>
      </div>

      {user?.storeSlug && (
        <p style={{ color: 'var(--paper-dim)', fontSize: 13.5, marginBottom: 28 }}>
          Your public store link: <a href={`/store/${user.storeSlug}`} style={{ color: 'var(--taxi)' }}>thikana.in/store/{user.storeSlug}</a>
        </p>
      )}

      {loading && <p style={{ color: 'var(--paper-dim)' }}>Loading...</p>}
      {!loading && listings.length === 0 && (
        <p style={{ color: 'var(--paper-dim)' }}>You haven't posted anything yet. Your first listing is one click away.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {listings.map((l) => (
          <div key={l._id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{l.title}</h3>
                <span style={{
                  fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: STATUS_COLORS[l.status],
                  border: `1px solid ${STATUS_COLORS[l.status]}`, borderRadius: 12, padding: '2px 9px', textTransform: 'uppercase'
                }}>{l.status}</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--paper-dim)' }}>
                {l.category} · {l.subcategory} {l.price != null && `· ₹${l.price.toLocaleString('en-IN')}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {l.status !== 'sold' && (
                <button className="btn btn-outline" onClick={() => markSold(l._id)}>Mark sold</button>
              )}
              <button className="btn btn-outline" onClick={() => remove(l._id)} style={{ color: 'var(--brick)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
