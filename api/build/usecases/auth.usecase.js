"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUseCase = void 0;
const whatsapp_service_1 = require("../services/whatsapp.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
const prisma_config_1 = require("../DB/prisma.config");
class AuthUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Verifica se o usuário existe para enviar o link.
     * Se o banco estiver vazio, sinaliza para o frontend iniciar o Setup.
     */
    async requestLogin(phoneWhats) {
        const schema = zod_1.z.string().min(10, 'Telefone inválido');
        const phone = schema.parse(phoneWhats);
        const userCount = await prisma_config_1.prisma.user.count();
        // Se o banco estiver vazio, precisamos que o admin se cadastre
        if (userCount === 0) {
            return { action: 'REQUIRE_SETUP' };
        }
        const user = await this.userRepository.findByPhoneWhats(phone);
        if (!user) {
            throw new Error('Número não cadastrado. Fale com o administrador da família.');
        }
        // Gera um Magic Link Token válido por 15 minutos
        const magicToken = jsonwebtoken_1.default.sign({ id: user.id, phoneWhats: user.phoneWhats }, JWT_SECRET, { expiresIn: '15m' });
        // Constrói o link
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const magicLink = `${baseUrl}/auth/callback?token=${magicToken}`;
        // Mensagem
        let text = '';
        if (!user.name) {
            text = `👋 Olá! Bem-vindo(a) ao AgendaMed.\n\nPara finalizar o seu cadastro, clique no link seguro abaixo:\n\n🔗 ${magicLink}\n\nEste link expira em 15 minutos.`;
        }
        else {
            text = `👋 Olá, ${user.name}! Bem-vindo(a) de volta ao AgendaMed.\n\nPara acessar a sua conta, clique no link seguro abaixo:\n\n🔗 ${magicLink}\n\nEste link expira em 15 minutos.`;
        }
        // Dispara via Baileys
        const sent = await whatsapp_service_1.whatsappService.sendMessage(phone, text);
        if (!sent) {
            // Se não enviou, o robô está desconectado. 
            // Avisa o frontend para mostrar o QR Code de reconexão!
            return { action: 'REQUIRE_QR_SETUP', error: 'O WhatsApp do sistema está desconectado.' };
        }
        return { message: 'Link mágico enviado para o WhatsApp.' };
    }
    /**
     * Salva os dados do Admin quando o banco está vazio.
     */
    async setupAdmin(data) {
        const userCount = await prisma_config_1.prisma.user.count();
        if (userCount > 0) {
            throw new Error('O sistema já possui usuários. Setup indisponível.');
        }
        const schema = zod_1.z.object({
            phoneWhats: zod_1.z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos'),
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
            email: zod_1.z.string().email('E-mail inválido'),
            patientName: zod_1.z.string().min(2, 'O nome do paciente deve ter no mínimo 2 caracteres'),
        });
        const parsed = schema.parse(data);
        await prisma_config_1.prisma.user.create({
            data: {
                phoneWhats: parsed.phoneWhats,
                name: parsed.name,
                email: parsed.email,
                role: 'ADMIN',
                patients: {
                    create: {
                        name: parsed.patientName,
                    }
                }
            }
        });
        return { message: 'Administrador e Paciente cadastrados com sucesso.' };
    }
    /**
     * Valida o token mágico quando o usuário clica no link
     */
    async verifyMagicLink(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = await this.userRepository.findById(decoded.id);
            if (!user)
                throw new Error('Usuário não encontrado.');
            // Gera o Token Permanente/Longo (ex: 7 dias)
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, phoneWhats: user.phoneWhats, needsOnboarding: !user.name }, JWT_SECRET, { expiresIn: '7d' });
            return { user, accessToken };
        }
        catch (err) {
            throw new Error('Link mágico inválido ou expirado.');
        }
    }
}
exports.AuthUseCase = AuthUseCase;
