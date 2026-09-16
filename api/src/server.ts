import 'dotenv/config';
import { App } from './app';
import { validateRequiredEnv } from './config/env';

validateRequiredEnv(['JWT_SECRET', 'CRON_SECRET']);
const server = new App();

server.start();
