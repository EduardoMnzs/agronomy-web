import { useState, useEffect } from 'react';
import { user as userApi } from '../api/api';

let cached = null;
let fetchedOnce = false;
let inflight = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn({ data: cached, loading: !fetchedOnce }));
}

export default function useCurrentUser() {
  const [state, setState] = useState({ data: cached, loading: !fetchedOnce });

  useEffect(() => {
    listeners.add(setState);
    if (!fetchedOnce) {
      if (!inflight) {
        inflight = userApi.me()
          .then((me) => { cached = me; })
          .catch(() => { cached = null; })
          .finally(() => { fetchedOnce = true; inflight = null; notify(); });
      }
    }
    return () => listeners.delete(setState);
  }, []);

  const { data, loading } = state;
  const firstName = data?.full_name?.split(' ')[0] ?? data?.name?.split(' ')[0] ?? data?.username ?? '';
  const initials = data?.full_name
    ? data.full_name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : firstName.slice(0, 2).toUpperCase();
  const role = data?.role ?? '';
  const isAdmin = role === 'admin';

  return { data, loading, firstName, initials, role, isAdmin };
}
