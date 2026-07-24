import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function PatientSetupScreen() {
  const { user, setActivePatient } = useAuth();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/patients', {
        name,
        birthDate: birthDate || undefined,
        userId: user?.id,
      });

      if (response && response.id) {
        setActivePatient(response);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar paciente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Configuração Inicial</h2>
          <p className="text-gray-500 mt-2">Para começarmos, qual é o nome da primeira pessoa que receberá os cuidados da sua família?</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome do Paciente"
            type="text"
            placeholder="Ex: Dona Maria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Data de Nascimento (Opcional)"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-2 py-3.5">
            {isLoading ? 'Salvando...' : 'Começar a usar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
