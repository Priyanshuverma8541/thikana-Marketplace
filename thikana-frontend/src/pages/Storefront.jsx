import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Storefront() {
  const { slug } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/listings/store/${slug}`, { auth: false })
      .then((d) => { setSeller(d.seller); setListings(d.listings); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>Loading...</div>;
  if (notFound) return <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>Store not found.</div>;

  const waLink = seller.phone
    ? `https://wa.me/91${seller.phone}?text=${encodeURIComponent(`Hi ${seller.storeName}, I found your store on Thikana!`)}`
    : null;

  return (
    <div>
      <div style={{
        textAlign: 'center', padding: '9px', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
        background: 'var(--navy-deep)', color: 'var(--paper-dim)', borderBottom: '1px solid var(--line)'
      }}>
        🏪 This store runs on <b style={{ color: 'var(--taxi)' }}>Thikana</b> — Kolkata's own marketplace
      </div>

      <div className="wrap" style={{ maxWidth: 560, paddingTop: 36, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--brick), var(--taxi))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 600, color: 'var(--ink)',
            border: '3px solid var(--panel)', boxShadow: '0 0 0 3px var(--taxi)'
          }}>
            {seller.storeName?.slice(0, 2).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>{seller.storeName}</h1>
          {seller.verified && (
            <span style={{
              fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--tram)',
              border: '1px solid var(--tram)', borderRadius: 20, padding: '2px 9px'
            }}>✓ Verified seller</span>
          )}
          {seller.location?.area && <p style={{ fontSize: 13, color: 'var(--paper-dim)', marginTop: 10 }}>📍 {seller.location.area}, Kolkata</p>}
          {seller.bio && <p style={{ fontSize: 14.5, color: 'var(--paper-dim)', maxWidth: 400, margin: '12px auto 20px' }}>{seller.bio}</p>}

          {waLink && (
            <a className="btn-whatsapp" href={waLink} target="_blank" rel="noreferrer">💬 Message on WhatsApp</a>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14, marginTop: 24 }}>
          {listings.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--paper-dim)' }}>No products listed yet.</p>
          )}
          {listings.map((p) => (
            <div key={p._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                aspectRatio: '1', background: 'linear-gradient(135deg, var(--navy-deep), var(--panel))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30
              }}>
                {p.images?.[0] ? <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
              </div>
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{p.title}</h3>
                {p.price != null && <div style={{ fontFamily: "'Fraunces', serif", color: 'var(--taxi)', fontSize: 16, fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</div>}
                {waLink && (
                  <a
                    href={`https://wa.me/91${seller.phone}?text=${encodeURIComponent(`Hi, I'm interested in "${p.title}" from your Thikana store.`)}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      marginTop: 9, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      background: 'var(--navy-deep)', border: '1px solid var(--tram)', color: 'var(--tram)',
                      fontSize: 11.5, fontWeight: 600, padding: 8, borderRadius: 6
                    }}
                  >💬 Message to buy</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
