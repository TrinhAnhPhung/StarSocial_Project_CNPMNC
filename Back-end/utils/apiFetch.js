// src/utils/apiFetch.js
import { API_BASE, safeJson } from '../constants/api';

export default async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    // 🔒 Bị khóa tạm thời
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Tài khoản của bạn đang bị khóa tạm thời.');
    window.location.href = '/login';
    throw new Error('Account locked');
  }

  return res;
}
