import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MobileOnboarding } from './MobileOnboarding';

describe('MobileOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders first slide by default with correct content', () => {
    render(<MobileOnboarding onComplete={vi.fn()} onGoToLogin={vi.fn()} />);

    expect(screen.getByText(/Medicamentos na hora certa/i)).toBeInTheDocument();
    expect(screen.getByText(/Lembretes e Doses/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pular/i })).toBeInTheDocument();
  });

  it('navigates through slides when clicking Continuar', () => {
    render(<MobileOnboarding onComplete={vi.fn()} onGoToLogin={vi.fn()} />);

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    
    // Slide 1 -> Slide 2 (Equipe sincronizada)
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Toda a família sincronizada/i)).toBeInTheDocument();

    // Slide 2 -> Slide 3 (Agenda)
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Tenha sua agenda sempre em dia/i)).toBeInTheDocument();

    // Slide 3 -> Slide 4 (Cofre)
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Documentos e laudos protegidos/i)).toBeInTheDocument();

    // Slide 4 -> Slide 5 (Estamos prontos)
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Estamos prontos!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vamos começar!/i })).toBeInTheDocument();
  });

  it('saves completed flag and calls onComplete on last slide', () => {
    const mockComplete = vi.fn();
    render(<MobileOnboarding onComplete={mockComplete} onGoToLogin={vi.fn()} />);

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);

    const startBtn = screen.getByRole('button', { name: /Vamos começar!/i });
    fireEvent.click(startBtn);

    expect(localStorage.getItem('agendamed_onboarding_completed')).toBe('true');
    expect(mockComplete).toHaveBeenCalledTimes(1);
  });

  it('skips onboarding when Pular is clicked', () => {
    const mockComplete = vi.fn();
    render(<MobileOnboarding onComplete={mockComplete} onGoToLogin={vi.fn()} />);

    const skipBtn = screen.getByRole('button', { name: /Pular/i });
    fireEvent.click(skipBtn);

    expect(localStorage.getItem('agendamed_onboarding_completed')).toBe('true');
    expect(mockComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onGoToLogin when secondary login button is clicked', () => {
    const mockGoToLogin = vi.fn();
    render(<MobileOnboarding onComplete={vi.fn()} onGoToLogin={mockGoToLogin} />);

    const loginLink = screen.getByRole('button', { name: /Já tem uma conta\? Fazer Login/i });
    fireEvent.click(loginLink);

    expect(localStorage.getItem('agendamed_onboarding_completed')).toBe('true');
    expect(mockGoToLogin).toHaveBeenCalledTimes(1);
  });
});
