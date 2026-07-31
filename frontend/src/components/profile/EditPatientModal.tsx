interface EditPatientModalProps {
  onClose: () => void;
  newPatientName: string;
  setNewPatientName: (name: string) => void;
  isSavingPatient: boolean;
  onSave: () => void;
}

export function EditPatientModal({
  onClose,
  newPatientName,
  setNewPatientName,
  isSavingPatient,
  onSave
}: EditPatientModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSavingPatient && onClose()} />
      <div className="relative bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Editar Nome</h3>
        <p className="text-sm text-gray-500 mb-6">Como vocês chamam o familiar que estão cuidando?</p>
        
        <input 
          type="text" 
          value={newPatientName}
          onChange={(e) => setNewPatientName(e.target.value)}
          className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all mb-6"
          placeholder="Ex: Dona Maria, Vovô João..."
          autoFocus
        />

        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
            onClick={onClose}
            disabled={isSavingPatient}
          >
            Cancelar
          </button>
          <button 
            className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:bg-[var(--color-accent)] transition-all disabled:opacity-50"
            onClick={onSave}
            disabled={isSavingPatient || !newPatientName.trim()}
          >
            {isSavingPatient ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
