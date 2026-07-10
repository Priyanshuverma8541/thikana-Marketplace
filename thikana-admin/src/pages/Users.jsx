import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const q = roleFilter ? `?role=${roleFilter}` : '';
    api.get(`/admin/users${q}`).then((d) => setUsers(d.users)).finally(() => setLoading(false));
  }

  useEffect(load, [roleFilter]);

  async function toggle(id, field, current) {
    await api.patch(`/admin/users/${id}`, { [field]: !current });
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26 }}>Users</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--paper)', padding: '8px 12px', borderRadius: 6 }}>
          <option value="">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Name</th><th>Contact</th><th>Role</th><th>Verified</th><th>Banned</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}>Loading...</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--paper-dim)' }}>No users found.</td></tr>}
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}{u.storeName && <div style={{ fontSize: 11.5, color: 'var(--paper-dim)' }}>{u.storeName}</div>}</td>
                <td>{u.email || u.phone || '—'}</td>
                <td>{u.role.join(', ')}</td>
                <td>{u.verified ? '✓' : '—'}</td>
                <td>{u.banned ? '🚫' : '—'}</td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn btn-success" onClick={() => toggle(u._id, 'verified', u.verified)}>{u.verified ? 'Unverify' : 'Verify'}</button>
                  <button className="btn btn-danger" onClick={() => toggle(u._id, 'banned', u.banned)}>{u.banned ? 'Unban' : 'Ban'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
