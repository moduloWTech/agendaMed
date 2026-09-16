import 'dotenv/config';
import { App } from './app';
import { validateRequiredEnv } from './config/env';

validateRequiredEnv(['JWT_SECRET', 'CRON_SECRET']);
const appInstance = new App();
appInstance.registerMiddlewares();
appInstance.registerRoutes();

export default async (req: any, res: any) => {
  await appInstance.getServer().ready();
  appInstance.getServer().server.emit('request', req, res);
};
