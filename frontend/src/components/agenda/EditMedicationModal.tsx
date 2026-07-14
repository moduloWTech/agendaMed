import { useState } from 'react';
import { X, Save, Trash2, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
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

  // State
  const [name, setName] = useState(medication.name || '');
  const [dosage, setDosage] = useState(medication.dosage || '');
  const [instructions, setInstructions] = useState(medication.instructions || '');

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
      await api.put(`/api/medications/${medication.id}`, { name, dosage, instructions });
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

  return (
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

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
            <p className="text-sm text-gray-600 font-medium">Frequência: <span className="text-gray-800 font-bold">{formatFrequency(medication.frequency)}</span></p>
            <p className="text-xs text-gray-400 mt-1">A frequência só pode ser alterada recadastrando o medicamento.</p>
          </div>

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
    </div>
  );
}
