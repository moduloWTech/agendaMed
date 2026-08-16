import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export function LoginForm() {
  const { login, register, loginWithGoogle } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneWhats, setPhoneWhats] = useState('');
  const [password, setPassword] = useState('');

  // Status visual para erros
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    setMessage('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, phoneWhats, password });
      }
    } catch (err: any) {
      setError(true);
      setMessage(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    setError(false);
    setMessage('');
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err: any) {
      setError(true);
      setMessage(err.message || 'Falha no login com Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-slate-700/60 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto"
    >
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta familiar'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {mode === 'login' ? 'Entre com seu e-mail ou Google para continuar' : 'Cadastre-se para coordenar os cuidados do seu familiar'}
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError(true);
              setMessage('Falha ao conectar com o Google');
            }}
            useOneTap
            shape="pill"
            theme="filled_blue"
            size="large"
          />
        </div>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-slate-500 text-xs uppercase font-medium">ou continue com e-mail</span>
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {/* Opções de Abas */}
        <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl mb-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => { setMode('login'); setError(false); setMessage(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white dark:bg-slate-800 text-[var(--color-primary)] dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => { setMode('register'); setError(false); setMessage(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white dark:bg-slate-800 text-[var(--color-primary)] dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {mode === 'register' && (
          <>
            <Input
              label="Seu Nome Completo"
              type="text"
              placeholder="Ex: Maria Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-required="true"
            />
            <Input
              label="WhatsApp (com DDD)"
              type="tel"
              placeholder="Ex: 11999999999"
              value={phoneWhats}
              onChange={(e) => setPhoneWhats(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={11}
              minLength={10}
              aria-required="true"
            />
          </>
        )}

        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          aria-required="true"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-400 hover:text-[var(--color-primary)] dark:hover:text-slate-200 transition-colors p-1.5 focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        )}

        <div className="mt-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading || (mode === 'register' && phoneWhats.length < 10)}
            className="py-3.5 text-base shadow-lg shadow-[var(--color-primary)]/20"
          >
            {isLoading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar Família'}
          </Button>
        </div>
      </form>
    </div>
  );
}
