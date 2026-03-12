const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  posts: {
    getAll: () => fetchApi('/posts'),
    getAdminList: (token: string) => fetchApi('/posts/admin/list', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    getOne: (id: string) => fetchApi(`/posts/${id}`),
    getAdminOne: (id: string, token: string) => fetchApi(`/posts/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    create: (data: any, token: string) => fetchApi('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
    update: (id: string, data: any, token: string) => fetchApi(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
    delete: (id: string, token: string) => fetchApi(`/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
  },
  series: {
    getAll: () => fetchApi('/series'),
    getAdminList: (token: string) => fetchApi('/series/admin/list', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    getOne: (id_or_slug: string) => fetchApi(`/series/${id_or_slug}`),
    create: (data: any, token: string) => fetchApi('/series', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
    update: (id: string, data: any, token: string) => fetchApi(`/series/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
    delete: (id: string, token: string) => fetchApi(`/series/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
  },
  comments: {
    getByPost: (postId: string) => fetchApi(`/comments/${postId}`),
    submit: (data: any) => fetchApi('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getAdminList: (token: string) => fetchApi('/comments/admin/list', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    approve: (id: string, token: string) => fetchApi(`/comments/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    }),
    delete: (id: string, token: string) => fetchApi(`/comments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
  },
  reactions: {
    getByPost: (postId: string) => fetchApi(`/reactions/${postId}`),
    submit: (postId: string, type: string) => fetchApi('/reactions', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, type }),
    }),
  },
  analytics: {
    recordView: (postId: string) => fetchApi(`/analytics/view/${postId}`, { method: 'POST' }),
    getStats: (token: string) => fetchApi('/analytics/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    getPublicStats: () => fetchApi('/analytics/public-stats'),
  },
  auth: {
    login: (credentials: any) => fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  },
  setToken: (token: string | null) => {
    if (token) localStorage.setItem('monolog_token', token);
    else localStorage.removeItem('monolog_token');
  },
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('monolog_token') : null
};
