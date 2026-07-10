import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/listings/${id}`, { auth: false }).then((d) => setListing(d.listing)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>Loading...</div>;
  if (!listing) return <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>Listing not found.</div>;

  const seller = listing.sellerId;
  const waLink = `https://wa.me/91${seller?.phone || ''}?text=${encodeURIComponent(`Hi, I'm interested in "${listing.title}" on Thikana.`)}`;

  return (
    <div className="wrap" style={{ maxWidth: 720, paddingTop: 36, paddingBottom: 60 }}>
      <div style={{
        aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--navy-deep), var(--panel))',
        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 24
      }}>
        {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '📦'}
      </div>

      <p className="eyebrow">{listing.category} · {listing.subcategory}</p>
      <h1 style={{ fontSize: 28, margin: '10px 0' }}>{listing.title}</h1>
      {listing.price != null && (
        <div style={{ fontFamily: "'Fraunces', serif", color: 'var(--taxi)', fontSize: 26, fontWeight: 600, marginBottom: 16 }}>
          ₹{listing.price.toLocaleString('en-IN')}
        </div>
      )}
      <p style={{ color: 'var(--paper-dim)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>{listing.description}</p>

      {Object.keys(listing.attributes || {}).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          {Object.entries(listing.attributes).map(([k, v]) => v && (
            <div key={k} className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--paper-dim)', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase' }}>{k.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--paper-dim)', marginBottom: 4 }}>Sold by</p>
          <Link to={seller?.storeSlug ? `/store/${seller.storeSlug}` : '#'} style={{ fontWeight: 600, fontSize: 15 }}>
            {seller?.storeName || seller?.name} {seller?.verified && '✓'}
          </Link>
        </div>
        <a className="btn-whatsapp" href={waLink} target="_blank" rel="noreferrer">💬 Message on WhatsApp</a>
      </div>
    </div>
  );
}
