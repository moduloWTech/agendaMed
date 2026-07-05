import { FileText, Image as ImageIcon, Download } from 'lucide-react';

interface DocumentCardProps {
  title: string;
  date: string;
  type: 'pdf' | 'image';
}

export function DocumentCard({ title, date, type }: DocumentCardProps) {
  const Icon = type === 'pdf' ? FileText : ImageIcon;
  
  return (
    <div className="bg-white w-full p-4 rounded-[24px] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 mb-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      
      <div className="flex items-center gap-4">
        <div className={`
          w-14 h-14 rounded-[18px] flex items-center justify-center
          ${type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-[var(--color-secondary)]/50 text-[var(--color-primary)]'}
        `}>
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        
        <div>
          <h3 className="font-bold text-[var(--color-primary)] text-lg line-clamp-1">{title}</h3>
          <p className="text-gray-400 font-medium text-sm mt-0.5">{date}</p>
        </div>
      </div>

      <button className="w-12 h-12 rounded-full bg-[#F4F7FA] flex items-center justify-center text-[var(--color-primary)] hover:bg-gray-100 transition-colors flex-shrink-0">
        <Download className="w-5 h-5" strokeWidth={2.5} />
      </button>

    </div>
  );
}
