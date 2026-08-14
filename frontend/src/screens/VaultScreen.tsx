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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!activePatient) {
    return (
      <div className="flex flex-col w-full h-full min-h-screen bg-[#F4F7FA] dark:bg-slate-900 px-4 pt-12 items-center justify-center text-center">
        <FileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
        <p className="text-gray-500 dark:text-slate-400 font-medium">Selecione ou crie um paciente no Perfil para ver o Prontuário.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 📱 MODO MOBILE HOMOLOGADO (Visível exclusivamente em < md)     */}
      {/* ============================================================ */}
      <div className="flex flex-col w-full h-full min-h-screen bg-[#F4F7FA] dark:bg-slate-900 md:hidden">
        {/* Header Mobile */}
        <div className="w-full bg-white dark:bg-slate-900 px-6 pt-12 pb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] dark:shadow-none rounded-b-[40px] sticky top-0 z-40">
          <h1 className="text-3xl font-extrabold text-[var(--color-primary)] dark:text-slate-100 tracking-tight mb-2">Prontuário</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mb-6 text-sm">Gerencie laudos, receitas e exames de forma segura.</p>

          <div className="w-full bg-[#F8FAFC] dark:bg-slate-800 h-14 rounded-[24px] border-2 border-transparent flex items-center px-4 gap-3 text-gray-400 dark:text-slate-500">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full text-slate-800 dark:text-slate-200 outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* Conteúdo Mobile */}
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
            <span className="text-sm font-bold text-[var(--color-accent)]">Total: {filteredDocuments.length}</span>
          </div>

          <div className="flex flex-col gap-1">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
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

        {/* FAB (Floating Action Button Mobile) */}
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-full max-w-md mx-auto flex justify-center z-40 pointer-events-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--color-primary)] text-white h-16 px-8 rounded-[32px] flex items-center justify-center gap-2 shadow-xl shadow-[var(--color-primary)]/20 hover:bg-[var(--color-accent)] active:scale-95 transition-all duration-300 pointer-events-auto border border-[var(--color-primary)]/50"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
            <span className="font-bold text-lg">Adicionar Documento</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🖥️ MODO DESKTOP & TABLET DEDICADO (Visível a partir de md:)    */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col gap-8 w-full pt-2 animate-in fade-in duration-300">
        
        {/* Hero Banner Desktop */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0A2540] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-800">
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4" />
              <span>Cofre Digital & Prontuário Médico</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Documentos & Exames • {activePatient.name}
            </h1>
            
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Centralize prescrições médicas, laudos laboratoriais e gere relatórios clínicos em PDF com 1 clique para as consultas.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Gerar Relatório PDF</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Documento</span>
            </button>
          </div>

          {/* Glow decorativo de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Barra de Busca e Filtros por Categoria */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          
          {/* Campo de Busca */}
          <div className="w-full sm:w-80 bg-slate-100 dark:bg-slate-900/80 h-11 rounded-xl flex items-center px-3.5 gap-2.5 text-slate-400 dark:text-slate-500 border border-transparent focus-within:border-[var(--color-primary)] transition-all">
            <Search className="w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Buscar pelo título do documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full text-slate-800 dark:text-slate-100 outline-none text-xs font-semibold"
            />
          </div>

          {/* Filtros de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'recipe', label: 'Receitas' },
              { id: 'exam', label: 'Exames' },
              { id: 'report', label: 'Laudos' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Grid de Documentos Desktop */}
        <div className="w-full">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-[var(--color-primary)] dark:text-cyan-400">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Nenhum documento encontrado</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
                Guarde receitas médicas, fotos de medicamentos e laudos de exames para acesso rápido de toda a equipe.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[var(--color-accent)] transition-all cursor-pointer"
              >
                + Enviar o Primeiro Documento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  title={doc.title} 
                  date={new Date(doc.date).toLocaleDateString('pt-BR')} 
                  type={doc.category === 'recipe' ? 'pdf' : 'image'} 
                  url={doc.fileUrl}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal de Adicionar Documento */}
      {isModalOpen && (
        <AddDocumentModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* Modal de Relatório Médico */}
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

