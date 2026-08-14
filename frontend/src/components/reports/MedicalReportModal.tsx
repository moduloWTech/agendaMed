import { useState, useEffect, useRef } from 'react';
import { Calendar, AlertCircle, User, Activity, ChevronLeft, Download } from 'lucide-react';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MedicalReportModalProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

export function MedicalReportModal({ patientId, patientName, onClose }: MedicalReportModalProps) {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);

  // Calcula datas padrão ao alterar o período rápido
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - periodDays);

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
  }, [periodDays]);

  // Carrega os dados do relatório do backend
  const fetchReportData = async () => {
    if (!patientId || !startDate || !endDate) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/patients/${patientId}/report-data?startDate=${startDate}&endDate=${endDate}`);
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao carregar dados do relatório.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, patientId]);

  // Gera e baixa o arquivo PDF nativo vetorial diretamente a partir dos dados da API
  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = '#1E3A8A'; // Azul escuro corporativo/médico
    const darkTextColor = '#0F172A';
    const grayTextColor = '#64748B';

    // 1. Cabeçalho Principal (Título e Subtítulo)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('AgendaMed', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(grayTextColor);
    doc.text('Relatório Clínico de Adesão à Medicação', 14, 27);

    // Data de Emissão à direita
    const emitDate = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(9);
    doc.setTextColor(grayTextColor);
    doc.text('Data de Emissão:', 196, 20, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkTextColor);
    doc.text(emitDate, 196, 26, { align: 'right' });

    // Linha divisória sob o cabeçalho
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.8);
    doc.line(14, 31, 196, 31);

    // 2. Ficha do Paciente
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 35, 182, 22, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, 35, 182, 22, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(grayTextColor);
    doc.text('PACIENTE', 18, 41);
    doc.text('PERÍODO DE ANÁLISE', 110, 41);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkTextColor);
    doc.text(reportData.patient?.name || patientName || 'Paciente', 18, 49);

    const startFormatted = new Date(reportData.period.startDate + 'T00:00:00').toLocaleDateString('pt-BR');
    const endFormatted = new Date(reportData.period.endDate + 'T00:00:00').toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${startFormatted} a ${endFormatted} (${reportData.period.daysCount} dias)`, 110, 49);

    // 3. Métricas de Adesão ao Tratamento
    let currentY = 64;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(grayTextColor);
    doc.text('RESUMO DE ADESÃO AO TRATAMENTO', 14, currentY);

    currentY += 4;
    // Card 1: Taxa de Adesão (%)
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(14, currentY, 56, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#FFFFFF');
    doc.text('TAXA DE SUCECO', 42, currentY + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${reportData.metrics.adherencePercentage}%`, 42, currentY + 14, { align: 'center' });

    // Card 2: Doses Programadas
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(77, currentY, 56, 18, 3, 3, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(77, currentY, 56, 18, 3, 3, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#1E40AF');
    doc.text('DOSES PREVISTAS', 105, currentY + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${reportData.metrics.totalScheduledDoses}`, 105, currentY + 14, { align: 'center' });

    // Card 3: Doses Confirmadas
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(140, currentY, 56, 18, 3, 3, 'F');
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(140, currentY, 56, 18, 3, 3, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#065F46');
    doc.text('DOSES TOMADAS', 168, currentY + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${reportData.metrics.takenDoses}`, 168, currentY + 14, { align: 'center' });

    currentY += 24;

    // 4. Tabela de Medicamentos Em Prescrição
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(grayTextColor);
    doc.text('MEDICAMENTOS EM PRESCRIÇÃO', 14, currentY);
    currentY += 3;

    const medsData = (reportData.medications || []).map((m: any) => [
      m.name,
      m.dosage,
      m.frequency,
      m.times?.join(', ') || '-',
      m.active ? 'Ativo' : 'Inativo',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Medicamento', 'Dosagem', 'Frequência', 'Horários', 'Status']],
      body: medsData.length > 0 ? medsData : [['Nenhum medicamento registrado', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // 5. Tabela de Registros Diários (Check-ins)
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(grayTextColor);
    doc.text('HISTÓRICO DIÁRIO DE REGISTROS (ÚLTIMOS CHECK-INS)', 14, currentY);
    currentY += 3;

    const logsData = (reportData.historyLogs || []).slice(0, 30).map((log: any) => [
      new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR'),
      log.time,
      log.medicationName,
      log.dosage,
      log.registeredBy || 'Cuidador',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Data', 'Hora', 'Medicamento', 'Dosagem', 'Registrado por']],
      body: logsData.length > 0 ? logsData : [['Nenhum check-in registrado no período', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // 6. Campo para Anotações Médicas & Assinatura
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(grayTextColor);
    doc.text('ANOTAÇÕES E PRESCRIÇÃO MÉDICA (USO EXCLUSIVO DO MÉDICO):', 14, currentY);

    currentY += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, currentY, 182, 20, 2, 2, 'FD');
    doc.setLineDashPattern([], 0);

    currentY += 28;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayTextColor);
    doc.text('Documento gerado automaticamente pela plataforma AgendaMed', 14, currentY);
    doc.text('Assinatura / Carimbo do Médico: ___________________________', 196, currentY, { align: 'right' });

    // Salva e força o download direto do arquivo PDF
    const filename = `Relatorio_Medico_${(patientName || 'Paciente').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  // Avaliação textual da adesão para visualização na tela
  const getAdherenceBadge = (percent: number) => {
    if (percent >= 90) return { label: 'Excelente Adesão', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (percent >= 70) return { label: 'Boa Adesão', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (percent >= 50) return { label: 'Adesão Moderada', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'Atenção Necessária', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      
      {/* Container Principal do Modal (Design Responsivo Mobile Native) */}
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-0 sm:border border-slate-100 dark:border-slate-800">
        
        {/* Cabeçalho Mobile Native Style */}
        <div className="flex items-center justify-between px-5 py-4 bg-[var(--color-primary)] text-white shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold tracking-tight leading-tight">Relatório de Adesão</h2>
              <p className="text-xs text-white/80 font-medium">Paciente: {patientName}</p>
            </div>
          </div>
          
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !!error}
            className="p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 rounded-2xl text-white transition-all flex items-center gap-1.5 text-xs font-semibold sm:hidden"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>

        {/* Barra de Filtro de Período (Pills Flutuantes Responsivas) */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Período:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
            {[7, 15, 30, 60].map((days) => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                  periodDays === days
                    ? 'bg-[var(--color-primary)] text-white shadow-sm scale-105'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                }`}
              >
                {days} dias
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={loading || !!error}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-semibold text-xs rounded-xl shadow-md hover:bg-[var(--color-accent)] active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4" /> Baixar Relatório PDF
          </button>
        </div>

        {/* Área de Visualização do Conteúdo na Tela */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900" ref={reportRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Consolidando histórico de saúde...</p>
            </div>
          ) : error ? (
            <div className="p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : reportData ? (
            
            <div className="w-full max-w-3xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-2xl sm:shadow-sm border border-slate-200/80 font-sans">
              
              {/* Header de Prévia na Tela */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[var(--color-primary)]" />
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">AgendaMed</h1>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Relatório Clínico de Adesão à Medicação</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Emissão</span>
                  <span className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Ficha Resumo do Paciente */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paciente</span>
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <User className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                      {reportData.patient.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Período de Análise</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block">
                      {new Date(reportData.period.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(reportData.period.endDate + 'T00:00:00').toLocaleDateString('pt-BR')} ({reportData.period.daysCount} dias)
                    </span>
                  </div>
                </div>
              </div>

              {/* Placa de Avaliação de Adesão */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Índice de Adesão ao Tratamento</h3>
                  {(() => {
                    const badge = getAdherenceBadge(reportData.metrics.adherencePercentage);
                    return (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Taxa Sucesso</span>
                    <span className="text-2xl font-black">{reportData.metrics.adherencePercentage}%</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Doses Previstas</span>
                    <span className="text-2xl font-black text-blue-900">{reportData.metrics.totalScheduledDoses}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Doses Tomadas</span>
                    <span className="text-2xl font-black text-emerald-900">{reportData.metrics.takenDoses}</span>
                  </div>
                </div>
              </div>

              {/* Tabela 1: Medicamentos em Uso */}
              <div className="mb-7">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Medicamentos em Prescrição</h3>
                {reportData.medications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum medicamento registrado.</p>
                ) : (
                  <>
                    {/* Visualização Mobile: Cards Verticais */}
                    <div className="flex flex-col gap-2.5 sm:hidden">
                      {reportData.medications.map((med: any) => (
                        <div key={med.id} className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{med.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${med.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                              {med.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                            <span><strong className="text-slate-400 font-semibold">Dosagem:</strong> {med.dosage}</span>
                            <span>•</span>
                            <span><strong className="text-slate-400 font-semibold">Frequência:</strong> {med.frequency}</span>
                          </div>

                          {med.times && med.times.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                              <span className="text-[11px] font-semibold text-slate-400">⏰ Horários:</span>
                              <div className="flex flex-wrap gap-1">
                                {med.times.map((time: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[11px] font-bold">
                                    {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Visualização Desktop: Tabela Tradicional */}
                    <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                            <th className="p-2.5">Medicamento</th>
                            <th className="p-2.5">Dosagem</th>
                            <th className="p-2.5">Frequência</th>
                            <th className="p-2.5">Horários</th>
                            <th className="p-2.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reportData.medications.map((med: any) => (
                            <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                              <td className="p-2.5 text-slate-700 font-medium">{med.dosage}</td>
                              <td className="p-2.5 text-slate-700 font-medium">{med.frequency}</td>
                              <td className="p-2.5 font-semibold text-slate-800">{med.times?.join(', ') || '-'}</td>
                              <td className="p-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${med.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                  {med.active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Tabela 2: Registro Diário de Tomadas */}
              <div className="mb-7">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Histórico Diário de Registro (Últimos Check-ins)</h3>
                {reportData.historyLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum check-in registrado no período selecionado.</p>
                ) : (
                  <>
                    {/* Visualização Mobile: Cards de Check-in */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      {reportData.historyLogs.slice(0, 30).map((log: any) => (
                        <div key={log.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-semibold">
                                📅 {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-md">
                                ⏰ {log.time}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {log.dosage}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                            <span className="font-bold text-xs text-[var(--color-primary)] dark:text-blue-400">
                              💊 {log.medicationName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              👤 {log.registeredBy}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Visualização Desktop: Tabela Tradicional */}
                    <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                            <th className="p-2.5">Data</th>
                            <th className="p-2.5">Hora</th>
                            <th className="p-2.5">Medicamento</th>
                            <th className="p-2.5">Dosagem</th>
                            <th className="p-2.5 text-right">Registrado por</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reportData.historyLogs.slice(0, 25).map((log: any) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-2.5 font-semibold text-slate-700">
                                {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-2.5 font-black text-slate-900">{log.time}</td>
                              <td className="p-2.5 font-bold text-[var(--color-primary)]">{log.medicationName}</td>
                              <td className="p-2.5 text-slate-700 font-medium">{log.dosage}</td>
                              <td className="p-2.5 text-right text-slate-700 font-medium">{log.registeredBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

            </div>
          ) : null}
        </div>

        {/* Floating Mobile Bottom Action Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !!error}
            className="w-full h-13 bg-[var(--color-primary)] text-white font-bold text-base rounded-2xl shadow-lg shadow-[var(--color-primary)]/25 hover:bg-[var(--color-accent)] active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>Baixar Relatório PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
