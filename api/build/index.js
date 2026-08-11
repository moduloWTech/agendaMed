"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const appInstance = new app_1.App();
appInstance.registerMiddlewares();
appInstance.registerRoutes();
exports.default = async (req, res) => {
    await appInstance.getServer().ready();
    appInstance.getServer().server.emit('request', req, res);
};
