import { useState, useEffect } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function InviteAcceptScreen() {
  const { setUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneWhats, setPhoneWhats] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL ?token=...
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Token de convite não encontrado na URL.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/accept-invite', {
        token,
        name,
        email,
        phoneWhats,
        password
      });

      if (response && response.accessToken) {
        // Save token and reload page to trigger normal auth flow
        localStorage.setItem('@AgendaMed:token', response.accessToken);
        window.location.href = '/'; 
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao aceitar convite.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Premium Background for Login/Invite */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/premium_medical_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 border border-white/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Aceitar Convite</h2>
          <p className="text-gray-500 mt-2 text-sm">Crie sua conta para acessar o perfil do paciente compartilhado com você.</p>
        </div>

        {error && !token ? (
           <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 text-center">
             {error}
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nome Completo"
              type="text"
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="joao@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="WhatsApp"
              type="tel"
              placeholder="11999999999"
              value={phoneWhats}
              onChange={(e) => setPhoneWhats(e.target.value)}
              required
            />

            <Input
              label="Crie uma Senha"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? 'Criando conta...' : 'Aceitar e Entrar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
