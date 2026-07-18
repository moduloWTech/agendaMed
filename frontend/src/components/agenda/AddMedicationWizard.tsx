import { useState, useRef } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FeedbackModal } from '../ui/FeedbackModal';
import { Step1BasicInfo } from './wizard/Step1BasicInfo';
import { Step2Photo } from './wizard/Step2Photo';
import { Step3Frequency } from './wizard/Step3Frequency';

interface AddMedicationWizardProps {
  onClose: () => void;
}

export function AddMedicationWizard({ onClose }: AddMedicationWizardProps) {
  const { activePatient } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<{ isOpen: boolean; title: string; message: string; type: 'success'|'error'|'warning'|'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // States
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');

  // Novos estados para a Lógica de Frequência
  const [frequency, setFrequency] = useState('8h');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');

  // Estados para modo manual
  const [times, setTimes] = useState<string[]>(['08:00']);
  const handleAddTime = () => setTimes([...times, '12:00']);
  const handleRemoveTime = (index: number) => setTimes(times.filter((_, i) => i !== index));
  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  // Lógica fictícia para mostrar a próxima dose baseada no intervalo
  const getNextDoseText = () => {
    if(frequency === 'manual') return 'Os alarmes tocarão apenas nos horários exatos que você definiu acima.';
    if(frequency === 'single') return 'Um único alarme soará na data e horário marcados. Não haverá repetição.';
    if(frequency === 'daily') return `O alarme soará todos os dias a partir de ${new Date(startDate).toLocaleDateString('pt-BR')} às ${startTime}.`;
    if(frequency === 'weekly') return `O alarme soará uma vez por semana (no mesmo dia da semana de ${new Date(startDate).toLocaleDateString('pt-BR')}) às ${startTime}.`;
    if(frequency === 'monthly') return `O alarme soará todo mês no mesmo dia que a data escolhida (${new Date(startDate).toLocaleDateString('pt-BR')}) às ${startTime}.`;
    
    return `Calcularemos os próximos horários baseados na data ${new Date(startDate).toLocaleDateString('pt-BR')} às ${startTime}. Alarmes antigos não soarão.`;
  };

  const handleFinish = async () => {
    if (!activePatient) {
      setFeedback({
        isOpen: true,
        title: 'Atenção',
        message: 'Selecione um paciente ativo primeiro.',
        type: 'warning'
      });
      return;
    }
    if (!name || !dosage) {
      setFeedback({
        isOpen: true,
        title: 'Dados Incompletos',
        message: 'Preencha o nome e a dosagem do medicamento.',
        type: 'warning'
      });
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await api.post('/api/upload', formData, {
          isMultipart: true,
        });
        
        if (uploadRes.fileUrl) {
          photoUrl = uploadRes.fileUrl;
        }
      }

      await api.post('/api/medications', {
        name,
        dosage,
        instructions,
        frequency,
        startDate: frequency === 'manual' ? new Date().toISOString() : new Date(startDate).toISOString(),
        startTime: frequency === 'manual' ? times[0] : startTime,
        times: frequency === 'manual' ? times : [],
        patientId: activePatient.id,
        photoUrl,
        active: true
      });
      window.location.reload(); // Recarrega a tela para buscar novos dados
    } catch (error: any) {
      setFeedback({
        isOpen: true,
        title: 'Erro ao Salvar',
        message: error.message || 'Ocorreu um erro desconhecido.',
        type: 'error'
      });
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container (Bottom Sheet no mobile, Modal no desktop) */}
      <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">Novo Remédio</h2>
            <div className="flex gap-1 mt-2">
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-gray-800 transition-colors self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

          {/* Passo 1: Informações Básicas */}
          {step === 1 && (
            <Step1BasicInfo 
              name={name} setName={setName}
              dosage={dosage} setDosage={setDosage}
              instructions={instructions} setInstructions={setInstructions}
            />
          )}

          {/* Passo 2: Foto */}
          {step === 2 && (
            <Step2Photo
              selectedFile={selectedFile}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
            />
          )}

          {/* Passo 3: Horários */}
          {step === 3 && (
            <Step3Frequency
              frequency={frequency} setFrequency={setFrequency}
              startDate={startDate} setStartDate={setStartDate}
              startTime={startTime} setStartTime={setStartTime}
              times={times}
              handleAddTime={handleAddTime}
              handleRemoveTime={handleRemoveTime}
              updateTime={updateTime}
              getNextDoseText={getNextDoseText}
            />
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-[40px] flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
            >
              Voltar
            </Button>
          )}

          {step < 3 ? (
            <Button
              className="flex-[2] flex items-center justify-center gap-2"
              onClick={() => setStep(step + 1)}
            >
              Avançar <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="success"
              className="flex-[2] flex items-center justify-center gap-2"
              onClick={handleFinish}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Concluir'} <Check className="w-5 h-5" />
            </Button>
          )}
        </div>
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
