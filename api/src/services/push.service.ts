import webpush from 'web-push';
import { prisma } from '../DB/prisma.config';

export class PushService {
  constructor() {
    const publicKey = process.env.VAPID_PUBLIC_KEY || '';
    const privateKey = process.env.VAPID_PRIVATE_KEY || '';
    
    // Sujeito é tipicamente um URL ou "mailto:admin@dominio.com"
    webpush.setVapidDetails(
      'mailto:suporte@agendamed.com',
      publicKey,
      privateKey
    );
  }

  async saveSubscription(userId: string, subscription: any) {
    // A estrutura do subscription que vem do navegador tem endpoint e keys (p256dh e auth)
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys) {
      throw new Error('Assinatura inválida');
    }

    // Busca se já existe
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    });

    if (existing) {
      // Atualiza caso pertença a outro usuário (embora improvável) ou apenas atualiza chaves
      await prisma.pushSubscription.update({
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
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    });
  }

  async sendNotificationToUsers(userIds: string[], payload: any) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } }
    });

    const notifications = subscriptions.map(async (sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // A assinatura expirou ou não é mais válida, vamos deletá-la
          console.log(`[WebPush] Assinatura inativa removida para endpoint: ${sub.endpoint}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('[WebPush] Falha ao enviar notificação:', error);
        }
      }
    });

    await Promise.allSettled(notifications);
  }
}

export const pushService = new PushService();
