import { useEffect, useState } from 'react';
import { api } from '../api/client';

// Parses lines like: "Flats for Rent: bhk, furnishing, rent" into subcategory objects
function parseSubcategories(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, attrsPart] = line.split(':');
      const attrs = (attrsPart || '').split(',').map((a) => a.trim()).filter(Boolean);
      return { name: name.trim(), attrs };
    })
    .filter((s) => s.name);
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [subText, setSubText] = useState('');

  function load() {
    setLoading(true);
    api.get('/admin/categories').then((d) => setCategories(d.categories)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/categories', { name, icon, subcategories: parseSubcategories(subText) });
      setName(''); setIcon(''); setSubText(''); setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(cat) {
    await api.patch(`/admin/categories/${cat._id}`, { isActive: !cat.isActive });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this category? Existing listings will keep it but it will no longer be selectable.')) return;
    await api.delete(`/admin/categories/${id}`);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26 }}>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add category'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: 20, marginBottom: 24 }}>
          {error && <div className="error-box">{error}</div>}
          <div className="field">
            <label>Category name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Real Estate" />
          </div>
          <div className="field">
            <label>Icon (emoji)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🏠" />
          </div>
          <div className="field">
            <label>Subcategories — one per line, format: "Name: attr1, attr2, attr3"</label>
            <textarea
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              rows={5}
              placeholder={'Flats for Rent: bhk, furnishing, rent\nFlats for Sale: bhk, area_sqft, price'}
            />
          </div>
          <button className="btn btn-primary">Create category</button>
        </form>
      )}

      {loading && <p style={{ color: 'var(--paper-dim)' }}>Loading...</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {categories.map((c) => (
          <div key={c._id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>{c.icon} {c.name} {!c.isActive && <span style={{ fontSize: 11, color: 'var(--paper-dim)' }}>(inactive)</span>}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--paper-dim)', marginTop: 6 }}>
                  {c.subcategories.map((s) => s.name).join(' · ') || 'No subcategories'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" onClick={() => toggleActive(c)}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
                <button className="btn btn-danger" onClick={() => remove(c._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
