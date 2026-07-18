import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Trash2, Clock, CheckCircle2, RotateCcw, Plus, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FeedbackModal } from '../ui/FeedbackModal';

interface EditMedicationModalProps {
  medication: any;
  uniqueId: string;
  isCompleted: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onToggleCheckin: (medicationId: string, time: string, uniqueId: string) => Promise<void>;
}

export function EditMedicationModal({ medication, uniqueId, isCompleted, onClose, onRefresh, onToggleCheckin }: EditMedicationModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isOpen: boolean; title: string; message: string; type: 'success'|'error'|'warning'|'info' }>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const [name, setName] = useState(medication.name || '');
  const [dosage, setDosage] = useState(medication.dosage || '');
  const [instructions, setInstructions] = useState(medication.instructions || '');

  const [frequency, setFrequency] = useState(medication.frequency || 'daily');
  const [startDate, setStartDate] = useState(medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(medication.startTime || '08:00');
  const [times, setTimes] = useState<string[]>(medication.times && medication.times.length > 0 ? medication.times : ['08:00']);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(medication.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAddTime = () => setTimes([...times, '12:00']);
  const handleRemoveTime = (index: number) => setTimes(times.filter((_, i) => i !== index));
  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.')) return;
    setIsLoading(true);
    try {
      await api.delete(`/api/medications/${medication.id}`);
      onRefresh();
      onClose();
    } catch (error: any) {
      setFeedback({ isOpen: true, title: 'Erro', message: error.message || 'Erro ao excluir.', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !dosage) {
      setFeedback({ isOpen: true, title: 'Incompleto', message: 'Preencha nome e dosagem.', type: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      let uploadedPhotoUrl = photoUrl;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/api/upload', formData, {
          isMultipart: true
        });
        if (uploadRes.fileUrl) {
          uploadedPhotoUrl = uploadRes.fileUrl;
        }
      }

      await api.put(`/api/medications/${medication.id}`, { 
        name, 
        dosage, 
        instructions,
        frequency,
        startDate: frequency === 'manual' ? new Date().toISOString() : new Date(startDate).toISOString(),
        startTime: frequency === 'manual' ? times[0] : startTime,
        times: frequency === 'manual' ? times : [],
        photoUrl: uploadedPhotoUrl
      });
      onRefresh();
      onClose();
    } catch (error: any) {
      setFeedback({ isOpen: true, title: 'Erro', message: error.message || 'Erro ao salvar.', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);
    await onToggleCheckin(medication.id, uniqueId.split('-').pop() as string, uniqueId);
    setIsLoading(false);
    onClose();
  };

  const formatFrequency = (freq?: string) => {
    if (freq === '8h') return 'De 8 em 8 horas';
    if (freq === '12h') return 'De 12 em 12 horas';
    if (freq === 'daily') return '1 vez ao dia';
    if (freq === 'manual') return 'Horários manuais';
    return 'Uso único';
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">
              {isAdmin ? 'Editar Medicamento' : 'Detalhes do Medicamento'}
            </h2>
            {!isAdmin && <p className="text-sm text-gray-500 mt-1">Modo de visualização (Apenas Administradores podem editar)</p>}
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-gray-800 transition-colors self-start">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">
          
          <div className="bg-[#F8FAFC] p-5 rounded-[24px] flex items-center justify-between border border-gray-100">
            <div>
              <p className="text-gray-500 text-sm font-medium">Horário da Dose</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-xl font-bold text-gray-800">{uniqueId.split('-').pop()}</span>
              </div>
            </div>
            <button 
              onClick={handleToggle}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-sm transition-all
                ${isCompleted 
                  ? 'bg-red-50 text-[var(--color-alert)] border border-red-100 hover:bg-red-100' 
                  : 'bg-[var(--color-success)] text-white shadow-[var(--color-success)]/20 hover:scale-105 active:scale-95'}`}
            >
              {isCompleted ? <RotateCcw className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {isCompleted ? 'Desfazer' : 'Confirmar'}
            </button>
          </div>

          <Input
            label="Nome do Remédio"
            placeholder="Ex: Losartana"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
          />

          {/* Seção da Foto */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium text-[15px] ml-1">Foto da Caixa</label>
            <div className="flex-1 min-h-[150px] border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 rounded-[24px] overflow-hidden relative group">
              {(selectedFile || photoUrl) ? (
                <div 
                  className="w-full h-[150px] relative cursor-pointer"
                  onClick={() => {
                    if (isAdmin) {
                      setSelectedFile(null);
                      setPhotoUrl(null);
                    }
                  }}
                >
                  <img 
                    src={selectedFile ? URL.createObjectURL(selectedFile) : photoUrl!} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  {isAdmin && selectedFile && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-10 h-10 text-white mb-2" />
                      <span className="text-white font-semibold text-center px-4">Tocar para remover</span>
                    </div>
                  )}
                  {isAdmin && !selectedFile && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white mb-2" />
                      <span className="text-white font-semibold text-center px-4">Nova foto substituirá a atual</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex w-full h-[150px] items-center justify-center gap-2">
                  {isAdmin ? (
                    <>
                      <button 
                        onClick={() => cameraInputRef.current?.click()} 
                        className="flex flex-col items-center justify-center flex-1 h-full gap-2 hover:bg-[var(--color-primary)]/10 transition-colors"
                      >
                        <Camera className="w-6 h-6 text-[var(--color-primary)]" />
                        <span className="text-xs font-semibold text-[var(--color-primary)]">Câmera</span>
                      </button>
                      <div className="w-px h-16 bg-[var(--color-primary)]/20" />
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex flex-col items-center justify-center flex-1 h-full gap-2 hover:bg-[var(--color-primary)]/10 transition-colors"
                      >
                        <ImageIcon className="w-6 h-6 text-[var(--color-primary)]" />
                        <span className="text-xs font-semibold text-[var(--color-primary)]">Galeria</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2 h-full">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-sm">Sem foto</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              capture="environment"
              className="hidden" 
            />
          </div>
          <Input
            label="Dosagem (Ex: 50mg)"
            placeholder="Ex: 50mg"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            disabled={!isAdmin}
          />
          <Input
            label="Instruções (Ex: 1 comprimido)"
            placeholder="Ex: 1 comprimido"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            disabled={!isAdmin}
          />

          {isAdmin ? (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-[15px] ml-1">Frequência</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-lg outline-none transition-all cursor-pointer"
                >
                  <option value="4h">A cada 4 horas</option>
                  <option value="6h">A cada 6 horas</option>
                  <option value="8h">A cada 8 horas</option>
                  <option value="12h">A cada 12 horas</option>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="single">Dose Única</option>
                  <option value="manual">Adicionar horários manualmente</option>
                </select>
              </div>

              {frequency === 'manual' ? (
                <div className="flex flex-col gap-3">
                  <label className="text-gray-700 font-medium text-[15px] ml-1">Quais horários?</label>
                  {times.map((time, index) => (
                    <div key={index} className="flex items-center gap-3 bg-[#F8FAFC] p-2 pr-4 rounded-[24px] border border-gray-100">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(index, e.target.value)}
                        className="flex-1 bg-transparent text-xl font-bold text-gray-800 outline-none px-4 py-2"
                      />
                      {times.length > 1 && (
                        <button
                          onClick={() => handleRemoveTime(index)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddTime}
                    className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-[24px] text-gray-500 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Adicionar outro horário
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-medium text-[15px] ml-1">Data de Início</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-medium text-[15px] ml-1">Horário Base</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all cursor-pointer text-center"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
              <p className="text-sm text-gray-600 font-medium">Frequência: <span className="text-gray-800 font-bold">{formatFrequency(medication.frequency)}</span></p>
              <p className="text-xs text-gray-400 mt-1">Apenas administradores podem editar os horários e frequências do medicamento.</p>
            </div>
          )}

        </div>

        {isAdmin && (
          <div className="p-6 border-t border-gray-100 bg-white rounded-b-[40px] flex gap-3">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 text-[var(--color-alert)] hover:bg-red-50 hover:border-red-100"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-5 h-5" /> Excluir
            </Button>
            <Button
              className="flex-[2] flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)]"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="w-5 h-5" /> Salvar
            </Button>
          </div>
        )}
      </div>

      <FeedbackModal 
        isOpen={feedback.isOpen}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
      />
    </div>,
    document.body
  );
}
