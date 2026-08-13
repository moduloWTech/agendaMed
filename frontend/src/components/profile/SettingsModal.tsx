import { useState } from 'react';
import { X, HelpCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePwaUpdate } from '../../contexts/PwaUpdateContext';
import { api } from '../../services/api';
import { FeedbackModal } from '../ui/FeedbackModal';
import { Button } from '../ui/Button';
import { IntensiveAlertSetting } from './IntensiveAlertSetting';
import { BaseAdvanceSetting } from './BaseAdvanceSetting';
import { GeneralPreferencesSection } from './GeneralPreferencesSection';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, updateUserPreferences } = useAuth();

  const [remindersConsultations, setRemindersConsultations] = useState(user?.defaultIntensiveAlerts ?? true);
  const [baseAdvance, setBaseAdvance] = useState(user?.defaultAlertAdvance ?? '24h');
  const [syncGoogle, setSyncGoogle] = useState(user?.syncGoogle ?? false);
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const { needRefresh, updateApp } = usePwaUpdate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleSaveAndClose = async () => {
    if (!user) {
      onClose();
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        defaultIntensiveAlerts: remindersConsultations,
        defaultAlertAdvance: baseAdvance,
        syncGoogle,
        darkMode
      };
      await api.patch(`/api/users/${user.id}/preferences`, payload);
      updateUserPreferences(payload);
    } catch (error) {
      console.error('Erro ao salvar preferências', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleSaveAndClose}
      />

      {/* Container */}
      <div className="relative bg-[#F4F7FA] dark:bg-slate-900 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 z-10">
          <h2 className="text-xl font-bold text-[var(--color-primary)] dark:text-white">Configurações</h2>
          <button onClick={handleSaveAndClose} className="p-2 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-300 hover:text-gray-600 dark:hover:text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[65vh] custom-scrollbar pb-2 pr-1 p-6">

          {/* Seção: Lembretes Essenciais */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Consultas e Exames</h3>

            <IntensiveAlertSetting checked={remindersConsultations} onChange={setRemindersConsultations} />

            <BaseAdvanceSetting value={baseAdvance} onChange={setBaseAdvance} />
          </section>

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

        </div>

        {/* Footer */}
        <div className="p-6 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 z-10 flex flex-col gap-3">
          
          <button 
            className="flex items-center justify-center gap-2 py-3 px-4 w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 font-bold rounded-[16px] transition-all"
            onClick={() => {}}
          >
            <HelpCircle className="w-5 h-5" />
            Central de Ajuda
          </button>
        <div className="mt-2">
          <Button fullWidth onClick={handleSaveAndClose} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar e Fechar'}
          </Button>
        </div>
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
