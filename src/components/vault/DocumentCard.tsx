import { FileText, Image as ImageIcon, Download } from 'lucide-react';

interface DocumentCardProps {
  title: string;
  date: string;
  type: 'pdf' | 'image';
  url?: string;
}

export function DocumentCard({ title, date, type, url }: DocumentCardProps) {
  const Icon = type === 'pdf' ? FileText : ImageIcon;
  
  const handleDownload = async () => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `http://localhost:3333${url}`;
    try {
      // Tenta baixar o arquivo para forçar o download (evita abrir direto no navegador)
      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error('Erro ao baixar');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      // Extrai a extensão real da URL ou cai para jpg
      let extension = url.split('.').pop()?.split('?')[0] || 'jpg';
      if (extension.length > 4) extension = 'jpg'; // fallback de segurança
      a.download = `${title.replace(/\s+/g, '_')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      
      // Limpeza
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Fallback para abrir em nova guia', err);
      // Fallback: se houver problema de CORS, abre na guia
      window.open(finalUrl, '_blank');
    }
  };

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

      <button 
        onClick={handleDownload}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${url ? 'bg-[#F4F7FA] text-[var(--color-primary)] hover:bg-gray-100 cursor-pointer' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
        disabled={!url}
        title={url ? "Fazer Download" : "Arquivo indisponível"}
      >
        <Download className="w-5 h-5" strokeWidth={2.5} />
      </button>

    </div>
  );
}
