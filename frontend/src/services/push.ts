import { api } from './api';

// Utility to convert Base64 URL to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Web Push não é suportado neste navegador.');
    return;
  }

  try {
    // Aguarda o Service Worker ser registrado automaticamente pelo plugin do Vite PWA
    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker recuperado com sucesso!');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permissão para notificações não foi concedida.');
      return;
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VITE_VAPID_PUBLIC_KEY não está configurada.');
      return;
    }
    
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Usa userVisibleOnly: true para notificações que sempre mostram algo ao usuário
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    console.log('Push Subscription gerada com sucesso.');

    // Enviar a inscrição para o Backend
    await api.post('/api/push/subscribe', subscription.toJSON());
    console.log('Push Subscription enviada ao servidor.');

  } catch (error) {
    console.error('Falha ao assinar notificações Push:', error);
  }
}
