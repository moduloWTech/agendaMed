export const api = {
  get: async (endpoint: string) => {
    return request(endpoint, 'GET');
  },
  post: async (endpoint: string, body: any, options?: { isMultipart?: boolean }) => {
    return request(endpoint, 'POST', body, options);
  },
  put: async (endpoint: string, body: any, options?: { isMultipart?: boolean }) => {
    return request(endpoint, 'PUT', body, options);
  },
  patch: async (endpoint: string, body: any, options?: { isMultipart?: boolean }) => {
    return request(endpoint, 'PATCH', body, options);
  },
  delete: async (endpoint: string) => {
    return request(endpoint, 'DELETE');
  },
};

async function request(endpoint: string, method: string, body?: any, options?: { isMultipart?: boolean }) {
  const token = localStorage.getItem('@agendaMed:token');
  const user = localStorage.getItem('@agendaMed:user');
  
  const headers: Record<string, string> = {};
  
  // Apenas define Content-Type como application/json se houver um corpo (body) a ser enviado
  if (!options?.isMultipart && body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  
  console.log(`🚀 [API Request] ${method} ${API_URL}${endpoint}`, {
    headers,
    body,
    tokenPreview: token ? `${token.substring(0, 25)}...` : 'NONE',
    currentUserInStorage: user ? JSON.parse(user) : null
  });

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: options?.isMultipart ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`❌ [API Error Response] ${method} ${endpoint}`, {
      status: response.status,
      statusText: response.statusText,
      errorData,
    });
    throw new Error(errorData.message || errorData.error || `HTTP Error ${response.status}`);
  }

  // Se for 204 No Content, retorna nulo para não quebrar no JSON
  if (response.status === 204) {
    console.log(`✅ [API Success] ${method} ${endpoint} (204 No Content)`);
    return null;
  }

  const json = await response.json();
  console.log(`✅ [API Success] ${method} ${endpoint}`, json);
  return json;
}
