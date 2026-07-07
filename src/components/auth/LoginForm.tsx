import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onLogin?: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneWhats, setPhoneWhats] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3333/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneWhats }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Link seguro enviado para o seu WhatsApp! Verifique suas mensagens.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Número não cadastrado. Fale com o administrador da família.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Falha ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 text-3xl">
          📱
        </div>
        <h3 className="text-xl font-bold text-gray-800">Verifique seu WhatsApp</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <Button variant="outline" onClick={() => setStatus('idle')} fullWidth>
          Tentar outro número
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <p className="text-gray-600 mb-2">
        Digite seu número de WhatsApp para receber um link de acesso seguro. Nenhuma senha necessária.
      </p>

      <Input
        label="WhatsApp (com DDD)"
        type="tel"
        placeholder="Ex: 11999999999"
        value={phoneWhats}
        onChange={(e) => setPhoneWhats(e.target.value.replace(/\D/g, ''))}
        required
        maxLength={11}
        minLength={10}
      />

      {status === 'error' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {message}
        </div>
      )}

      <div className="mt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading || phoneWhats.length < 10}
        >
          {isLoading ? 'Enviando...' : 'Receber link mágico'}
        </Button>
      </div>
    </form>
  );
}
