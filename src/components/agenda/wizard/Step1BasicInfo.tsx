import { useState, useEffect } from 'react';
import { Pill, Droplet, Beaker, Syringe, Box, Minus, Plus } from 'lucide-react';
import { Input } from '../../ui/Input';

interface Step1BasicInfoProps {
  name: string;
  setName: (name: string) => void;
  dosage: string;
  setDosage: (dosage: string) => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
}

const MED_TYPES = [
  { id: 'comprimido', label: 'Comprimido', icon: Pill },
  { id: 'gotas', label: 'Gotas', icon: Droplet },
  { id: 'ml', label: 'Líquido (ml)', icon: Beaker },
  { id: 'injecao', label: 'Injeção', icon: Syringe },
  { id: 'outro', label: 'Outro', icon: Box },
];

export function Step1BasicInfo({ name, setName, dosage, setDosage, instructions, setInstructions }: Step1BasicInfoProps) {
  // Estados locais para montar a instrução de forma visual
  const [medType, setMedType] = useState('comprimido');
  const [quantity, setQuantity] = useState(1);
  const [customDosage, setCustomDosage] = useState('');

  // Sincroniza os controles visuais com a string final de instructions
  useEffect(() => {
    if (medType === 'outro') {
      setInstructions(customDosage);
    } else {
      const typeLabel = MED_TYPES.find(t => t.id === medType)?.label.split(' ')[0].toLowerCase() || '';
      // Ex: "1 comprimido", "20 gotas", "5 ml"
      const suffix = quantity > 1 && medType === 'comprimido' ? 'comprimidos' : typeLabel;
      setInstructions(`${quantity} ${suffix}`);
    }
  }, [medType, quantity, customDosage, setInstructions]);

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">O que vamos tomar?</h3>
        <p className="text-gray-500 text-sm mb-4">Preencha o nome e a dosagem (em mg/ml).</p>
        
        <div className="flex flex-col gap-4">
          <Input
            label="Nome do Remédio"
            placeholder="Ex: Losartana Potássica"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Dosagem"
            placeholder="Ex: 50mg"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-gray-700 font-medium text-[15px] ml-1 mb-3 block">Instruções de Uso</label>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
          {MED_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = medType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setMedType(type.id)}
                className={`flex flex-col items-center justify-center gap-2 min-w-[88px] p-3 rounded-[24px] border-2 transition-all snap-start ${
                  isSelected 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-semibold text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {medType !== 'outro' ? (
        <div>
          <label className="text-gray-700 font-medium text-[15px] ml-1 mb-3 block">Quantidade por vez</label>
          <div className="flex items-center justify-between bg-[#F8FAFC] p-2 rounded-[24px] border border-gray-100">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-[var(--color-primary)] transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>
            
            <div className="text-2xl font-bold text-gray-800 flex items-baseline gap-2">
              {quantity}
              <span className="text-base font-medium text-gray-500">
                {medType === 'comprimido' ? (quantity > 1 ? 'comprimidos' : 'comprimido') : medType === 'ml' ? 'ml' : medType}
              </span>
            </div>

            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary)]/5 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-2">
          <Input
            label="Instrução Personalizada"
            placeholder="Ex: Aplicar na pele 2x"
            value={customDosage}
            onChange={(e) => setCustomDosage(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
