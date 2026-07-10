import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/categories', { auth: false }).then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    api.get(`/listings?${params.toString()}`)
      .then((d) => setListings(d.listings))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div>
      <div className="wrap" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Search flats, jobs, products, services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'var(--panel)', border: '1px solid var(--line)',
              borderRadius: 8, padding: '11px 14px', color: 'var(--paper)', fontSize: 14
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button
            className="btn"
            onClick={() => setActiveCategory(null)}
            style={{
              background: !activeCategory ? 'var(--taxi)' : 'var(--panel)',
              color: !activeCategory ? 'var(--ink)' : 'var(--paper-dim)',
              border: '1px solid var(--line)', borderRadius: 22, whiteSpace: 'nowrap'
            }}
          >All</button>
          {categories.map((c) => (
            <button
              key={c.slug}
              className="btn"
              onClick={() => setActiveCategory(c.slug)}
              style={{
                background: activeCategory === c.slug ? 'var(--taxi)' : 'var(--panel)',
                color: activeCategory === c.slug ? 'var(--ink)' : 'var(--paper-dim)',
                border: '1px solid var(--line)', borderRadius: 22, whiteSpace: 'nowrap'
              }}
            >{c.icon} {c.name}</button>
          ))}
        </div>

        <h2 style={{ fontSize: 21, margin: '32px 0 16px' }}>
          {activeCategory ? categories.find((c) => c.slug === activeCategory)?.name : 'Fresh listings'}
        </h2>

        {loading && <p style={{ color: 'var(--paper-dim)' }}>Loading...</p>}
        {!loading && listings.length === 0 && (
          <p style={{ color: 'var(--paper-dim)' }}>No listings yet in this category — be the first to post.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {listings.map((l) => (
            <Link to={`/listing/${l._id}`} key={l._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                aspectRatio: '4/3', background: 'linear-gradient(135deg, var(--navy-deep), #1b294a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative'
              }}>
                {l.images?.[0] ? <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                {l.featured && (
                  <span style={{
                    position: 'absolute', top: 8, left: 8, fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--taxi)', color: 'var(--ink)', fontWeight: 600
                  }}>FEATURED</span>
                )}
              </div>
              <div style={{ padding: '12px 13px' }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{l.title}</h3>
                {l.price != null && (
                  <div style={{ fontFamily: "'Fraunces', serif", color: 'var(--taxi)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                    ₹{l.price.toLocaleString('en-IN')}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--paper-dim)' }}>
                  <span>{l.location?.area || 'Kolkata'}</span>
                  <span>{l.sellerId?.storeName || l.sellerId?.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
