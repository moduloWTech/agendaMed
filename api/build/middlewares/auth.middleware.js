"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';
async function authMiddleware(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Token não fornecido' });
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return reply.status(401).send({ error: 'Token mal formatado' });
        }
        const token = parts[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Anexa os dados do usuário ao request para uso nos handlers
        request.user = decoded;
    }
    catch (error) {
        return reply.status(401).send({ error: 'Token inválido ou expirado' });
    }
}
