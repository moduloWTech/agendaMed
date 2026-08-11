import AsyncStorage from '@react-native-async-storage/async-storage';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api-agenda-med-mwt.vercel.app';
const API_URL = rawApiUrl.replace(/\/+$/, '');

export const api = {
  async fetch(endpoint: string, options?: { method?: string; body?: any; isMultipart?: boolean }) {
    const token = await AsyncStorage.getItem('@agendaMed:token');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const headers: Record<string, string> = {};
    if (!options?.isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${cleanEndpoint}`, {
      method: options?.method || 'GET',
      headers,
      body: options?.isMultipart ? options.body : (options?.body ? JSON.stringify(options.body) : undefined),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  },

  get(endpoint: string) {
    return this.fetch(endpoint, { method: 'GET' });
  },

  post(endpoint: string, body?: any, options?: { isMultipart?: boolean }) {
    return this.fetch(endpoint, { method: 'POST', body, isMultipart: options?.isMultipart });
  },

  put(endpoint: string, body?: any, options?: { isMultipart?: boolean }) {
    return this.fetch(endpoint, { method: 'PUT', body, isMultipart: options?.isMultipart });
  },

  delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }
};
