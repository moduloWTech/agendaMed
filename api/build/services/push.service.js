"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushService = exports.PushService = void 0;
const web_push_1 = __importDefault(require("web-push"));
const prisma_config_1 = require("../DB/prisma.config");
class PushService {
    constructor() {
        const publicKey = process.env.VAPID_PUBLIC_KEY?.replace(/"/g, '') || '';
        const privateKey = process.env.VAPID_PRIVATE_KEY?.replace(/"/g, '') || '';
        if (publicKey && privateKey) {
            try {
                // Sujeito é tipicamente um URL ou "mailto:admin@dominio.com"
                web_push_1.default.setVapidDetails('mailto:suporte@agendamed.com', publicKey, privateKey);
            }
            catch (err) {
                console.error('[WebPush] Erro ao configurar VAPID details. Chaves inválidas?', err);
            }
        }
        else {
            console.warn('[WebPush] ATENÇÃO: Chaves VAPID ausentes no .env. O sistema de Notificações Push está inoperante.');
        }
    }
    async saveSubscription(userId, subscription) {
        // A estrutura do subscription que vem do navegador tem endpoint e keys (p256dh e auth)
        const { endpoint, keys } = subscription;
        if (!endpoint || !keys) {
            throw new Error('Assinatura inválida');
        }
        // Busca se já existe
        const existing = await prisma_config_1.prisma.pushSubscription.findUnique({
            where: { endpoint }
        });
        if (existing) {
            // Atualiza caso pertença a outro usuário (embora improvável) ou apenas atualiza chaves
            await prisma_config_1.prisma.pushSubscription.update({
                where: { id: existing.id },
                data: {
                    userId,
                    p256dh: keys.p256dh,
                    auth: keys.auth
                }
            });
            return;
        }
        // Cria nova assinatura
        await prisma_config_1.prisma.pushSubscription.create({
            data: {
                userId,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth
            }
        });
    }
    async sendNotificationToUsers(userIds, payload) {
        const subscriptions = await prisma_config_1.prisma.pushSubscription.findMany({
            where: { userId: { in: userIds } }
        });
        const notifications = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            try {
                await web_push_1.default.sendNotification(pushSubscription, JSON.stringify(payload));
            }
            catch (error) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // A assinatura expirou ou não é mais válida, vamos deletá-la
                    console.log(`[WebPush] Assinatura inativa removida para endpoint: ${sub.endpoint}`);
                    await prisma_config_1.prisma.pushSubscription.delete({ where: { id: sub.id } });
                }
                else {
                    console.error('[WebPush] Falha ao enviar notificação:', error);
                }
            }
        });
        await Promise.allSettled(notifications);
    }
}
exports.PushService = PushService;
exports.pushService = new PushService();
