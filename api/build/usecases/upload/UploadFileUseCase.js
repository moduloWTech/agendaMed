"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileUseCase = void 0;
const supabase_1 = require("../../lib/supabase");
const crypto_1 = __importDefault(require("crypto"));
class UploadFileUseCase {
    async execute({ filename, mimetype, buffer }) {
        // Generate a unique file name to avoid collisions
        const fileExtension = filename.split('.').pop();
        const uniqueFileName = `${crypto_1.default.randomUUID()}.${fileExtension}`;
        const filePath = `uploads/${uniqueFileName}`;
        const { data, error } = await supabase_1.supabase.storage
            .from('agendamed-arquivos')
            .upload(filePath, buffer, {
            contentType: mimetype,
            upsert: false,
        });
        if (error) {
            console.error('Falha no upload para o Supabase:', error);
            throw new Error('Falha ao fazer o upload do arquivo para o Storage.');
        }
        // Get public URL
        const { data: publicUrlData } = supabase_1.supabase.storage
            .from('agendamed-arquivos')
            .getPublicUrl(data.path);
        return { fileUrl: publicUrlData.publicUrl };
    }
}
exports.UploadFileUseCase = UploadFileUseCase;
