import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';
import { AuthContext } from '../contexts/AuthContext';

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div data-testid="google-login-mock">Google Login</div>,
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockLogin = vi.fn();
const mockRegister = vi.fn();

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <AuthContext.Provider value={{
      login: mockLogin,
      register: mockRegister,
      user: null,
      activePatient: null,
      token: null,
      logout: vi.fn(),
      setActivePatient: vi.fn(),
      loading: false
    } as any}>
      {component}
    </AuthContext.Provider>
  );
};

describe('LoginScreen', () => {
  it('renders login form by default', () => {
    renderWithContext(<LoginScreen />);
    expect(screen.getByRole('heading', { name: /Acesse sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  });

  it('allows user to type and submit login form', async () => {
    renderWithContext(<LoginScreen />);
    
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Senha/i);
    const submitBtn = screen.getByRole('button', { name: /Entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  it('switches to register mode', () => {
    renderWithContext(<LoginScreen />);
    
    const registerTab = screen.getByRole('tab', { name: /Criar Conta/i });
    fireEvent.click(registerTab);

    expect(screen.getByLabelText(/Seu Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp/i)).toBeInTheDocument();
  });
});
