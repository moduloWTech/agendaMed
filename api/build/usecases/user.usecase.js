"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUseCase = void 0;
const zod_1 = require("zod");
const prisma_config_1 = require("../DB/prisma.config");
class UserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(data) {
        // Regra de Negócio: Validação estrita via Zod
        const schema = zod_1.z.object({
            phoneWhats: zod_1.z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos'),
            name: zod_1.z.string().optional(),
            email: zod_1.z.string().email('E-mail inválido').optional(),
            role: zod_1.z.string().optional(),
        });
        const parsedData = schema.parse(data);
        // Regra de Negócio: Verificar se o usuário já existe
        const existingUser = await this.userRepository.findByPhoneWhats(parsedData.phoneWhats);
        if (existingUser) {
            throw new Error('Telefone já cadastrado na plataforma.');
        }
        if (parsedData.email) {
            const existingEmail = await this.userRepository.findByEmail(parsedData.email);
            if (existingEmail)
                throw new Error('E-mail já cadastrado na plataforma.');
        }
        // Regras de negócio passaram, enviar para o repositório salvar
        return await this.userRepository.create(parsedData);
    }
    async getUserById(id, tenantId) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        if (tenantId && user.tenantId !== tenantId) {
            throw new Error('Acesso negado. O usuário não pertence à sua família.');
        }
        return user;
    }
    async updateUser(id, data, tenantId) {
        const schema = zod_1.z.object({
            phoneWhats: zod_1.z.string().optional(),
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
            email: zod_1.z.string().email('E-mail inválido').optional(),
            role: zod_1.z.string().optional(),
        });
        const parsedData = schema.parse(data);
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        if (tenantId && user.tenantId !== tenantId) {
            throw new Error('Acesso negado. O usuário não pertence à sua família.');
        }
        return await this.userRepository.update(id, parsedData);
    }
    async deleteUser(requesterId, targetId, tenantId) {
        const requester = await this.userRepository.findById(requesterId);
        if (!requester || requester.role !== 'ADMIN') {
            throw new Error('Apenas administradores podem remover membros da equipe.');
        }
        if (requesterId === targetId) {
            throw new Error('Você não pode remover a si mesmo.');
        }
        const targetUser = await this.userRepository.findById(targetId);
        if (!targetUser) {
            throw new Error('Usuário não encontrado.');
        }
        const effectiveTenantId = tenantId || requester.tenantId;
        if (effectiveTenantId && targetUser.tenantId && targetUser.tenantId !== effectiveTenantId) {
            throw new Error('Acesso negado. O usuário não pertence à sua família.');
        }
        // Verifica se é o dono do Tenant
        if (targetUser.tenantId) {
            const tenant = await prisma_config_1.prisma.tenant.findUnique({ where: { id: targetUser.tenantId } });
            if (tenant && tenant.ownerId === targetId) {
                throw new Error('O proprietário da conta não pode ser removido.');
            }
        }
        // Remove a vinculação do usuário com o Tenant e Pacientes
        await prisma_config_1.prisma.user.update({
            where: { id: targetId },
            data: {
                tenantId: null,
                patients: {
                    set: []
                }
            }
        });
        // Tenta deletar fisicamente o usuário se não houver impedimentos de chave estrangeira (ex: histórico)
        try {
            await this.userRepository.delete(targetId);
        }
        catch (e) {
            // Se houver histórico mantem o registro preservado mas 100% desvinculado do grupo
        }
    }
    async updatePreferences(id, data) {
        const schema = zod_1.z.object({
            defaultIntensiveAlerts: zod_1.z.boolean().optional(),
            defaultAlertAdvance: zod_1.z.string().optional(),
            syncGoogle: zod_1.z.boolean().optional(),
            darkMode: zod_1.z.boolean().optional(),
        });
        const parsedData = schema.parse(data);
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        return await this.userRepository.update(id, parsedData);
    }
    async inviteCaregiver(adminId, data) {
        const schema = zod_1.z.object({
            phoneWhats: zod_1.z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos'),
            name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
            patientId: zod_1.z.string().uuid('ID do paciente inválido'),
            patientName: zod_1.z.string() // para enviar na mensagem
        });
        const parsedData = schema.parse(data);
        // Valida admin
        const admin = await this.userRepository.findById(adminId);
        if (!admin || admin.role !== 'ADMIN' || !admin.tenantId) {
            throw new Error('Apenas administradores de família podem convidar cuidadores.');
        }
        // Verifica se já existe
        let user = await this.userRepository.findByPhoneWhats(parsedData.phoneWhats);
        if (user) {
            throw new Error('Este número já está cadastrado no sistema.');
        }
        // Gera Token JWT para o convite (duração 48 horas)
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
        const inviteToken = jwt.sign({
            tenantId: admin.tenantId,
            patientId: parsedData.patientId,
            invitedPhone: parsedData.phoneWhats,
            invitedName: parsedData.name
        }, JWT_SECRET, { expiresIn: '48h' });
        // Monta a mensagem de WhatsApp
        const message = `Olá, ${parsedData.name}! 👋\n\nVocê foi convidado(a) por *${admin.name || 'um administrador'}* para fazer parte da equipe de cuidados de *${parsedData.patientName}* no aplicativo *AgendaMed*.\n\nAcesse o link abaixo para criar sua conta de cuidador(a):\n${process.env.FRONTEND_URL || 'http://localhost:5173'}/convite?token=${inviteToken}`;
        // Formata o número (remover caracteres especiais e adicionar 55 se precisar)
        let numericPhone = parsedData.phoneWhats.replace(/\D/g, '');
        if (numericPhone.length === 10 || numericPhone.length === 11) {
            numericPhone = `55${numericPhone}`;
        }
        // Gera o Deep Link
        const inviteLink = `https://wa.me/${numericPhone}?text=${encodeURIComponent(message)}`;
        return { success: true, message: 'Convite gerado com sucesso.', inviteLink };
    }
    async getCaregivers(patientId, tenantId) {
        const users = await this.userRepository.findByPatientId(patientId);
        if (tenantId) {
            return users.filter(u => u.tenantId === tenantId);
        }
        return users;
    }
    async changeUserRole(adminId, targetUserId, newRole) {
        const schema = zod_1.z.object({
            newRole: zod_1.z.enum(['ADMIN', 'CARE_GIVER'])
        });
        const parsedData = schema.parse({ newRole });
        if (adminId === targetUserId) {
            throw new Error('Você não pode alterar o seu próprio cargo.');
        }
        const admin = await this.userRepository.findById(adminId);
        if (!admin || admin.role !== 'ADMIN') {
            throw new Error('Apenas administradores podem alterar cargos.');
        }
        const targetUser = await this.userRepository.findById(targetUserId);
        if (!targetUser) {
            throw new Error('Usuário alvo não encontrado.');
        }
        if (targetUser.tenantId !== admin.tenantId) {
            throw new Error('O usuário não pertence à sua família.');
        }
        return await this.userRepository.update(targetUserId, { role: parsedData.newRole });
    }
}
exports.UserUseCase = UserUseCase;
