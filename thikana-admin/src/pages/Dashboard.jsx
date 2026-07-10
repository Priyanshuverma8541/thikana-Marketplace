import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <p className="eyebrow" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: 'var(--taxi)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overview</p>
      <h1 style={{ fontSize: 26, margin: '10px 0 28px' }}>Dashboard</h1>

      {!stats && <p style={{ color: 'var(--paper-dim)' }}>Loading...</p>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card"><b>{stats.totalListings}</b><span>TOTAL LISTINGS</span></div>
          <div className="stat-card"><b>{stats.pendingListings}</b><span>PENDING APPROVAL</span></div>
          <div className="stat-card"><b>{stats.activeListings}</b><span>ACTIVE LISTINGS</span></div>
          <div className="stat-card"><b>{stats.totalUsers}</b><span>TOTAL USERS</span></div>
          <div className="stat-card"><b>{stats.totalSellers}</b><span>SELLERS</span></div>
          <div className="stat-card"><b>{stats.activeCategories}</b><span>ACTIVE CATEGORIES</span></div>
        </div>
      )}

      {stats?.pendingListings > 0 && (
        <div className="card" style={{ padding: 18, borderColor: 'var(--taxi)' }}>
          <p style={{ fontSize: 14 }}>
            <b style={{ color: 'var(--taxi)' }}>{stats.pendingListings} listing{stats.pendingListings > 1 ? 's' : ''}</b> waiting for review — head to the Listings tab to approve or reject them.
          </p>
        </div>
      )}
    </div>
  );
}
