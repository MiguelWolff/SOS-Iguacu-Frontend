import { API_BASE } from '../constants';

async function apiRequest(path: string, options?: RequestInit) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Erro na requisição: ${path} - ${res.statusText}`);
  }

  return res.json();
}

export const apiGet = async <T = any>(path: string): Promise<T> => {
  return apiRequest(path, { method: 'GET' });
};

export const apiPost = async <T = any>(path: string, body: any): Promise<T> => {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const apiPut = async <T = any>(path: string, body: any): Promise<T> => {
  return apiRequest(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const apiDelete = async <T = any>(path: string): Promise<T> => {
  return apiRequest(path, { method: 'DELETE' });
};

