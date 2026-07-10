import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PostListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [attributes, setAttributes] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/categories', { auth: false }).then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.slug === category);
  const selectedSubcategory = selectedCategory?.subcategories.find((s) => s.slug === subcategory);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl(null);
  }

  async function uploadImage() {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const token = localStorage.getItem('thikana_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setImageUrl(json.data.url);
      return json.data.url;
    } finally {
      setUploading(false);
    }
  }

  // AI-assist: draft title/description/category suggestion from the photo.
  // Never blocks manual posting if it fails or the free quota is hit.
  async function handleAiDraft() {
    if (!imageFile) return;
    setAiLoading(true);
    setError('');
    try {
      const base64 = await fileToBase64(imageFile);
      const { draft } = await api.post('/ai/draft-listing', { imageBase64: base64, mimeType: imageFile.type });
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
    } catch (err) {
      setError('AI draft unavailable right now — no problem, just fill it in manually below.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile && !imageUrl) finalImageUrl = await uploadImage();

      await api.post('/listings', {
        category, subcategory, title, description,
        price: price ? Number(price) : undefined,
        images: finalImageUrl ? [finalImageUrl] : [],
        attributes,
        location: { area, city: 'Kolkata' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 560, paddingTop: 32, paddingBottom: 60 }}>
      <p className="eyebrow">New listing</p>
      <h1 style={{ fontSize: 26, margin: '10px 0 24px' }}>Post something to sell</h1>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">Listing submitted! It'll go live once approved. Redirecting...</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div style={{ marginTop: 10 }}>
              <img src={imagePreview} alt="preview" style={{ maxHeight: 160, borderRadius: 8 }} />
              <div style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={handleAiDraft} disabled={aiLoading}>
                  {aiLoading ? <span className="spinner"></span> : '✨ Auto-fill with AI'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(''); setAttributes({}); }} required>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {selectedCategory && (
          <div className="field">
            <label>Subcategory</label>
            <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setAttributes({}); }} required>
              <option value="">Select a subcategory</option>
              {selectedCategory.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </div>

        <div className="field">
          <label>Price (₹, leave blank if not applicable)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
        </div>

        <div className="field">
          <label>Area (Kolkata locality)</label>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Salt Lake, Gariahat, Howrah..." />
        </div>

        {selectedSubcategory?.attrs?.map((attr) => (
          <div className="field" key={attr}>
            <label>{attr.replace(/_/g, ' ')}</label>
            <input
              value={attributes[attr] || ''}
              onChange={(e) => setAttributes((a) => ({ ...a, [attr]: e.target.value }))}
            />
          </div>
        ))}

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting || uploading}>
          {submitting || uploading ? <span className="spinner"></span> : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}
