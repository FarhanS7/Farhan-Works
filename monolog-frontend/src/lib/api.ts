const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

export const api = {
  posts: {
    getAll: (page?: number, limit?: number) => {
      let endpoint = "/posts";
      const params = [];
      if (page) params.push(`page=${page}`);
      if (limit) params.push(`limit=${limit}`);
      if (params.length > 0) endpoint += `?${params.join("&")}`;
      return fetchApi(endpoint);
    },
    getAdminList: (token: string) =>
      fetchApi("/posts/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getOne: (id: string) => fetchApi(`/posts/${id}`),
    getAdminOne: (id: string, token: string) =>
      fetchApi(`/posts/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    create: (data: any, token: string) =>
      fetchApi("/posts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      }),
    update: (id: string, data: any, token: string) =>
      fetchApi(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      }),
    delete: (id: string, token: string) =>
      fetchApi(`/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    reorder: (orders: Array<{ id: string; series_order: number }>, token: string) =>
      fetchApi("/posts/reorder", {
        method: "POST",
        body: JSON.stringify({ orders }),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  comments: {
    getByPost: (postId: string) => fetchApi(`/comments/${postId}`),
    submit: (data: any) =>
      fetchApi("/comments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAdminList: (token: string) =>
      fetchApi("/comments/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    approve: (id: string, token: string) =>
      fetchApi(`/comments/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }),
    delete: (id: string, token: string) =>
      fetchApi(`/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  reactions: {
    getByPost: (postId: string) => fetchApi(`/reactions/${postId}`),
    submit: (postId: string, type: string) =>
      fetchApi("/reactions", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, type }),
      }),
  },
  series: {
    getAll: () => fetchApi("/series"),
    getOne: (slugOrId: string) => fetchApi(`/series/${slugOrId}`),
    create: (data: any, token: string) =>
      fetchApi("/series", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      }),
    update: (id: string, data: any, token: string) =>
      fetchApi(`/series/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      }),
    delete: (id: string, token: string) =>
      fetchApi(`/series/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  analytics: {
    recordView: (postId: string) =>
      fetchApi(`/analytics/view/${postId}`, { method: "POST" }),
    getStats: (token: string) =>
      fetchApi("/analytics/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  auth: {
    login: (credentials: any) =>
      fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
  },
  setToken: (token: string | null) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("monolog_token", token);
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        localStorage.removeItem("monolog_token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    }
  },
  getToken: () =>
    typeof window !== "undefined"
      ? localStorage.getItem("monolog_token")
      : null,
};
