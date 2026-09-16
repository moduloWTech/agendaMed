"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequiredEnv = getRequiredEnv;
exports.validateRequiredEnv = validateRequiredEnv;
function getRequiredEnv(name) {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória não configurada: ${name}`);
    }
    return value;
}
function validateRequiredEnv(names) {
    names.forEach(getRequiredEnv);
}
