import { Camera, Image as ImageIcon, Check, X } from 'lucide-react';
import React, { useRef } from 'react';

interface Step2PhotoProps {
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null> | any;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
}

export function Step2Photo({ selectedFile, fileInputRef, handleFileChange }: Step2PhotoProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const clearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange({ target: { files: [] } });
  }

  return (
    <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300 h-full">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Foto da Caixa</h3>
        <p className="text-gray-500 text-sm mb-4">Ajuda o cuidador a não confundir os remédios.</p>
      </div>

      <div className="flex-1 min-h-[200px] flex flex-col relative">
        {selectedFile ? (
          <div 
            className="w-full h-full min-h-[200px] border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 rounded-[32px] overflow-hidden relative cursor-pointer group"
            onClick={clearPhoto}
          >
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-10 h-10 text-white mb-2" />
              <span className="text-white font-semibold text-center px-4">Tocar para remover</span>
            </div>
            {/* Ícone fixo no canto para indicar sucesso */}
            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 shadow-md group-hover:opacity-0 transition-opacity">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full h-full justify-center">
            <button 
              onClick={() => cameraInputRef.current?.click()} 
              className="flex items-center justify-center gap-3 bg-[var(--color-primary)] text-white p-5 rounded-[24px] shadow-lg shadow-[var(--color-primary)]/20 hover:bg-[var(--color-accent)] transition-all active:scale-95"
            >
              <Camera className="w-6 h-6" />
              <span className="font-semibold text-lg">Tirar Foto Agora</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">OU</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center justify-center gap-3 bg-white border-2 border-[var(--color-primary)]/20 text-[var(--color-primary)] p-5 rounded-[24px] shadow-sm hover:bg-[var(--color-primary)]/5 transition-all active:scale-95"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="font-semibold text-lg">Escolher da Galeria</span>
            </button>
          </div>
        )}
        
        {/* Input genérico para galeria */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Input forçando a câmera do dispositivo */}
        <input 
          type="file" 
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*" 
          capture="environment"
          className="hidden" 
        />
      </div>
    </div>
  );
}
