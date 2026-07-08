import { useState } from 'react';
import { X, Camera, Plus, Trash2, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AddMedicationWizardProps {
  onClose: () => void;
}

export function AddMedicationWizard({ onClose }: AddMedicationWizardProps) {
  const { activePatient } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // States
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');

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
      alert('Selecione um paciente ativo primeiro.');
      return;
    }
    if (!name || !dosage) {
      alert('Preencha o nome e a dosagem do medicamento.');
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/medications', {
        name,
        dosage,
        frequency,
        startDate: frequency === 'manual' ? new Date().toISOString() : new Date(startDate).toISOString(),
        startTime: frequency === 'manual' ? times[0] : startTime,
        times: frequency === 'manual' ? times : [],
        patientId: activePatient.id,
        active: true
      });
      window.location.reload(); // Recarrega a tela para buscar novos dados
    } catch (error: any) {
      alert('Erro ao salvar medicamento: ' + (error.message || 'Erro desconhecido'));
      setIsLoading(false);
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
            <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Qual o medicamento?</h3>
                <p className="text-gray-500 text-sm mb-4">Informe o nome exatamente como está na receita.</p>
                <Input
                  label="Nome do Remédio"
                  placeholder="Ex: Losartana Potássica"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Dosagem / Instruções"
                  placeholder="Ex: 50mg - 1 comprimido"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Passo 2: Foto */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300 h-full">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Foto da Caixa</h3>
                <p className="text-gray-500 text-sm mb-4">Ajuda o cuidador a não confundir os remédios.</p>
              </div>

              <div className="flex-1 min-h-[200px] border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 rounded-[32px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors">
                <div className="p-4 bg-white rounded-full shadow-sm text-[var(--color-primary)]">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="font-semibold text-[var(--color-primary)]">Tirar foto agora</span>
              </div>
            </div>
          )}

          {/* Passo 3: Horários */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Frequência</h3>
                <p className="text-gray-500 text-sm mb-4">De quanto em quanto tempo?</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-[15px] ml-1">Intervalo</label>
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

                {frequency === 'manual' && (
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
                      <Plus className="w-5 h-5" />
                      Adicionar outro horário
                    </button>
                  </div>
                )}

                {frequency !== 'manual' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-700 font-medium text-[15px] ml-1">Data da Primeira Dose</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-700 font-medium text-[15px] ml-1">Horário da Primeira Dose</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all cursor-pointer text-center"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-[var(--color-primary)]/5 text-[var(--color-primary)] p-4 rounded-[20px] text-sm text-center border border-[var(--color-primary)]/20 mt-2">
                  <span className="font-semibold block mb-1">Como funciona:</span>
                  <span className="opacity-90 leading-relaxed">{getNextDoseText()}</span>
                </div>
              </div>
            </div>
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
    </div>
  );
}
