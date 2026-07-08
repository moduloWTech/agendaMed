"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = exports.WhatsappService = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const path_1 = __importDefault(require("path"));
class WhatsappService {
    sock;
    isConnected = false;
    currentQrCode = null;
    constructor() {
        this.connect();
    }
    async connect() {
        const authPath = path_1.default.join(__dirname, '..', '..', 'auth_info_baileys');
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(authPath);
        this.sock = (0, baileys_1.makeWASocket)({
            auth: state,
            printQRInTerminal: false,
            browser: ['AgendaMed', 'Chrome', '1.0.0'],
        });
        this.sock.ev.on('creds.update', saveCreds);
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                // Armazena a string do QR Code na memória para ser resgatada pela API
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
                    // Deleta a pasta de autenticação corrompida/antiga e tenta de novo
                    const authPath = path_1.default.join(__dirname, '..', '..', 'auth_info_baileys');
                    const fs = require('fs');
                    if (fs.existsSync(authPath)) {
                        fs.rmSync(authPath, { recursive: true, force: true });
                    }
                    this.connect();
                }
            }
            else if (connection === 'open') {
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
    async sendMessage(phoneWhats, text) {
        if (!this.isConnected) {
            console.warn('[WhatsApp] ⚠️ Tentativa de envio falhou. WhatsApp não conectado.');
            return false;
        }
        let numericPhone = phoneWhats.replace(/\D/g, '');
        // Se o número tiver 10 ou 11 dígitos, presumimos que é do Brasil sem o DDI (55)
        if (numericPhone.length === 10 || numericPhone.length === 11) {
            numericPhone = `55${numericPhone}`;
        }
        try {
            // O Baileys tem um método maravilhoso chamado "onWhatsApp" que consulta os servidores
            // do WhatsApp para saber se o número existe. E o melhor: ele resolve o problema do 
            // 9º dígito no Brasil automaticamente, retornando o JID (ID) exato daquele usuário!
            const [result] = await this.sock.onWhatsApp(numericPhone);
            let jid = `${numericPhone}@s.whatsapp.net`; // Fallback
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
// Instância global para ser importada e usada no sistema inteiro
exports.whatsappService = new WhatsappService();
