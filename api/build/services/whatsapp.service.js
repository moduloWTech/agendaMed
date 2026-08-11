"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class WhatsappService {
    sock;
    isConnected = false;
    currentQrCode = null;
    supabaseUrl = process.env.SUPABASE_URL || 'https://ekbrvqaovvhmtwhnabbo.supabase.co';
    supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
    bucketName = 'whatsapp-auth';
    constructor() {
        // this.connect(); // Desativado por padrão. Pode ser ativado via API ou cron.
    }
    /**
     * Baixa todos os arquivos de sessão salvos no Supabase Storage para o disco local temporário.
     */
    async downloadSessionFromSupabase(authPath) {
        if (!this.supabaseKey)
            return;
        try {
            if (!fs_1.default.existsSync(authPath)) {
                fs_1.default.mkdirSync(authPath, { recursive: true });
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
            if (!listRes.ok)
                return;
            const files = await listRes.json();
            if (!Array.isArray(files) || files.length === 0)
                return;
            console.log(`[WhatsApp] 📥 Baixando ${files.length} arquivos de sessão do Supabase Storage...`);
            for (const file of files) {
                if (!file.name)
                    continue;
                const downloadRes = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${file.name}`, {
                    headers: {
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'apikey': this.supabaseKey
                    }
                });
                if (downloadRes.ok) {
                    const content = await downloadRes.arrayBuffer();
                    fs_1.default.writeFileSync(path_1.default.join(authPath, file.name), Buffer.from(content));
                }
            }
            console.log('[WhatsApp] 🔐 Sessão sincronizada do Supabase com sucesso!');
        }
        catch (error) {
            console.error('[WhatsApp] ⚠️ Erro ao sincronizar sessão do Supabase:', error);
        }
    }
    /**
     * Envia os arquivos de sessão alterados no disco local para o Supabase Storage.
     */
    async uploadSessionToSupabase(authPath) {
        if (!this.supabaseKey || !fs_1.default.existsSync(authPath))
            return;
        try {
            const files = fs_1.default.readdirSync(authPath);
            for (const file of files) {
                const filePath = path_1.default.join(authPath, file);
                if (fs_1.default.statSync(filePath).isFile()) {
                    const fileContent = fs_1.default.readFileSync(filePath);
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
        }
        catch (error) {
            console.error('[WhatsApp] ⚠️ Erro ao enviar sessão para o Supabase Storage:', error);
        }
    }
    /**
     * Remove todos os arquivos de sessão tanto do disco local quanto do Supabase Storage.
     */
    async clearSession(authPath) {
        // 1. Limpar no disco local
        if (fs_1.default.existsSync(authPath)) {
            try {
                const files = fs_1.default.readdirSync(authPath);
                for (const file of files) {
                    const filePath = path_1.default.join(authPath, file);
                    if (fs_1.default.statSync(filePath).isFile()) {
                        fs_1.default.unlinkSync(filePath);
                    }
                    else {
                        fs_1.default.rmSync(filePath, { recursive: true, force: true });
                    }
                }
            }
            catch (e) {
                console.error('[WhatsApp] Erro ao limpar arquivos locais:', e);
            }
        }
        // 2. Limpar no Supabase Storage
        if (!this.supabaseKey)
            return;
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
                const files = await listRes.json();
                if (Array.isArray(files) && files.length > 0) {
                    const prefixes = files.map((f) => f.name).filter(Boolean);
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
        }
        catch (error) {
            console.error('[WhatsApp] ⚠️ Erro ao limpar bucket no Supabase:', error);
        }
    }
    async connect() {
        const authPath = path_1.default.join(__dirname, '..', '..', 'auth_info_baileys');
        // 1. Baixa a sessão salva do Supabase antes de carregar
        await this.downloadSessionFromSupabase(authPath);
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(authPath);
        this.sock = (0, baileys_1.makeWASocket)({
            auth: state,
            printQRInTerminal: false,
            browser: ['AgendaMed', 'Chrome', '1.0.0'],
        });
        // 2. Sempre que as credenciais mudarem, salva localmente e sincroniza com o Supabase Storage
        this.sock.ev.on('creds.update', async () => {
            await saveCreds();
            await this.uploadSessionToSupabase(authPath);
        });
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                this.currentQrCode = qr;
                console.log('[WhatsApp] 📱 Novo QR Code gerado! Disponível via API para o Front-end.');
            }
            if (connection === 'close') {
                this.isConnected = false;
                this.currentQrCode = null;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                console.log('[WhatsApp] ❌ Conexão fechada. Reconectando:', shouldReconnect);
                if (shouldReconnect) {
                    this.connect();
                }
                else {
                    console.log('[WhatsApp] ⚠️ Você foi desconectado (logged out). Limpando sessão e reiniciando...');
                    await this.clearSession(authPath);
                    this.connect();
                }
            }
            else if (connection === 'open') {
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
    async sendMessage(phoneWhats, text) {
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
            }
            else {
                console.warn(`[WhatsApp] ⚠️ Aviso: Não conseguimos validar ${numericPhone} no servidor. Tentando forçar o envio...`);
            }
            await this.sock.sendMessage(jid, { text });
            console.log(`[WhatsApp] 📩 Mensagem enviada para ${phoneWhats} (JID: ${jid})`);
            return true;
        }
        catch (error) {
            console.error(`[WhatsApp] ❌ Falha ao enviar para ${phoneWhats}:`, error);
            return false;
        }
    }
}
exports.WhatsappService = WhatsappService;
