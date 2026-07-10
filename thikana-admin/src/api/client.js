const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('thikana_admin_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({ success: false, error: { message: 'Invalid server response' } }));
  if (!json.success) {
    const err = new Error(json.error?.message || 'Something went wrong');
    err.code = json.error?.code;
    throw err;
  }
  return json.data;
}

export const api = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' })
};
