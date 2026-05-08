const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data.detail || `Erro ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const session = {
  get: () => localStorage.getItem('access_token'),
  set: (token) => localStorage.setItem('access_token', token),
  clear: () => localStorage.removeItem('access_token'),
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};

function authHeader() {
  return { Authorization: `Bearer ${session.get()}` };
}

export const documents = {
  index: (formData) =>
    request('/knowledge', {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    }),

  get: (id) =>
    request(`/knowledge/${id}`, {
      headers: authHeader(),
    }),

  getStatus: (id) =>
    request(`/knowledge/${id}/status`, {
      headers: authHeader(),
    }),

  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.category) qs.set('category', params.category);
    if (params.page) qs.set('page', params.page);
    if (params.limit) qs.set('limit', params.limit);
    const q = qs.toString();
    return request(`/knowledge${q ? `?${q}` : ''}`, {
      headers: authHeader(),
    });
  },

  remove: (id) =>
    request(`/knowledge/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }),

  stats: () =>
    request('/knowledge/stats', {
      headers: authHeader(),
    }),
};

export const query = {
  submit: ({ question, knowledgeIds, documentIds, myDocumentIds, userData, conversationId }) =>
    request('/query', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        knowledge_ids: knowledgeIds?.length ? knowledgeIds : undefined,
        document_ids: documentIds?.length ? documentIds : undefined,
        my_document_ids: myDocumentIds?.length ? myDocumentIds : undefined,
        user_data: userData,
        conversation_id: conversationId ?? undefined,
      }),
    }),
};

export const myDocuments = {
  list: () => request('/my-documents', { headers: authHeader() }),
  get: (id) => request(`/my-documents/${id}`, { headers: authHeader() }),
  getStatus: (id) => request(`/my-documents/${id}/status`, { headers: authHeader() }),
  upload: (formData) =>
    request('/my-documents', {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    }),
  remove: (id) =>
    request(`/my-documents/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }),
};

export const conversations = {
  list: () => request('/conversations', { headers: authHeader() }),
  get: (id) => request(`/conversations/${id}`, { headers: authHeader() }),
  patch: (id, body) =>
    request(`/conversations/${id}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  remove: (id) => request(`/conversations/${id}`, { method: 'DELETE', headers: authHeader() }),
};

export const user = {
  me: () => request('/users/me', { headers: authHeader() }),
  updateMe: (body) =>
    request('/users/me', {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  changePassword: ({ currentPassword, newPassword }) =>
    request('/users/me/password', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),
  uploadAvatar: (formData) =>
    request('/users/me/avatar', {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    }),
  deleteAvatar: () =>
    request('/users/me/avatar', {
      method: 'DELETE',
      headers: authHeader(),
    }),
  getProfile: () => request('/users/me/profile', { headers: authHeader() }),
  updateProfile: (body) =>
    request('/users/me/profile', {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};

export const search = {
  run: (q) => {
    const qs = new URLSearchParams({ q }).toString();
    return request(`/search?${qs}`, { headers: authHeader() });
  },
};

export const appSettings = {
  get: () => request('/settings', { headers: authHeader() }),
  update: (values) =>
    request('/settings', {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    }),
};

export const users = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.role) qs.set('role', params.role);
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', params.page);
    if (params.limit) qs.set('limit', params.limit);
    const q = qs.toString();
    return request(`/users${q ? `?${q}` : ''}`, { headers: authHeader() });
  },
  create: (body) =>
    request('/users', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    request(`/users/${id}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  remove: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }),
};

export const accessRequests = {
  create: (body) =>
    request('/access-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', params.page);
    if (params.limit) qs.set('limit', params.limit);
    const q = qs.toString();
    return request(`/access-requests${q ? `?${q}` : ''}`, { headers: authHeader() });
  },
  decide: (id, body) =>
    request(`/access-requests/${id}/decide`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  remove: (id) =>
    request(`/access-requests/${id}`, { method: 'DELETE', headers: authHeader() }),
};

export const auth = {
  login: async (username, password, rememberMe) => {
    const body = new URLSearchParams({ username, password, remember_me: rememberMe });
    const data = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (data?.access_token) {
      session.set(data.access_token);
    }
    return data;
  },
  logout: () => {
    session.clear();
  },
  changePassword: ({ currentPassword, newPassword }) =>
    request('/auth/change-password', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  resetPassword: ({ token, newPassword }) =>
    request('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
};
