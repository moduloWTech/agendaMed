"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUseCase = void 0;
const zod_1 = require("zod");
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
}
exports.UserUseCase = UserUseCase;
