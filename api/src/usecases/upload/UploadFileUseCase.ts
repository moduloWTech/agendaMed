import { supabase } from '../../lib/supabase';
import crypto from 'crypto';

interface UploadFileInput {
  filename: string;
  mimetype: string;
  buffer: Buffer;
}

export class UploadFileUseCase {
  async execute({ filename, mimetype, buffer }: UploadFileInput): Promise<{ fileUrl: string }> {
    // Generate a unique file name to avoid collisions
    const fileExtension = filename.split('.').pop();
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `uploads/${uniqueFileName}`;

    const { data, error } = await supabase.storage
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
    const { data: publicUrlData } = supabase.storage
      .from('agendamed-arquivos')
      .getPublicUrl(data.path);

    return { fileUrl: publicUrlData.publicUrl };
  }
}
