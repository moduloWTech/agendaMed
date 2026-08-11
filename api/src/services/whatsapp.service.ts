import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';

export class WhatsappService {
  private sock: any;
  private isConnected = false;
  private currentQrCode: string | null = null;

  private supabaseUrl = process.env.SUPABASE_URL || 'https://ekbrvqaovvhmtwhnabbo.supabase.co';
  private supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  private bucketName = 'whatsapp-auth';

  constructor() {
    // this.connect(); // Desativado por padrão. Pode ser ativado via API ou cron.
  }

  /**
   * Baixa todos os arquivos de sessão salvos no Supabase Storage para o disco local temporário.
   */
  private async downloadSessionFromSupabase(authPath: string) {
    if (!this.supabaseKey) return;
    try {
      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
      }

      const listRes = await fetch(`${this.supabaseUrl}/storage/v1/object/list/${this.bucketName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prefix: '', limit: 100 })
      });

      if (!listRes.ok) return;

      const files: any = await listRes.json();
      if (!Array.isArray(files) || files.length === 0) return;

      console.log(`[WhatsApp] 📥 Baixando ${files.length} arquivos de sessão do Supabase Storage...`);

      for (const file of files) {
        if (!file.name) continue;
        const downloadRes = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${file.name}`, {
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'apikey': this.supabaseKey
          }
        });

        if (downloadRes.ok) {
          const content = await downloadRes.arrayBuffer();
          fs.writeFileSync(path.join(authPath, file.name), Buffer.from(content));
        }
      }
      console.log('[WhatsApp] 🔐 Sessão sincronizada do Supabase com sucesso!');
    } catch (error) {
      console.error('[WhatsApp] ⚠️ Erro ao sincronizar sessão do Supabase:', error);
    }
  }

  /**
   * Envia os arquivos de sessão alterados no disco local para o Supabase Storage.
   */
  private async uploadSessionToSupabase(authPath: string) {
    if (!this.supabaseKey || !fs.existsSync(authPath)) return;
    try {
      const files = fs.readdirSync(authPath);
      for (const file of files) {
        const filePath = path.join(authPath, file);
        if (fs.statSync(filePath).isFile()) {
          const fileContent = fs.readFileSync(filePath);
          await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${file}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey,
              'x-upsert': 'true',
              'Content-Type': 'application/json'
            },
            body: fileContent
          });
        }
      }
    } catch (error) {
      console.error('[WhatsApp] ⚠️ Erro ao enviar sessão para o Supabase Storage:', error);
    }
  }

  /**
   * Remove todos os arquivos de sessão tanto do disco local quanto do Supabase Storage.
   */
  private async clearSession(authPath: string) {
    // 1. Limpar no disco local
    if (fs.existsSync(authPath)) {
      try {
        const files = fs.readdirSync(authPath);
        for (const file of files) {
          const filePath = path.join(authPath, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          } else {
            fs.rmSync(filePath, { recursive: true, force: true });
          }
        }
      } catch (e) {
        console.error('[WhatsApp] Erro ao limpar arquivos locais:', e);
      }
    }

    // 2. Limpar no Supabase Storage
    if (!this.supabaseKey) return;
    try {
      const listRes = await fetch(`${this.supabaseUrl}/storage/v1/object/list/${this.bucketName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prefix: '', limit: 100 })
      });

      if (listRes.ok) {
        const files: any = await listRes.json();
        if (Array.isArray(files) && files.length > 0) {
          const prefixes = files.map((f: any) => f.name).filter(Boolean);
          await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prefixes })
          });
          console.log('[WhatsApp] 🧹 Bucket do Supabase Storage limpo após logout.');
        }
      }
    } catch (error) {
      console.error('[WhatsApp] ⚠️ Erro ao limpar bucket no Supabase:', error);
    }
  }

  public async connect() {
    const authPath = path.join(__dirname, '..', '..', 'auth_info_baileys');

    // 1. Baixa a sessão salva do Supabase antes de carregar
    await this.downloadSessionFromSupabase(authPath);

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['AgendaMed', 'Chrome', '1.0.0'],
    });

    // 2. Sempre que as credenciais mudarem, salva localmente e sincroniza com o Supabase Storage
    this.sock.ev.on('creds.update', async () => {
      await saveCreds();
      await this.uploadSessionToSupabase(authPath);
    });

    this.sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
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
          console.log('[WhatsApp] ⚠️ Você foi desconectado (logged out). Limpando sessão e reiniciando...');
          await this.clearSession(authPath);
          this.connect();
        }
      } else if (connection === 'open') {
        this.isConnected = true;
        this.currentQrCode = null;
        console.log('[WhatsApp] ✅ Conectado com sucesso!');
        await this.uploadSessionToSupabase(authPath);
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

    let numericPhone = phoneWhats.replace(/\D/g, '');
    if (numericPhone.length === 10 || numericPhone.length === 11) {
      numericPhone = `55${numericPhone}`;
    }

    try {
      const [result] = await this.sock.onWhatsApp(numericPhone);
      let jid = `${numericPhone}@s.whatsapp.net`;
      if (result && result.exists) {
        jid = result.jid;
      } else {
        console.warn(`[WhatsApp] ⚠️ Aviso: Não conseguimos validar ${numericPhone} no servidor. Tentando forçar o envio...`);
      }

      await this.sock.sendMessage(jid, { text });
      console.log(`[WhatsApp] 📩 Mensagem enviada para ${phoneWhats} (JID: ${jid})`);
      return true;
    } catch (error) {
      console.error(`[WhatsApp] ❌ Falha ao enviar para ${phoneWhats}:`, error);
      return false;
    }
  }
}
