import { Camera, Check } from 'lucide-react';
import React from 'react';

interface Step2PhotoProps {
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Step2Photo({ selectedFile, fileInputRef, handleFileChange }: Step2PhotoProps) {
  return (
    <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300 h-full">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Foto da Caixa</h3>
        <p className="text-gray-500 text-sm mb-4">Ajuda o cuidador a não confundir os remédios.</p>
      </div>

      <div 
        className="flex-1 min-h-[200px] border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 rounded-[32px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors overflow-hidden relative"
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFile ? (
          <div className="absolute inset-0 group">
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-[30px]"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[30px]">
              <Camera className="w-10 h-10 text-white mb-2" />
              <span className="text-white font-semibold text-center px-4">Tocar para trocar a foto</span>
            </div>
            {/* Ícone fixo no canto para indicar sucesso */}
            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 shadow-md group-hover:opacity-0 transition-opacity">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-white rounded-full shadow-sm text-[var(--color-primary)]">
              <Camera className="w-8 h-8" />
            </div>
            <span className="font-semibold text-[var(--color-primary)] text-center px-4">Tirar foto agora ou escolher galeria</span>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
}
