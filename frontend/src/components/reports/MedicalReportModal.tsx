import { useState, useEffect, useRef } from 'react';
import { Printer, Calendar, AlertCircle, User, Activity, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';

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

  // Dispara caixa de diálogo de impressão/salvar em PDF
  const handlePrint = () => {
    window.print();
  };

  // Avaliação textual da adesão
  const getAdherenceBadge = (percent: number) => {
    if (percent >= 90) return { label: 'Excelente Adesão', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (percent >= 70) return { label: 'Boa Adesão', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (percent >= 50) return { label: 'Adesão Moderada', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'Atenção Necessária', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible">
      
      {/* Estilos específicos para Impressão em PDF A4 */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .page-break-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Container Principal do Modal (Design Responsivo Mobile & Desktop) */}
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col print:max-h-none print:shadow-none print:rounded-none border-0 sm:border border-slate-100 dark:border-slate-800">
        
        {/* Cabeçalho Mobile Native Style (Oculto no Print) */}
        <div className="flex items-center justify-between px-5 py-4 bg-[var(--color-primary)] text-white shadow-md print:hidden shrink-0">
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
            onClick={handlePrint}
            disabled={loading || !!error}
            className="p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 rounded-2xl text-white transition-all flex items-center gap-1.5 text-xs font-semibold sm:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>

        {/* Barra de Filtro de Período (Pills Flutuantes Responsivas - Oculto no Print) */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto print:hidden shrink-0">
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
            onClick={handlePrint}
            disabled={loading || !!error}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-semibold text-xs rounded-xl shadow-md hover:bg-[var(--color-accent)] active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>

        {/* Área de Conteúdo do Relatório (Rolagem Suave) */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto print:overflow-visible print:p-0 bg-slate-50/50 dark:bg-slate-900 print:bg-white" ref={reportRef}>
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
            
            /* DOCUMENTO MÉDICO (Formatado para A4 / Impressão Profissional) */
            <div className="w-full max-w-3xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-2xl sm:shadow-sm border border-slate-200/80 print:border-0 print:p-0 print:shadow-none font-sans">
              
              {/* Header do Laudo/Relatório */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[var(--color-primary)] print:text-black" />
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 print:text-black">AgendaMed</h1>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Relatório Clínico de Adesão à Medicação</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Emissão</span>
                  <span className="text-sm font-bold text-slate-800 print:text-black">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Ficha Resumo do Paciente */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 print:bg-slate-50 print:border-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paciente</span>
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <User className="w-4 h-4 text-[var(--color-primary)] print:text-black shrink-0" />
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
              <div className="mb-7 page-break-avoid">
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
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white text-center print:bg-slate-900 print:text-white">
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
              <div className="mb-7 page-break-avoid">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Medicamentos em Prescrição</h3>
                {reportData.medications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum medicamento registrado.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">Medicamento</th>
                          <th className="p-2.5">Dosagem</th>
                          <th className="p-2.5">Frequência</th>
                          <th className="p-2.5">Horários</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.medications.map((med: any) => (
                          <tr key={med.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                            <td className="p-2.5 text-slate-600">{med.dosage}</td>
                            <td className="p-2.5 text-slate-600">{med.frequency}</td>
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
                )}
              </div>

              {/* Tabela 2: Registro Diário de Tomadas */}
              <div className="mb-7 page-break-avoid">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Histórico Diário de Registro (Últimos Check-ins)</h3>
                {reportData.historyLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum check-in registrado no período selecionado.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">Data</th>
                          <th className="p-2.5">Hora</th>
                          <th className="p-2.5">Medicamento</th>
                          <th className="p-2.5">Dosagem</th>
                          <th className="p-2.5 text-right">Registrado por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.historyLogs.slice(0, 25).map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-700">
                              {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{log.time}</td>
                            <td className="p-2.5 font-bold text-[var(--color-primary)] print:text-black">{log.medicationName}</td>
                            <td className="p-2.5 text-slate-600">{log.dosage}</td>
                            <td className="p-2.5 text-right text-slate-500 font-medium">{log.registeredBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bloco de Anotações Médicas & Assinatura (Print Ready) */}
              <div className="border-t-2 border-slate-200 pt-5 mt-6 page-break-avoid">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Anotações do Médico & Prescrição:</h4>
                <div className="min-h-[90px] border border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-3 text-xs text-slate-400">
                  Espaço reservado para observações da consulta, ajustes de dosagem ou carimbo/assinatura médica.
                </div>

                <div className="mt-8 pt-4 flex items-end justify-between text-[10px] text-slate-400 border-t border-slate-100">
                  <span>Documento gerado automaticamente pela plataforma AgendaMed</span>
                  <span>Assinatura / Carimbo do Médico: ___________________________</span>
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Floating Mobile Bottom Action Bar (Oculto no Print) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 print:hidden shrink-0">
          <button
            onClick={handlePrint}
            disabled={loading || !!error}
            className="w-full h-13 bg-[var(--color-primary)] text-white font-bold text-base rounded-2xl shadow-lg shadow-[var(--color-primary)]/25 hover:bg-[var(--color-accent)] active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir ou Salvar em PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
