"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappRouter = void 0;
const whatsapp_service_1 = require("../services/whatsapp.service");
class WhatsappRouter {
    register(app) {
        // Rota que retorna o status da conexão e o QR Code, se houver
        app.get('/api/whatsapp/status', async (request, reply) => {
            try {
                const status = whatsapp_service_1.whatsappService.getStatus();
                return reply.status(200).send(status);
            }
            catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Falha ao buscar status do WhatsApp' });
            }
        });
    }
}
exports.WhatsappRouter = WhatsappRouter;
