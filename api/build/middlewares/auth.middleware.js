"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_config_1 = require("../DB/prisma.config");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
async function authMiddleware(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Token não fornecido', message: 'Token não fornecido' });
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return reply.status(401).send({ error: 'Token mal formatado', message: 'Token mal formatado' });
        }
        const token = parts[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.id || decoded.userId || decoded.sub;
        if (!userId) {
            return reply.status(401).send({ error: 'Token inválido', message: 'Identificador ausente no token' });
        }
        // Valida se o usuário ainda existe no banco de dados e se ainda pertence a uma família ativa
        const activeUser = await prisma_config_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, tenantId: true }
        });
        if (!activeUser || !activeUser.tenantId) {
            return reply.status(401).send({
                error: 'Acesso revogado ou conta desvinculada',
                message: 'Seu acesso a esta família foi revogado pelo administrador.'
            });
        }
        // Anexa os dados do usuário atualizados ao request para uso nos handlers
        request.user = {
            ...decoded,
            id: activeUser.id,
            role: activeUser.role,
            tenantId: activeUser.tenantId
        };
    }
    catch (error) {
        return reply.status(401).send({
            error: 'Token inválido ou expirado',
            message: 'Sua sessão expirou. Faça login novamente.'
        });
    }
}
