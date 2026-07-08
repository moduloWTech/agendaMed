import { useState, useRef } from 'react';
import { X, Camera, FileText, FlaskConical, Stethoscope, FilePlus2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AddDocumentModalProps {
  onClose: () => void;
}

export function AddDocumentModal({ onClose }: AddDocumentModalProps) {
  const { activePatient } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('recipe');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!activePatient) {
      alert('Selecione um paciente ativo primeiro.');
      return;
    }
    if (!title) {
      alert('Preencha o título do documento.');
      return;
    }

    setIsLoading(true);
    try {
      let finalFileUrl = 'https://example.com/mock-doc.pdf'; // Fallback

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await api.post('/api/upload', formData, {
          isMultipart: true,
        });
        
        if (uploadRes.fileUrl) {
          finalFileUrl = uploadRes.fileUrl;
        }
      }

      await api.post('/api/documents', {
        title,
        category,
        date: new Date(date).toISOString(),
        fileUrl: finalFileUrl,
        patientId: activePatient.id
      });
      window.location.reload();
    } catch (error: any) {
      alert('Erro ao salvar documento: ' + (error.message || 'Erro desconhecido'));
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 animate-in fade-in duration-300">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Novo Documento</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

          {/* Câmera / Área de Foto */}
          <div 
            className="w-full h-40 min-h-[160px] flex-shrink-0 border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 rounded-[32px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors overflow-hidden relative"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="absolute inset-0 group">
                {selectedFile.type.startsWith('image/') ? (
                  <>
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-[30px]"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[30px]">
                      <Camera className="w-10 h-10 text-white mb-2" />
                      <span className="text-white font-semibold text-center px-4">Tocar para trocar a foto</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-black/5">
                    <FileText className="w-10 h-10 text-[var(--color-primary)] mb-2" />
                    <span className="font-medium text-gray-700 px-4 text-center">{selectedFile.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 bg-white rounded-full shadow-sm text-[var(--color-primary)]">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="font-semibold text-[var(--color-primary)]">Tirar foto do documento</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf" 
              className="hidden" 
            />
          </div>

          {/* Nome do Documento */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Detalhes</h3>
            <Input
              label="Título"
              placeholder="Ex: Receita Dr. Silva, Hemograma..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Data */}
          <div>
            <label className="text-gray-700 font-medium text-[15px] ml-1 mb-2 block">Data do Documento</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="text-gray-700 font-medium text-[15px] ml-1 mb-2 block">Categoria</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCategory('recipe')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all ${category === 'recipe' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
              >
                <Stethoscope className="w-6 h-6" />
                <span className="font-semibold text-sm">Receita</span>
              </button>

              <button
                onClick={() => setCategory('exam')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all ${category === 'exam' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
              >
                <FlaskConical className="w-6 h-6" />
                <span className="font-semibold text-sm">Exame</span>
              </button>

              <button
                onClick={() => setCategory('report')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all ${category === 'report' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
              >
                <FileText className="w-6 h-6" />
                <span className="font-semibold text-sm">Laudo</span>
              </button>

              <button
                onClick={() => setCategory('other')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all ${category === 'other' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
              >
                <FilePlus2 className="w-6 h-6" />
                <span className="font-semibold text-sm">Outros</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-[40px]">
          <Button
            fullWidth
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar no Prontuário'}
          </Button>
        </div>

      </div>
    </div>
  );
}
