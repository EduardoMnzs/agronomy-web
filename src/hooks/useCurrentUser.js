import { useState, useEffect } from 'react';
import { user as userApi } from '../api/api';

let cached = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(cached));
}

export default function useCurrentUser() {
  const [data, setData] = useState(cached);

  useEffect(() => {
    listeners.add(setData);
    if (!cached) {
      userApi.me().then((me) => {
        cached = me;
        notify();
      }).catch(() => {});
    }
    return () => listeners.delete(setData);
  }, []);

  const firstName = data?.full_name?.split(' ')[0] ?? data?.name?.split(' ')[0] ?? data?.username ?? '';
  const initials = data?.full_name
    ? data.full_name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : firstName.slice(0, 2).toUpperCase();
  const role = data?.role ?? '';

  return { data, firstName, initials, role };
}
