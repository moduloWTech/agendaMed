import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../services/api';
import React from 'react';

// Mock do axios/api
vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

// Mock do push service
vi.mock('../services/push', () => ({
  subscribeToPushNotifications: vi.fn()
}));

const TestComponent = () => {
  const { login, register, user, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Logado' : 'Deslogado'}</div>
      {user && <div data-testid="user-name">{user.name}</div>}
      <button onClick={() => login('test@test.com', '123456')}>Fazer Login</button>
      <button onClick={() => register({ name: 'Novo User', email: 'novo@test.com', phoneWhats: '11999999999', password: '123' })}>Criar Conta</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('deve realizar login corretamente e salvar token', async () => {
    (api.post as any).mockResolvedValueOnce({
      accessToken: 'fake-token-123',
      user: { id: '1', name: 'Usuario Teste', email: 'test@test.com' }
    });
    
    (api.get as any).mockResolvedValueOnce([]); // Mock do get de pacientes

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Fazer Login');
    loginBtn.click();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@test.com', password: '123456' });
      expect(localStorage.getItem('@agendaMed:token')).toBe('fake-token-123');
      expect(screen.getByTestId('auth-status').textContent).toBe('Logado');
      expect(screen.getByTestId('user-name').textContent).toBe('Usuario Teste');
    });
  });

  it('deve realizar o cadastro (register) corretamente', async () => {
    (api.post as any).mockResolvedValueOnce({
      accessToken: 'fake-token-reg',
      user: { id: '2', name: 'Novo User', email: 'novo@test.com' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerBtn = screen.getByText('Criar Conta');
    registerBtn.click();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/register', { 
        name: 'Novo User', 
        email: 'novo@test.com', 
        phoneWhats: '11999999999', 
        password: '123' 
      });
      expect(localStorage.getItem('@agendaMed:token')).toBe('fake-token-reg');
      expect(screen.getByTestId('auth-status').textContent).toBe('Logado');
      expect(screen.getByTestId('user-name').textContent).toBe('Novo User');
    });
  });
});
