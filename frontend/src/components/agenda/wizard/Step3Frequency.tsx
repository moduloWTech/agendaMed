import { Plus, Trash2 } from 'lucide-react';

interface Step3FrequencyProps {
  frequency: string;
  setFrequency: (freq: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  times: string[];
  handleAddTime: () => void;
  handleRemoveTime: (index: number) => void;
  updateTime: (index: number, value: string) => void;
  getNextDoseText: () => string;
}

export function Step3Frequency({
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  times,
  handleAddTime,
  handleRemoveTime,
  updateTime,
  getNextDoseText,
}: Step3FrequencyProps) {
  return (
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
  );
}
