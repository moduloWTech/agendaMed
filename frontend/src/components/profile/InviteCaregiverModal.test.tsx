import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InviteCaregiverModal } from './InviteCaregiverModal';
import { AuthContext } from '../../contexts/AuthContext';

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <AuthContext.Provider value={{
      login: vi.fn(),
      register: vi.fn(),
      user: null,
      activePatient: { id: 'patient-123', name: 'Dona Maria' },
      token: null,
      logout: vi.fn(),
      setActivePatient: vi.fn(),
      loading: false
    } as any}>
      {component}
    </AuthContext.Provider>
  );
};

describe('InviteCaregiverModal', () => {
  it('renders modal correctly with patient name', () => {
    renderWithContext(<InviteCaregiverModal onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText(/Convidar Cuidador/i)).toBeInTheDocument();
    expect(screen.getByText(/Dona Maria/i)).toBeInTheDocument();
  });

  it('formats phone input correctly', () => {
    renderWithContext(<InviteCaregiverModal onClose={vi.fn()} onSuccess={vi.fn()} />);

    const phoneInput = screen.getByPlaceholderText(/\(DD\) 9XXXX-XXXX/i);
    fireEvent.change(phoneInput, { target: { value: '11988887777' } });

    expect((phoneInput as HTMLInputElement).value).toBe('(11) 98888-7777');
  });

  it('shows error if name is too short', async () => {
    renderWithContext(<InviteCaregiverModal onClose={vi.fn()} onSuccess={vi.fn()} />);

    const nameInput = screen.getByPlaceholderText(/Nome do cuidador/i);
    const phoneInput = screen.getByPlaceholderText(/\(DD\) 9XXXX-XXXX/i);
    const submitBtn = screen.getByRole('button', { name: /Gerar Convite/i });

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.change(phoneInput, { target: { value: '11988887777' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Nome muito curto')).toBeInTheDocument();
  });
});
