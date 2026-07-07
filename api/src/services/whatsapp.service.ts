import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';

export class WhatsappService {
  private sock: any;
  private isConnected = false;
  private currentQrCode: string | null = null;

  constructor() {
    this.connect();
  }

  private async connect() {
    const authPath = path.join(__dirname, '..', '..', 'auth_info_baileys');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['AgendaMed', 'Chrome', '1.0.0'],
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Armazena a string do QR Code na memória para ser resgatada pela API
        this.currentQrCode = qr;
        console.log('[WhatsApp] 📱 Novo QR Code gerado! Disponível via API para o Front-end.');
      }

      if (connection === 'close') {
        this.isConnected = false;
        this.currentQrCode = null;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('[WhatsApp] ❌ Conexão fechada. Reconectando:', shouldReconnect);
        if (shouldReconnect) {
          this.connect();
        } else {
          console.log('[WhatsApp] ⚠️ Você foi desconectado (logged out).');
        }
      } else if (connection === 'open') {
        this.isConnected = true;
        this.currentQrCode = null;
        console.log('[WhatsApp] ✅ Conectado com sucesso!');
      }
    });
  }

  getStatus() {
    return {
      connected: this.isConnected,
      qrCode: this.currentQrCode,
    };
  }

  /**
   * Envia uma mensagem de texto pelo WhatsApp.
   * @param phoneWhats O telefone no formato brasileiro (ex: 5511999999999)
   * @param text O texto do "Magic Link"
   */
  async sendMessage(phoneWhats: string, text: string): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('[WhatsApp] ⚠️ Tentativa de envio falhou. WhatsApp não conectado.');
      return false;
    }

    // O Baileys exige o formato JID: número@s.whatsapp.net
    // Removemos qualquer caractere não numérico por segurança
    const numericPhone = phoneWhats.replace(/\D/g, '');
    const jid = `${numericPhone}@s.whatsapp.net`;

    try {
      await this.sock.sendMessage(jid, { text });
      console.log(`[WhatsApp] 📩 Mensagem enviada para ${phoneWhats}`);
      return true;
    } catch (error) {
      console.error(`[WhatsApp] ❌ Falha ao enviar para ${phoneWhats}:`, error);
      return false;
    }
  }
}

// Instância global para ser importada e usada no sistema inteiro
export const whatsappService = new WhatsappService();
