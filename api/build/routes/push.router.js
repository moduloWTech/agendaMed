"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushRouter = void 0;
const push_service_1 = require("../services/push.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
class PushRouter {
    register(app) {
        app.register(async (scopedApp) => {
            // Aplicamos o middleware de autenticação em todas as rotas deste plugin
            scopedApp.addHook('preHandler', auth_middleware_1.authMiddleware);
            scopedApp.post('/api/push/subscribe', async (request, reply) => {
                try {
                    const userId = request.user.id;
                    const subscription = request.body;
                    await push_service_1.pushService.saveSubscription(userId, subscription);
                    return reply.status(200).send({ success: true });
                }
                catch (error) {
                    app.log.error(error);
                    return reply.status(400).send({ error: error.message });
                }
            });
        });
    }
}
exports.PushRouter = PushRouter;
