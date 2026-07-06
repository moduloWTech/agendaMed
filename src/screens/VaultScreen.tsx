import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DocumentCard } from '../components/vault/DocumentCard';
import { AddDocumentModal } from '../components/vault/AddDocumentModal';

const mockDocuments = [
  { id: 1, title: 'Receita - Cardiologista', date: 'Hoje, 14:30', type: 'pdf' as const },
  { id: 2, title: 'Exame de Sangue', date: 'Ontem', type: 'image' as const },
  { id: 3, title: 'Laudo Tomografia', date: '10 Nov 2023', type: 'pdf' as const },
];

export function VaultScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#F4F7FA]">

      {/* Header */}
      <div className="w-full bg-white px-6 pt-12 pb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] rounded-b-[40px] sticky top-0 z-40">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight mb-2">Prontuário</h1>
        <p className="text-gray-500 font-medium mb-6 text-sm">Gerencie laudos, receitas e exames de forma segura.</p>

        {/* Search Bar Falsa */}
        <div className="w-full bg-[#F8FAFC] h-14 rounded-[24px] border-2 border-transparent flex items-center px-4 gap-3 text-gray-400">
          <Search className="w-5 h-5" />
          <span className="font-medium">Buscar documento...</span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-6 pt-8 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Documentos Recentes</h2>
          <span className="text-sm font-bold text-[var(--color-accent)]">Ver Todos</span>
        </div>

        <div className="flex flex-col gap-1">
          {mockDocuments.map((doc) => (
            <DocumentCard key={doc.id} title={doc.title} date={doc.date} type={doc.type} />
          ))}
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <div className="fixed bottom-[100px] left-0 w-full max-w-md mx-auto flex justify-center z-40 pointer-events-none">
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
    </div>
  );
}
