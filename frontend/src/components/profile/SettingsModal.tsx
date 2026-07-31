import { useState } from 'react';
import { X, HelpCircle, RefreshCw } from 'lucide-react';
import { usePwaUpdate } from '../../contexts/PwaUpdateContext';
import { FeedbackModal } from '../ui/FeedbackModal';
import { Button } from '../ui/Button';
import { IntensiveAlertSetting } from './IntensiveAlertSetting';
import { BaseAdvanceSetting } from './BaseAdvanceSetting';
import { GeneralPreferencesSection } from './GeneralPreferencesSection';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [remindersConsultations, setRemindersConsultations] = useState(true);
  const [syncGoogle, setSyncGoogle] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { needRefresh, updateApp } = usePwaUpdate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Consultas e Exames</h3>

            <IntensiveAlertSetting checked={remindersConsultations} onChange={setRemindersConsultations} />

            <BaseAdvanceSetting />
          </section>

          {/* Destaque: Lembrete de Medicamentos (Obrigatório) Esta feature será desenvolvida mais tarde*/}
          {/* <section className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 p-5 rounded-[24px]">
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
          </section> */}

          {/* Seção: Preferências */}
          <GeneralPreferencesSection
            syncGoogle={syncGoogle}
            setSyncGoogle={setSyncGoogle}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          {/* Seção: Atualização do App */}
          {needRefresh && (
            <section className="flex flex-col gap-4 mt-2">
              <div
                className="flex items-center justify-between bg-red-50 p-4 rounded-[20px] shadow-sm border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => setShowUpdateModal(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 text-white rounded-xl shadow-sm">
                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-red-700">Atualizar Aplicativo</span>
                    <span className="text-[11px] text-red-600">Nova versão disponível!</span>
                  </div>
                </div>
                <button className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-full shadow-sm">
                  Baixar
                </button>
              </div>
            </section>
          )}

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

      <FeedbackModal
        isOpen={showUpdateModal}
        title="Nova Versão!"
        message="Deseja aplicar a nova atualização agora? O aplicativo será reiniciado para baixar as novidades."
        type="info"
        onClose={() => setShowUpdateModal(false)}
        onConfirm={updateApp}
        confirmText="Sim, atualizar"
      />
    </div>
  );
}
