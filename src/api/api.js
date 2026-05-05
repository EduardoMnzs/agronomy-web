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
};

export const query = {
  submit: ({ question, knowledgeIds, documentIds, userData, conversationId }) =>
    request('/query', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        knowledge_ids: knowledgeIds?.length ? knowledgeIds : undefined,
        document_ids: documentIds?.length ? documentIds : undefined,
        user_data: userData,
        conversation_id: conversationId ?? undefined,
      }),
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
};
