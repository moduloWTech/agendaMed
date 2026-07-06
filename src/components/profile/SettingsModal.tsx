import { useState } from 'react';
import { X, CalendarHeart, Moon, Calendar, HelpCircle, Users, CheckCircle2 } from 'lucide-react';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [remindersConsultations, setRemindersConsultations] = useState(true);
  const [syncGoogle, setSyncGoogle] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 sm:p-8 border border-white flex flex-col gap-6 animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">Configurações</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[65vh] custom-scrollbar pb-2 pr-1">

          {/* Seção: Lembretes Essenciais */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Lembretes</h3>

            <div className="flex items-center justify-between bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                  <CalendarHeart className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-800">Alertar Consultas</span>
              </div>
              <Toggle checked={remindersConsultations} onChange={setRemindersConsultations} />
            </div>

            <div className="flex flex-col gap-2 px-1">
              <label className="text-gray-700 font-medium text-[15px]">Antecedência Padrão</label>
              <select className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[20px] px-4 py-3 text-gray-800 text-base outline-none transition-all cursor-pointer">
                <option value="1h">1 hora antes</option>
                <option value="2h">2 horas antes</option>
                <option value="1d">1 dia antes</option>
                <option value="2d">2 dias antes</option>
              </select>
            </div>
          </section>

          {/* Destaque: Lembrete de Medicamentos (Obrigatório) */}
          <section className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 p-5 rounded-[24px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--color-primary)]" />
                <h4 className="font-bold text-[var(--color-primary)]">Grupo da Família</h4>
              </div>
              <Toggle checked={true} disabled={true} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              O aviso de medicamentos para a rede de cuidadores é <strong className="text-[var(--color-primary)]">obrigatório</strong>.
            </p>
            <ul className="text-sm text-gray-500 space-y-1.5 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Horário administrado</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Quem deu o remédio</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Lista diária completa</li>
            </ul>
          </section>

          {/* Seção: Preferências */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Gerais</h3>

            <div className="flex items-center justify-between bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">Sincronizar Agenda</span>
                  <span className="text-[11px] text-gray-400">Google ou Apple Calendar</span>
                </div>
              </div>
              <Toggle checked={syncGoogle} onChange={setSyncGoogle} />
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 text-gray-600 rounded-xl">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-800">Modo Escuro</span>
              </div>
              <Toggle checked={darkMode} onChange={setDarkMode} />
            </div>
          </section>

          {/* Botão Central de Ajuda */}
          <button className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 rounded-[24px] transition-colors border border-gray-200 mt-2 font-semibold">
            <HelpCircle className="w-5 h-5" />
            Central de Ajuda
          </button>
        </div>

        {/* Footer */}
        <div className="mt-2">
          <Button fullWidth onClick={onClose}>
            Salvar e Fechar
          </Button>
        </div>

      </div>
    </div>
  );
}
