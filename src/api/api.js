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
