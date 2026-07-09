import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm() {
  // Estados da máquina
  const [mode, setMode] = useState<'idle' | 'admin_register' | 'setup_qr' | 'ready_to_send' | 'success'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Form Fields
  const [isLoading, setIsLoading] = useState(false);
  const [phoneWhats, setPhoneWhats] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [patientName, setPatientName] = useState('');

  // Status visual para erros
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  // Remove a checagem que ia direto pro setup. O fluxo agora começa no 'idle'.

  // Polling para checar o status do WhatsApp apenas no 'setup_qr'
  useEffect(() => {
    if (mode !== 'setup_qr') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3333/api/whatsapp/status');
        const data = await response.json();
        
        if (data.connected) {
          setMode('ready_to_send');
        } else if (data.qrCode) {
          setQrCode(data.qrCode);
        }
      } catch (err) {
        console.error('Erro ao checar status do WhatsApp', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mode]);

  // Passo 1: Dispara requestLogin
  const handleRequestLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(false);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3333/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneWhats }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === 'REQUIRE_SETUP') {
          // Banco vazio! Ir para o form de registro
          setMode('admin_register');
        } else if (data.action === 'REQUIRE_QR_SETUP') {
          // Robô caiu e precisa ser reconectado!
          setMode('setup_qr');
        } else {
          // Deu tudo certo, link enviado
          setMode('success');
          setMessage('Link seguro enviado para o seu WhatsApp! Verifique suas mensagens.');
        }
      } else {
        setError(true);
        setMessage(data.error || 'Número não cadastrado. Fale com o administrador da família.');
      }
    } catch (error) {
      setError(true);
      setMessage('Falha ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Passo 2: Registra o Administrador
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3333/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneWhats, name, email, patientName }),
      });

      if (response.ok) {
        setMode('setup_qr');
      } else {
        const data = await response.json();
        setError(true);
        setMessage(data.error || 'Falha ao cadastrar administrador.');
      }
    } catch (err) {
      setError(true);
      setMessage('Erro na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 text-3xl">
          📱
        </div>
        <h3 className="text-xl font-bold text-gray-800">Verifique seu WhatsApp</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <Button variant="outline" onClick={() => { setMode('idle'); setPhoneWhats(''); }} fullWidth>
          Tentar outro número
        </Button>
      </div>
    );
  }

  if (mode === 'admin_register') {
    return (
      <form onSubmit={handleRegisterAdmin} className="flex flex-col gap-6 w-full animate-in fade-in zoom-in-95">
        <div className="text-center mb-2">
          <h3 className="text-xl font-bold text-[var(--color-primary)]">Bem-vindo(a)! 🎉</h3>
          <p className="text-sm text-gray-600">Este é o primeiro acesso ao sistema. Cadastre-se como <b>Administrador</b> da família.</p>
        </div>

        <Input
          label="WhatsApp (com DDD)"
          type="tel"
          value={phoneWhats}
          onChange={() => {}} // travado
          disabled
        />
        
        <Input
          label="Seu Nome"
          type="text"
          placeholder="Ex: Carlos Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Input
          label="Seu E-mail"
          type="email"
          placeholder="Ex: carlos@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 mb-4">Sobre quem vamos cuidar?</h4>
          <Input
            label="Nome do Paciente"
            type="text"
            placeholder="Ex: Dona Maria"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {message}
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Cadastrar'}
        </Button>
      </form>
    );
  }

  if (mode === 'setup_qr') {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in-95">
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">Conectando o Robô</h3>
        <p className="text-gray-600 mb-4">
          Para que o sistema consiga enviar mensagens, escaneie o QR Code abaixo com o <b>seu WhatsApp</b>. (Vá em Aparelhos Conectados)
        </p>
        
        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex items-center justify-center min-h-[256px]">
          {qrCode ? (
            <QRCodeSVG value={qrCode} size={200} />
          ) : (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-40 w-40 bg-gray-200 rounded-lg mb-2"></div>
              <span className="text-sm text-gray-500">Gerando QR Code...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">Aguardando escaneamento...</p>
      </div>
    );
  }

  if (mode === 'ready_to_send') {
    return (
      <div className="flex flex-col gap-6 w-full text-center animate-in fade-in zoom-in-95">
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-2">
          <div className="text-4xl mb-3">✅</div>
          <h4 className="font-bold text-green-800 text-xl mb-1">Robô Conectado!</h4>
          <p className="text-sm text-green-700">Seu WhatsApp foi vinculado com sucesso. Você já pode disparar seu próprio link de acesso.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-left">
            {message}
          </div>
        )}

        <Button type="button" onClick={() => handleRequestLink()} variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Receber link mágico'}
        </Button>
      </div>
    );
  }

  // mode === 'idle'
  return (
    <form onSubmit={handleRequestLink} className="flex flex-col gap-6 w-full">
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

      {error && (
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
          {isLoading ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </form>
  );
}
