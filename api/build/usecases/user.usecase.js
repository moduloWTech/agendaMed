"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUseCase = void 0;
const zod_1 = require("zod");
const whatsapp_service_1 = require("../services/whatsapp.service");
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
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        return user;
    }
    async updateUser(id, data) {
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
        return await this.userRepository.update(id, parsedData);
    }
    async deleteUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        await this.userRepository.delete(id);
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
        if (!admin || admin.role !== 'ADMIN') {
            throw new Error('Apenas administradores podem convidar cuidadores.');
        }
        // Verifica se já existe
        let user = await this.userRepository.findByPhoneWhats(parsedData.phoneWhats);
        if (user) {
            // Se existir, apenas atualiza para vincular ao paciente (se precisar)
            throw new Error('Este número já está cadastrado no sistema.');
        }
        // Cria o usuário Cuidador
        user = await this.userRepository.create({
            phoneWhats: parsedData.phoneWhats,
            name: parsedData.name,
            role: 'CARE_GIVER',
            patientId: parsedData.patientId
        });
        // Envia WhatsApp
        const message = `Olá, ${parsedData.name}! 👋\n\nVocê foi convidado(a) por *${admin.name || 'um administrador'}* para fazer parte da equipe de cuidados de *${parsedData.patientName}* no aplicativo *AgendaMed*.\n\nAcesse o link abaixo para entrar no sistema:\n${process.env.FRONTEND_URL || 'http://localhost:5173'}\n\nLá, basta digitar o seu número de telefone para acessar a conta.`;
        try {
            await whatsapp_service_1.whatsappService.sendMessage(parsedData.phoneWhats, message);
        }
        catch (e) {
            console.error('Erro ao enviar mensagem de convite no WhatsApp', e);
        }
        return user;
    }
    async getCaregivers(patientId) {
        return await this.userRepository.findByPatientId(patientId);
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
        return await this.userRepository.update(targetUserId, { role: parsedData.newRole });
    }
}
exports.UserUseCase = UserUseCase;
