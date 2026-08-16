import { Input } from '../../ui/Input';

interface Step1BasicInfoProps {
  name: string;
  setName: (name: string) => void;
  dosage: string;
  setDosage: (dosage: string) => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
}

export function Step1BasicInfo({
  name,
  setName,
  dosage,
  setDosage,
  instructions,
  setInstructions,
}: Step1BasicInfoProps) {
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">
          O que vamos tomar?
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
          Preencha o nome, dosagem e observações do medicamento.
        </p>

        <div className="flex flex-col gap-4">
          {/* Nome do Medicamento */}
          <Input
            label="Nome do Remédio"
            placeholder="Ex: Losartana Potássica"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Dosagem (Estritamente máx 5 caracteres) */}
          <div>
            <div className="flex items-center justify-between mb-1 ml-1">
              <span className="text-gray-700 dark:text-slate-300 font-medium text-[16px]">
                Dosagem
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {dosage.length}/5 caracteres
              </span>
            </div>
            <Input
              placeholder="Ex: 50mg, 20ml, 1cp"
              maxLength={5}
              value={dosage}
              onChange={(e) => setDosage(e.target.value.slice(0, 5))}
            />
          </div>

          {/* Recomendações / Comentários (Estritamente máx 50 caracteres) */}
          <div>
            <div className="flex items-center justify-between mb-1 ml-1">
              <span className="text-gray-700 dark:text-slate-300 font-medium text-[16px]">
                Recomendações / Observações
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {instructions.length}/50 caracteres
              </span>
            </div>
            <Input
              placeholder="Ex: Tomar após o almoço com água"
              maxLength={50}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 50))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
