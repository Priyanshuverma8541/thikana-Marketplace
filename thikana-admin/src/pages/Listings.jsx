import { useEffect, useState } from 'react';
import { api } from '../api/client';

const STATUS_COLORS = { pending: 'var(--taxi)', active: 'var(--tram)', rejected: 'var(--brick)', sold: 'var(--paper-dim)' };

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const q = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/admin/listings${q}`).then((d) => setListings(d.listings)).finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  async function updateStatus(id, status) {
    await api.patch(`/admin/listings/${id}`, { status });
    load();
  }

  async function toggleFeatured(id, featured) {
    await api.patch(`/admin/listings/${id}`, { featured: !featured });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this listing permanently?')) return;
    await api.delete(`/admin/listings/${id}`);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26 }}>Listings</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--paper)', padding: '8px 12px', borderRadius: 6 }}>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="sold">Sold</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Title</th><th>Category</th><th>Seller</th><th>Status</th><th>Featured</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6}>Loading...</td></tr>}
            {!loading && listings.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--paper-dim)' }}>Nothing here.</td></tr>}
            {listings.map((l) => (
              <tr key={l._id}>
                <td>{l.title}</td>
                <td>{l.category} / {l.subcategory}</td>
                <td>{l.sellerId?.storeName || l.sellerId?.name || '—'}</td>
                <td><span className="badge" style={{ color: STATUS_COLORS[l.status], border: `1px solid ${STATUS_COLORS[l.status]}` }}>{l.status}</span></td>
                <td>{l.featured ? '⭐' : '—'}</td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {l.status !== 'active' && <button className="btn btn-success" onClick={() => updateStatus(l._id, 'active')}>Approve</button>}
                  {l.status !== 'rejected' && <button className="btn btn-danger" onClick={() => updateStatus(l._id, 'rejected')}>Reject</button>}
                  <button className="btn btn-outline" onClick={() => toggleFeatured(l._id, l.featured)}>{l.featured ? 'Unfeature' : 'Feature'}</button>
                  <button className="btn btn-danger" onClick={() => remove(l._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
