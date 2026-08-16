import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MobileAuthWizard } from './MobileAuthWizard';
import { AuthContext } from '../../contexts/AuthContext';

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div data-testid="google-login-mock">Google Login</div>,
}));

const mockLogin = vi.fn();
const mockRegister = vi.fn();

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <AuthContext.Provider value={{
      login: mockLogin,
      register: mockRegister,
      loginWithGoogle: vi.fn(),
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

describe('MobileAuthWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login view by default', () => {
    renderWithContext(<MobileAuthWizard onShowOnboarding={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Acesse sua conta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acessar Conta/i })).toBeInTheDocument();
  });

  it('submits login form when email and password are provided', async () => {
    renderWithContext(<MobileAuthWizard onShowOnboarding={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Acessar Conta/i });

    fireEvent.change(emailInput, { target: { value: 'user@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@email.com', 'password123');
    });
  });

  it('navigates through 3-step registration wizard and registers user', async () => {
    renderWithContext(<MobileAuthWizard onShowOnboarding={vi.fn()} />);

    // Switch to register
    const createAccountBtn = screen.getByRole('button', { name: /Criar conta familiar/i });
    fireEvent.click(createAccountBtn);

    // Step 1: Name
    expect(screen.getByRole('heading', { name: /Como você se chama\?/i })).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(/Ex: Maria Silva/i);
    fireEvent.change(nameInput, { target: { value: 'Maria Cuidadora' } });

    const step1NextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(step1NextBtn);

    // Step 2: WhatsApp
    expect(screen.getByRole('heading', { name: /Qual seu WhatsApp\?/i })).toBeInTheDocument();
    const phoneInput = screen.getByPlaceholderText(/\(11\) 99999-9999/i);
    fireEvent.change(phoneInput, { target: { value: '11987654321' } });

    const step2NextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(step2NextBtn);

    // Step 3: Email and Password
    expect(screen.getByRole('heading', { name: /Como você vai acessar\?/i })).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText(/Mínimo 6 caracteres/i);
    const registerSubmitBtn = screen.getByRole('button', { name: /Concluir Cadastro/i });

    fireEvent.change(emailInput, { target: { value: 'maria@cuidados.com' } });
    fireEvent.change(passwordInput, { target: { value: 'segredo123' } });
    fireEvent.click(registerSubmitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Maria Cuidadora',
        email: 'maria@cuidados.com',
        phoneWhats: '11987654321',
        password: 'segredo123'
      });
    });
  });
});
