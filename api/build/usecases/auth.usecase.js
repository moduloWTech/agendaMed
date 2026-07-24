"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUseCase = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const google_auth_library_1 = require("google-auth-library");
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
class AuthUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(data) {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
            email: zod_1.z.string().email('E-mail inválido'),
            phoneWhats: zod_1.z.string().min(10, 'Telefone inválido'),
            password: zod_1.z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
        });
        const parsed = schema.parse(data);
        // Verifica se email ou telefone já existem
        const existingUserByEmail = await this.userRepository.findByEmail(parsed.email);
        if (existingUserByEmail)
            throw new Error('E-mail já cadastrado.');
        const existingUserByPhone = await this.userRepository.findByPhoneWhats(parsed.phoneWhats);
        if (existingUserByPhone)
            throw new Error('Telefone já cadastrado.');
        const passwordHash = await bcrypt_1.default.hash(parsed.password, 10);
        // B2C: Cria o Tenant (Conta) e o Usuário Admin
        const tenantName = `Família de ${parsed.name.split(' ')[0]}`;
        // Precisamos usar transação para garantir que ambos criem
        const result = await this.userRepository.createAdminWithTenant({
            name: parsed.name,
            email: parsed.email,
            phoneWhats: parsed.phoneWhats,
            passwordHash: passwordHash
        }, tenantName);
        const accessToken = jsonwebtoken_1.default.sign({ id: result.user.id, role: result.user.role, tenantId: result.user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
        return { user: result.user, accessToken };
    }
    async login(data) {
        const schema = zod_1.z.object({
            email: zod_1.z.string().email('E-mail inválido'),
            password: zod_1.z.string().min(1, 'Senha é obrigatória'),
        });
        const parsed = schema.parse(data);
        const user = await this.userRepository.findByEmail(parsed.email);
        if (!user || !user.passwordHash) {
            throw new Error('E-mail ou senha incorretos.');
        }
        const isMatch = await bcrypt_1.default.compare(parsed.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('E-mail ou senha incorretos.');
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
        return { user, accessToken };
    }
    async loginWithGoogle(credential) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId)
            throw new Error('Servidor não configurado para Login com Google.');
        const client = new google_auth_library_1.OAuth2Client(clientId);
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId,
            });
            payload = ticket.getPayload();
        }
        catch (e) {
            throw new Error('Token do Google inválido ou expirado.');
        }
        if (!payload || !payload.email) {
            throw new Error('Não foi possível obter o e-mail do Google.');
        }
        const { email, name } = payload;
        // Procura usuário
        let user = await this.userRepository.findByEmail(email);
        if (!user) {
            // Cria usuário Admin B2C automaticamente (Não exige senha)
            const tenantName = `Família de ${name?.split(' ')[0] || 'Novo Usuário'}`;
            const dummyPhone = `google-${Date.now()}`;
            const result = await this.userRepository.createAdminWithTenant({
                name: name || 'Usuário do Google',
                email: email,
                phoneWhats: dummyPhone,
                passwordHash: null // Não tem senha!
            }, tenantName);
            user = result.user;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
        return { user, accessToken };
    }
    async acceptInvite(data) {
        const schema = zod_1.z.object({
            token: zod_1.z.string(),
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
            email: zod_1.z.string().email('E-mail inválido'),
            phoneWhats: zod_1.z.string().min(10, 'Telefone inválido'),
            password: zod_1.z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
        });
        const parsed = schema.parse(data);
        // Valida o Token de Convite
        let inviteData;
        try {
            inviteData = jsonwebtoken_1.default.verify(parsed.token, JWT_SECRET);
        }
        catch (e) {
            console.error('JWT VERIFY ERROR:', e);
            throw new Error(`Convite inválido ou expirado. Detalhe: ${e.message}`);
        }
        if (!inviteData.tenantId) {
            throw new Error('Convite inválido (Tenant ausente).');
        }
        // Verifica se email ou telefone já existem
        const existingUserByEmail = await this.userRepository.findByEmail(parsed.email);
        if (existingUserByEmail)
            throw new Error('E-mail já cadastrado.');
        const existingUserByPhone = await this.userRepository.findByPhoneWhats(parsed.phoneWhats);
        if (existingUserByPhone)
            throw new Error('Telefone já cadastrado.');
        const passwordHash = await bcrypt_1.default.hash(parsed.password, 10);
        // Cria o usuário Cuidador atrelado ao Tenant do convite
        const user = await this.userRepository.create({
            name: parsed.name,
            email: parsed.email,
            phoneWhats: parsed.phoneWhats,
            passwordHash: passwordHash,
            role: 'CARE_GIVER',
            tenantId: inviteData.tenantId,
            patientId: inviteData.patientId
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
        return { user, accessToken };
    }
}
exports.AuthUseCase = AuthUseCase;
