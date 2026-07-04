import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating authentication delay
    setTimeout(() => {
      setIsLoading(false);
      // Logic for authentication will go here
      console.log('Login attempt', { email });
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <Input
        label="Telefone ou E-mail"
        type="text"
        placeholder="Seu contato"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <Input
        label="Senha"
        type="password"
        placeholder="Sua senha secreta"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <div className="mt-2">
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </div>

      <div className="text-center mt-2">
        <button 
          type="button" 
          className="text-[var(--color-primary)] font-medium text-lg hover:underline active:opacity-70 p-2"
        >
          Esqueci minha senha
        </button>
      </div>
    </form>
  );
}
