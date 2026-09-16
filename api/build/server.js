"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const env_1 = require("./config/env");
(0, env_1.validateRequiredEnv)(['JWT_SECRET', 'CRON_SECRET']);
const server = new app_1.App();
server.start();
