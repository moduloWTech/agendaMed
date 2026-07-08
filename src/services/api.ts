export const api = {
  get: async (endpoint: string) => {
    return request(endpoint, 'GET');
  },
  post: async (endpoint: string, body: any) => {
    return request(endpoint, 'POST', body);
  },
  put: async (endpoint: string, body: any) => {
    return request(endpoint, 'PUT', body);
  },
  delete: async (endpoint: string) => {
    return request(endpoint, 'DELETE');
  },
};

async function request(endpoint: string, method: string, body?: any) {
  const token = localStorage.getItem('@agendaMed:token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`http://localhost:3333${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  // Se for 204 No Content, retorna nulo para não quebrar no JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
