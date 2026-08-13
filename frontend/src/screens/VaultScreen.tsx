import { useState, useEffect } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { DocumentCard } from '../components/vault/DocumentCard';
import { AddDocumentModal } from '../components/vault/AddDocumentModal';
import { MedicalReportModal } from '../components/reports/MedicalReportModal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function VaultScreen() {
  const { activePatient } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDocuments() {
      if (!activePatient) return;
      try {
        const data = await api.get(`/api/patients/${activePatient.id}/documents`);
        setDocuments(data || []);
      } catch (error) {
        console.error('Falha ao buscar documentos', error);
      }
    }
    fetchDocuments();
  }, [activePatient]);

  if (!activePatient) {
    return (
      <div className="flex flex-col w-full h-full min-h-screen bg-[#F4F7FA] dark:bg-slate-900 px-4 pt-12 items-center justify-center text-center">
        <FileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
        <p className="text-gray-500 dark:text-slate-400 font-medium">Selecione ou crie um paciente no Perfil para ver o Prontuário.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#F4F7FA] dark:bg-slate-900">

      {/* Header */}
      <div className="w-full bg-white dark:bg-slate-900 px-6 pt-12 pb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] dark:shadow-none rounded-b-[40px] sticky top-0 z-40">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)] dark:text-slate-100 tracking-tight mb-2">Prontuário</h1>
        <p className="text-gray-500 dark:text-slate-400 font-medium mb-6 text-sm">Gerencie laudos, receitas e exames de forma segura.</p>

        {/* Search Bar Falsa */}
        <div className="w-full bg-[#F8FAFC] dark:bg-slate-800 h-14 rounded-[24px] border-2 border-transparent flex items-center px-4 gap-3 text-gray-400 dark:text-slate-500">
          <Search className="w-5 h-5" />
          <span className="font-medium">Buscar documento...</span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-6 pt-8 pb-32">

        {/* Banner Gerar Relatório Médico */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="w-full mb-6 p-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-2xl flex items-center justify-between shadow-md hover:opacity-95 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <span className="font-bold text-sm block">Gerar Relatório Médico (PDF)</span>
              <span className="text-xs text-white/80 block">Histórico completo de adesão para a consulta</span>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap">Gerar PDF</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Documentos Recentes</h2>
          <span className="text-sm font-bold text-[var(--color-accent)]">Ver Todos</span>
        </div>

        <div className="flex flex-col gap-1">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                title={doc.title} 
                date={new Date(doc.date).toLocaleDateString('pt-BR')} 
                type={doc.category === 'recipe' ? 'pdf' : 'image'} 
                url={doc.fileUrl}
              />
            ))
          ) : (
             <div className="text-center text-gray-400 dark:text-slate-500 py-12">
               <p>Nenhum documento encontrado.</p>
             </div>
          )}
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-full max-w-md mx-auto flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-primary)] text-white h-16 px-8 rounded-[32px] flex items-center justify-center gap-2 shadow-xl shadow-[var(--color-primary)]/20 hover:bg-[var(--color-accent)] active:scale-95 transition-all duration-300 pointer-events-auto border border-[var(--color-primary)]/50"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
          <span className="font-bold text-lg">Adicionar Documento</span>
        </button>
      </div>

      {isModalOpen && (
        <AddDocumentModal onClose={() => setIsModalOpen(false)} />
      )}

      {isReportModalOpen && activePatient && (
        <MedicalReportModal
          patientId={activePatient.id}
          patientName={activePatient.name}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}

