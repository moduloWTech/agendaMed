import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mwt-2026';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
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
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Anexa os dados do usuário ao request para uso nos handlers
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido ou expirado' });
  }
}
